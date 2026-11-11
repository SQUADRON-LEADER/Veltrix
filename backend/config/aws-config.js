const AWS = require("aws-sdk");

const awsConfig = {
  region: process.env.AWS_REGION || "ap-south-1",
};

// Static keys are only used when explicitly provided (local development).
// On AWS leave them unset so the SDK uses the instance/pod role credentials.
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  awsConfig.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  awsConfig.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
}

AWS.config.update(awsConfig);

const s3 = new AWS.S3({ signatureVersion: "v4" });
// docker-compose / Kubernetes pass AWS_S3_BUCKET_NAME; the CLI and older configs use S3_BUCKET.
const S3_BUCKET =
  process.env.S3_BUCKET || process.env.AWS_S3_BUCKET_NAME || "veltrix07";

module.exports = { s3, S3_BUCKET };
