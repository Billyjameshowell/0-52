import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

// OG image dimensions
const WIDTH = 1200;
const HEIGHT = 630;

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// White background
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Draw the 52-tile grid (8 columns, 7 rows, some filled)
const cols = 8;
const rows = 7;
const tileW = 48;
const tileH = 27; // 16:9 aspect
const gap = 6;
const gridW = cols * tileW + (cols - 1) * gap;
const gridH = rows * tileH + (rows - 1) * gap;
const gridX = (WIDTH - gridW) / 2;
const gridY = HEIGHT / 2 + 20;

// Pattern of filled tiles (scattered for visual interest)
const filled = new Set([1, 3, 5, 8, 12, 15, 19, 22, 27, 31, 35, 38, 42, 47]);
const colors = ['#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#a5f3fc', '#c7d2fe', '#f5d0fe'];

for (let i = 0; i < 52; i++) {
  const r = Math.floor(i / cols);
  const c = i % cols;
  const x = gridX + c * (tileW + gap);
  const y = gridY + r * (tileH + gap);
  
  if (filled.has(i)) {
    ctx.fillStyle = colors[i % colors.length];
  } else {
    ctx.fillStyle = '#f4f4f5';
  }
  ctx.fillRect(x, y, tileW, tileH);
}

// Draw "0/52" text
ctx.fillStyle = '#18181b';
ctx.font = 'bold 120px system-ui, -apple-system, sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('0/52', WIDTH / 2, HEIGHT / 2 - 100);

// Tagline
ctx.fillStyle = '#71717a';
ctx.font = '500 28px system-ui, -apple-system, sans-serif';
ctx.fillText('One photo per week. 52 weeks.', WIDTH / 2, HEIGHT / 2 - 20);

// Output
const buffer = canvas.toBuffer('image/png');
writeFileSync('./public/og.png', buffer);
console.log('Generated public/og.png');
