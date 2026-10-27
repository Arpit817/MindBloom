import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { getS3Client } from "@/lib/s3/s3Client";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET() {
  const status = {
    mongodb: { status: "pending", message: "" },
    aws_s3: { status: "pending", message: "" },
  };

  // Test MongoDB Connection
  try {
    const conn = await connectDB();
    const state = conn.connection.readyState;
    // 1 = connected
    if (state === 1) {
      status.mongodb = {
        status: "success",
        message: `Connected to database: "${conn.connection.name}"`,
      };
    } else {
      status.mongodb = {
        status: "warning",
        message: `Connection readyState is ${state}`,
      };
    }
  } catch (err) {
    status.mongodb = {
      status: "error",
      message: err.message || "Failed to connect to MongoDB",
    };
  }

  // Test AWS S3 Connection
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      status.aws_s3 = {
        status: "error",
        message: "AWS_S3_BUCKET_NAME is not defined in .env.local",
      };
    } else {
      const client = getS3Client();
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 1,
      });
      await client.send(command);
      status.aws_s3 = {
        status: "success",
        message: `Successfully connected to bucket: "${bucketName}"`,
      };
    }
  } catch (err) {
    status.aws_s3 = {
      status: "error",
      message: err.message || "Failed to access AWS S3 bucket",
    };
  }

  const isHealthy =
    status.mongodb.status === "success" && status.aws_s3.status === "success";

  return NextResponse.json(
    {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      services: status,
    },
    { status: isHealthy ? 200 : 207 }
  );
}
