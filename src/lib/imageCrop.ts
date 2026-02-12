"use client";

export async function fileToLandscapeDataUrl(file: File, aspect = 16 / 9) {
  const bitmap = await createImageBitmap(file);
  const srcW = bitmap.width;
  const srcH = bitmap.height;

  // Crop the largest centered rectangle that matches desired aspect.
  let cropW = srcW;
  let cropH = Math.round(cropW / aspect);
  if (cropH > srcH) {
    cropH = srcH;
    cropW = Math.round(cropH * aspect);
  }

  const sx = Math.round((srcW - cropW) / 2);
  const sy = Math.round((srcH - cropH) / 2);

  const outW = 1600;
  const outH = Math.round(outW / aspect);
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Missing canvas context");
  ctx.drawImage(bitmap, sx, sy, cropW, cropH, 0, 0, outW, outH);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  bitmap.close?.();
  return dataUrl;
}
