import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

// Favicon 32x32
const SIZE = 32;
const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

// White background with slight rounding effect
ctx.fillStyle = '#18181b';
ctx.fillRect(0, 0, SIZE, SIZE);

// Draw "0" 
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('0', SIZE / 2, SIZE / 2);

const buffer = canvas.toBuffer('image/png');
writeFileSync('./public/favicon.ico', buffer);
console.log('Generated public/favicon.ico');

// Also generate apple-touch-icon (180x180)
const SIZE2 = 180;
const canvas2 = createCanvas(SIZE2, SIZE2);
const ctx2 = canvas2.getContext('2d');

ctx2.fillStyle = '#18181b';
ctx2.fillRect(0, 0, SIZE2, SIZE2);

ctx2.fillStyle = '#ffffff';
ctx2.font = 'bold 100px system-ui, -apple-system, sans-serif';
ctx2.textAlign = 'center';
ctx2.textBaseline = 'middle';
ctx2.fillText('0', SIZE2 / 2, SIZE2 / 2);

writeFileSync('./public/apple-touch-icon.png', canvas2.toBuffer('image/png'));
console.log('Generated public/apple-touch-icon.png');
