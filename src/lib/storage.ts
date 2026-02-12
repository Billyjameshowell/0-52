export type StoragePutResult = {
  key: string;
  url: string;
};

export interface ObjectStorage {
  putPublicObject(args: {
    key: string;
    contentType: string;
    body: ArrayBuffer;
  }): Promise<StoragePutResult>;
}

// V1 NOTE:
// For now we store images as data URLs in localStorage (dev UX).
// Production plan is to use Tigris (S3-compatible) with either:
// - direct server uploads via AWS SDK, OR
// - presigned URLs for client-side upload.
//
// Env vars we expect later:
//   S3_ENDPOINT=https://fly.storage.tigris.dev
//   S3_REGION=auto
//   S3_BUCKET=oneper
//   S3_ACCESS_KEY_ID=...
//   S3_SECRET_ACCESS_KEY=...
// Optional:
//   S3_PUBLIC_BASE_URL=https://<bucket>.<your-domain>/
