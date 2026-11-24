"use client";

import { drawLandscapeFrame, planLandscapeFrame } from "@/lib/landscapeFrame";

const JPEG_QUALITY = 0.9;

export type PreparedPhoto = {
  blob: Blob;
  /** True when a portrait original was turned 90° clockwise before the crop. */
  rotated: boolean;
};

type Decoded = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

function loadViaImageElement(file: File): Promise<Decoded> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that image"));
        return;
      }
      resolve({
        source: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        close: () => URL.revokeObjectURL(url),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image"));
    };
    img.src = url;
  });
}

async function decodeOrientedImage(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      if (bitmap.width && bitmap.height) {
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          close: () => bitmap.close(),
        };
      }
      bitmap.close();
    } catch {
      try {
        const bitmap = await createImageBitmap(file);
        if (bitmap.width && bitmap.height) {
          return {
            source: bitmap,
            width: bitmap.width,
            height: bitmap.height,
            close: () => bitmap.close(),
          };
        }
        bitmap.close();
      } catch {
        // An <img> decode also applies EXIF orientation in current browsers.
      }
    }
  }
  return loadViaImageElement(file);
}

export async function fileToLandscapeBlob(
  file: File,
  aspect = 16 / 9,
): Promise<PreparedPhoto> {
  const decoded = await decodeOrientedImage(file);
  try {
    const plan = planLandscapeFrame(decoded.width, decoded.height, aspect);
    const canvas = document.createElement("canvas");
    canvas.width = plan.outW;
    canvas.height = plan.outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Missing canvas context");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawLandscapeFrame(ctx, decoded.source, plan);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });
    if (!blob) throw new Error("Could not encode photo");
    return { blob, rotated: plan.rotated };
  } finally {
    decoded.close();
  }
}
