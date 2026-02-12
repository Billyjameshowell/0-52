import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.BUCKET_NAME || "oneper-images";
const REGION = process.env.AWS_REGION || "auto";
const ENDPOINT = process.env.AWS_ENDPOINT_URL_S3 || "https://fly.storage.tigris.dev";

// Lazy init S3 client
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (s3Client) return s3Client;
  
  s3Client = new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });
  
  return s3Client;
}

/**
 * Upload an image to Tigris and return the public URL.
 */
export async function uploadImage(
  key: string,
  data: Buffer,
  contentType: string = "image/jpeg"
): Promise<string> {
  const client = getS3Client();
  
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: data,
      ContentType: contentType,
      // Public read access
      ACL: "public-read",
    })
  );
  
  // Return public URL
  return `https://${BUCKET}.fly.storage.tigris.dev/${key}`;
}

/**
 * Delete an image from Tigris.
 */
export async function deleteImage(key: string): Promise<void> {
  const client = getS3Client();
  
  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

/**
 * Generate a unique key for a post image.
 */
export function generateImageKey(handle: string, year: number, week: number): string {
  const timestamp = Date.now();
  return `posts/${handle}/${year}/week-${week.toString().padStart(2, "0")}-${timestamp}.jpg`;
}
