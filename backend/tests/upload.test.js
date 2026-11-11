const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

jest.mock("../config/aws-config", () => ({
  s3: { getSignedUrlPromise: jest.fn() },
  S3_BUCKET: "test-bucket",
}));
jest.mock("../models/repoModel", () => ({ findById: jest.fn() }));

const { s3 } = require("../config/aws-config");
const Repository = require("../models/repoModel");
const repoRouter = require("../routes/repo.router");

const OWNER_ID = new mongoose.Types.ObjectId().toString();
const OTHER_ID = new mongoose.Types.ObjectId().toString();
const REPO_ID = new mongoose.Types.ObjectId().toString();
const secret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "default_jwt_secret";
const tokenFor = (id) => `Bearer ${jwt.sign({ id }, secret)}`;

const app = express();
app.use(express.json());
app.use("/repos", repoRouter);

describe("S3 pre-signed object URLs", () => {
  let dbState;

  beforeEach(() => {
    jest.clearAllMocks();
    dbState = 1;
    Object.defineProperty(mongoose.connection, "readyState", { get: () => dbState, configurable: true });
    Repository.findById.mockResolvedValue({ _id: REPO_ID, owner: OWNER_ID });
    s3.getSignedUrlPromise.mockResolvedValue("https://signed.example/url");
  });

  afterEach(() => {
    delete mongoose.connection.readyState;
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).post(`/repos/${REPO_ID}/upload-url`).send({ filename: "a.txt" });
    expect(res.statusCode).toBe(401);
    expect(s3.getSignedUrlPromise).not.toHaveBeenCalled();
  });

  it("returns a short-lived PUT URL under repos/<id>/ for the owner", async () => {
    const res = await request(app)
      .post(`/repos/${REPO_ID}/upload-url`)
      .set("Authorization", tokenFor(OWNER_ID))
      .send({ filename: "../../etc/pass wd.txt", contentType: "text/plain" });

    expect(res.statusCode).toBe(201);
    expect(res.body.url).toBe("https://signed.example/url");
    expect(res.body.key).toMatch(new RegExp(`^repos/${REPO_ID}/[0-9a-f-]{36}-pass_wd\\.txt$`));
    expect(res.body.expiresIn).toBe(300);

    const [op, params] = s3.getSignedUrlPromise.mock.calls[0];
    expect(op).toBe("putObject");
    expect(params).toMatchObject({ Bucket: "test-bucket", ContentType: "text/plain", Expires: 300 });
  });

  it("forbids a user who does not own the repository", async () => {
    const res = await request(app)
      .post(`/repos/${REPO_ID}/upload-url`)
      .set("Authorization", tokenFor(OTHER_ID))
      .send({ filename: "a.txt" });
    expect(res.statusCode).toBe(403);
    expect(s3.getSignedUrlPromise).not.toHaveBeenCalled();
  });

  it("validates filename, contentType and repository id", async () => {
    const auth = tokenFor(OWNER_ID);
    const noName = await request(app).post(`/repos/${REPO_ID}/upload-url`).set("Authorization", auth).send({});
    expect(noName.statusCode).toBe(400);

    const badType = await request(app)
      .post(`/repos/${REPO_ID}/upload-url`)
      .set("Authorization", auth)
      .send({ filename: "a.txt", contentType: "not a type" });
    expect(badType.statusCode).toBe(400);

    const badId = await request(app).post("/repos/not-an-id/upload-url").set("Authorization", auth).send({ filename: "a.txt" });
    expect(badId.statusCode).toBe(400);
  });

  it("returns 404 for an unknown repository and 503 without a database", async () => {
    Repository.findById.mockResolvedValue(null);
    const missing = await request(app)
      .post(`/repos/${REPO_ID}/upload-url`)
      .set("Authorization", tokenFor(OWNER_ID))
      .send({ filename: "a.txt" });
    expect(missing.statusCode).toBe(404);

    dbState = 0;
    const down = await request(app)
      .post(`/repos/${REPO_ID}/upload-url`)
      .set("Authorization", tokenFor(OWNER_ID))
      .send({ filename: "a.txt" });
    expect(down.statusCode).toBe(503);
  });

  it("issues a download URL only for keys inside the repository", async () => {
    const auth = tokenFor(OWNER_ID);
    const ok = await request(app)
      .get(`/repos/${REPO_ID}/download-url`)
      .query({ key: `repos/${REPO_ID}/abc-file.txt` })
      .set("Authorization", auth);
    expect(ok.statusCode).toBe(200);
    expect(s3.getSignedUrlPromise.mock.calls[0][0]).toBe("getObject");

    const foreign = await request(app)
      .get(`/repos/${REPO_ID}/download-url`)
      .query({ key: `repos/${OTHER_ID}/abc-file.txt` })
      .set("Authorization", auth);
    expect(foreign.statusCode).toBe(400);

    const traversal = await request(app)
      .get(`/repos/${REPO_ID}/download-url`)
      .query({ key: `repos/${REPO_ID}/../${OTHER_ID}/x` })
      .set("Authorization", auth);
    expect(traversal.statusCode).toBe(400);
  });
});
