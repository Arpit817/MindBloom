import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.AWS_S3_BUCKET_NAME || "";

/**
 * Returns an S3 client instance.
 */
export function getS3Client() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "AWS credentials (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY) are not defined."
    );
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Generates a presigned PUT URL for uploading directly from the browser to S3.
 *
 * @param {string} key - S3 object key (e.g., `user_123/notes/diagram.jpg`)
 * @param {string} contentType - File MIME type (e.g., `image/jpeg`)
 * @param {number} expiresIn - Expiration time in seconds (default: 5 minutes)
 * @returns {Promise<string>} Presigned upload URL
 */
export async function getUploadPresignedUrl(key, contentType, expiresIn = 300) {
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Generates a presigned GET URL for securely viewing private S3 objects.
 *
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} Presigned viewing URL
 */
export async function getViewPresignedUrl(key, expiresIn = 3600) {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Deletes an object from the S3 bucket.
 *
 * @param {string} key - S3 object key
 */
export async function deleteS3Object(key) {
  const client = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return client.send(command);
}
