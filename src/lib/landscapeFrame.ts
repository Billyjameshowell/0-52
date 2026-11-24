// Fit a photo into the 16:9 landscape grid.
//
// A portrait original is turned 90° clockwise before the crop. A phone
// portrait (9:16) becomes 16:9, so the frame keeps the whole picture
// instead of slicing a band out of the middle. The saved file is always
// landscape, which is what both the grid tile and the lightbox show.

export type FramePlan = {
  /** Portrait source, turned 90° clockwise before cropping. */
  rotated: boolean;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  outW: number;
  outH: number;
};

type DrawCtx<T> = {
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(radians: number): void;
  drawImage(
    image: T,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ): void;
};

function centeredCrop(boundW: number, boundH: number, aspect: number) {
  let cropW = boundW;
  let cropH = Math.round(cropW / aspect);
  if (cropH > boundH) {
    cropH = boundH;
    cropW = Math.round(cropH * aspect);
  }
  if (cropW > boundW) cropW = boundW;
  if (cropH > boundH) cropH = boundH;
  cropW = Math.max(1, cropW);
  cropH = Math.max(1, cropH);

  let x = Math.round((boundW - cropW) / 2);
  let y = Math.round((boundH - cropH) / 2);
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x + cropW > boundW) x = boundW - cropW;
  if (y + cropH > boundH) y = boundH - cropH;
  return { x, y, w: cropW, h: cropH };
}

export function planLandscapeFrame(
  srcW: number,
  srcH: number,
  aspect = 16 / 9,
  outW = 1600,
): FramePlan {
  if (!(srcW > 0) || !(srcH > 0) || !(aspect > 0) || !(outW > 0)) {
    throw new Error("Invalid image size");
  }

  const rotated = srcH > srcW;
  const orientedW = rotated ? srcH : srcW;
  const orientedH = rotated ? srcW : srcH;
  const crop = centeredCrop(orientedW, orientedH, aspect);
  const outH = Math.max(1, Math.round(outW / aspect));

  if (!rotated) {
    return {
      rotated,
      sx: crop.x,
      sy: crop.y,
      sw: crop.w,
      sh: crop.h,
      outW,
      outH,
    };
  }

  // Source point (x, y) lands at (srcH - y, x) after a 90° clockwise turn.
  // Invert that to find the source rect for the crop on the turned image.
  let sx = crop.y;
  let sy = srcH - (crop.x + crop.w);
  let sw = crop.h;
  let sh = crop.w;
  if (sx < 0) sx = 0;
  if (sy < 0) sy = 0;
  if (sx + sw > srcW) sw = srcW - sx;
  if (sy + sh > srcH) sh = srcH - sy;

  return { rotated, sx, sy, sw, sh, outW, outH };
}

export function drawLandscapeFrame<T>(
  ctx: DrawCtx<T>,
  source: T,
  plan: FramePlan,
) {
  if (!plan.rotated) {
    ctx.drawImage(
      source,
      plan.sx,
      plan.sy,
      plan.sw,
      plan.sh,
      0,
      0,
      plan.outW,
      plan.outH,
    );
    return;
  }

  ctx.save();
  ctx.translate(plan.outW, 0);
  ctx.rotate(Math.PI / 2);
  // The rotated destination swaps width and height, so this rect
  // fills the landscape output after the clockwise turn.
  ctx.drawImage(
    source,
    plan.sx,
    plan.sy,
    plan.sw,
    plan.sh,
    0,
    0,
    plan.outH,
    plan.outW,
  );
  ctx.restore();
}
