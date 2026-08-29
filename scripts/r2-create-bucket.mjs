// Cria o bucket R2 (idempotente — se já existir, ignora o erro).
// Uso: node --env-file=.env scripts/r2-create-bucket.mjs

import { S3Client, CreateBucketCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucket = process.env.R2_BUCKET;

try {
  await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  console.log(`Bucket "${bucket}" criado.`);
} catch (err) {
  if (err.name === "BucketAlreadyOwnedByYou" || err.name === "BucketAlreadyExists") {
    console.log(`Bucket "${bucket}" já existe, ok.`);
  } else {
    throw err;
  }
}
