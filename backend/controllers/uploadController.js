const path = require("path");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { s3, S3_BUCKET } = require("../config/aws-config");
const Repository = require("../models/repoModel");

const URL_TTL_SECONDS = 300;
const CONTENT_TYPE = /^[\w.+-]+\/[\w.+-]+$/;

// Returns the repository when the caller owns it; otherwise sends the error response.
async function loadOwnedRepo(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid repository id" });
    return null;
  }
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: "Database not connected" });
    return null;
  }
  const repo = await Repository.findById(id);
  if (!repo) {
    res.status(404).json({ error: "Repository not found" });
    return null;
  }
  if (String(repo.owner) !== String(req.user && req.user.id)) {
    res.status(403).json({ error: "Only the repository owner can access its objects" });
    return null;
  }
  return repo;
}

// POST /repos/:id/upload-url  { filename, contentType? }
// Returns a short-lived pre-signed PUT URL; the file goes straight from the client to S3.
async function createUploadUrl(req, res) {
  try {
    const { filename, contentType } = req.body || {};
    if (typeof filename !== "string" || !filename.trim() || filename.length > 200) {
      return res.status(400).json({ error: "filename is required (max 200 characters)" });
    }
    const type = contentType || "application/octet-stream";
    if (typeof type !== "string" || !CONTENT_TYPE.test(type)) {
      return res.status(400).json({ error: "Invalid contentType" });
    }

    const repo = await loadOwnedRepo(req, res);
    if (!repo) return;

    const safeName = path.basename(filename).replace(/[^\w.-]/g, "_");
    const key = `repos/${repo._id}/${uuidv4()}-${safeName}`;

    const url = await s3.getSignedUrlPromise("putObject", {
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: type,
      Expires: URL_TTL_SECONDS,
    });

    res.status(201).json({
      url,
      key,
      bucket: S3_BUCKET,
      method: "PUT",
      headers: { "Content-Type": type },
      expiresIn: URL_TTL_SECONDS,
    });
  } catch (err) {
    console.error("Error creating upload URL:", err.message);
    res.status(500).json({ error: "Could not create upload URL" });
  }
}

// GET /repos/:id/download-url?key=repos/<id>/<object>
async function createDownloadUrl(req, res) {
  try {
    const { key } = req.query;
    if (typeof key !== "string" || !key) {
      return res.status(400).json({ error: "key query parameter is required" });
    }

    const repo = await loadOwnedRepo(req, res);
    if (!repo) return;

    if (!key.startsWith(`repos/${repo._id}/`) || key.includes("..")) {
      return res.status(400).json({ error: "key does not belong to this repository" });
    }

    const url = await s3.getSignedUrlPromise("getObject", {
      Bucket: S3_BUCKET,
      Key: key,
      Expires: URL_TTL_SECONDS,
    });

    res.json({ url, key, method: "GET", expiresIn: URL_TTL_SECONDS });
  } catch (err) {
    console.error("Error creating download URL:", err.message);
    res.status(500).json({ error: "Could not create download URL" });
  }
}

module.exports = { createUploadUrl, createDownloadUrl };
