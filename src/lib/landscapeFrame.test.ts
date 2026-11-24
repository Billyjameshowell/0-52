import assert from "node:assert/strict";
import { test } from "node:test";
import { createCanvas } from "canvas";
import { drawLandscapeFrame, planLandscapeFrame } from "./landscapeFrame.ts";

const ASPECT = 16 / 9;

test("landscape photos stay upright and keep the old center crop", () => {
  const plan = planLandscapeFrame(2000, 1000, ASPECT, 1600);
  assert.equal(plan.rotated, false);
  assert.equal(plan.sw, 1778);
  assert.equal(plan.sh, 1000);
  assert.equal(plan.sx, 111);
  assert.equal(plan.sy, 0);
  assert.equal(plan.outW, 1600);
  assert.equal(plan.outH, 900);
});

test("a 9:16 portrait turns clockwise and keeps the whole frame", () => {
  const plan = planLandscapeFrame(9, 16, ASPECT, 160);
  assert.equal(plan.rotated, true);
  assert.equal(plan.sx, 0);
  assert.equal(plan.sy, 0);
  assert.equal(plan.sw, 9);
  assert.equal(plan.sh, 16);
  assert.equal(plan.outW, 160);
  assert.equal(plan.outH, 90);
});

test("a 3:4 portrait keeps the full height and trims the sides", () => {
  const plan = planLandscapeFrame(300, 400, ASPECT, 1600);
  assert.equal(plan.rotated, true);
  assert.equal(plan.sy, 0);
  assert.equal(plan.sh, 400);
  assert.ok(plan.sx > 0);
  assert.ok(plan.sx + plan.sw < 300);
});

test("a square photo is not turned", () => {
  const plan = planLandscapeFrame(1000, 1000, ASPECT);
  assert.equal(plan.rotated, false);
});

test("source rect stays inside the image for every small size", () => {
  for (let w = 1; w <= 40; w++) {
    for (let h = 1; h <= 40; h++) {
      const plan = planLandscapeFrame(w, h, ASPECT, 160);
      assert.ok(plan.sx >= 0 && plan.sy >= 0, `${w}x${h} origin`);
      assert.ok(plan.sw >= 1 && plan.sh >= 1, `${w}x${h} size`);
      assert.ok(plan.sx + plan.sw <= w, `${w}x${h} width`);
      assert.ok(plan.sy + plan.sh <= h, `${w}x${h} height`);
      assert.equal(plan.rotated, h > w);
    }
  }
});

test("invalid sizes throw", () => {
  assert.throws(() => planLandscapeFrame(0, 10));
  assert.throws(() => planLandscapeFrame(10, -1));
});

function pixel(ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>, x: number, y: number) {
  const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
  return [r, g, b];
}

test("clockwise turn puts the source top-left at the output top-right", () => {
  const src = createCanvas(90, 160);
  const sctx = src.getContext("2d");
  sctx.fillStyle = "#ff0000";
  sctx.fillRect(0, 0, 45, 80);
  sctx.fillStyle = "#00ff00";
  sctx.fillRect(45, 0, 45, 80);
  sctx.fillStyle = "#0000ff";
  sctx.fillRect(0, 80, 45, 80);
  sctx.fillStyle = "#ffff00";
  sctx.fillRect(45, 80, 45, 80);

  const plan = planLandscapeFrame(90, 160, ASPECT, 160);
  const out = createCanvas(plan.outW, plan.outH);
  const octx = out.getContext("2d");
  drawLandscapeFrame(octx, src, plan);

  // 90° clockwise: top-left of the source is the top-right of the output.
  assert.deepEqual(pixel(octx, 140, 20), [255, 0, 0]);
  assert.deepEqual(pixel(octx, 20, 20), [0, 0, 255]);
  assert.deepEqual(pixel(octx, 140, 70), [0, 255, 0]);
  assert.deepEqual(pixel(octx, 20, 70), [255, 255, 0]);
});

test("a landscape photo is not turned when drawn", () => {
  const src = createCanvas(320, 90);
  const sctx = src.getContext("2d");
  sctx.fillStyle = "#ff0000";
  sctx.fillRect(0, 0, 160, 90);
  sctx.fillStyle = "#0000ff";
  sctx.fillRect(160, 0, 160, 90);

  const plan = planLandscapeFrame(320, 90, ASPECT, 160);
  assert.equal(plan.rotated, false);
  const out = createCanvas(plan.outW, plan.outH);
  const octx = out.getContext("2d");
  drawLandscapeFrame(octx, src, plan);

  assert.deepEqual(pixel(octx, 10, 45), [255, 0, 0]);
  assert.deepEqual(pixel(octx, 150, 45), [0, 0, 255]);
});
