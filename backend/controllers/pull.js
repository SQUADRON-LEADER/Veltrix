const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    await fs.mkdir(commitsPath, { recursive: true });

    const params = {
      Bucket: S3_BUCKET,
      Prefix: "commits/",
    };

    const data = await s3.listObjectsV2(params).promise();

    for (const obj of data.Contents) {
      const key = obj.Key;
      const localFilePath = path.join(repoPath, key);
      const localDir = path.dirname(localFilePath);

      await fs.mkdir(localDir, { recursive: true });

      const fileData = await s3.getObject({ Bucket: S3_BUCKET, Key: key }).promise();
      await fs.writeFile(localFilePath, fileData.Body);
    }

    console.log("All commits pulled from S3.");
  } catch (err) {
    console.error("Error pulling from S3 : ", err);
  }
}

module.exports = { pullRepo };