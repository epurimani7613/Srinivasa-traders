#!/usr/bin/env node

const fs = require('fs');
const net = require('net');
const path = require('path');
const { createCanvas, registerFont } = require('canvas');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PRINTER_WIDTH_PX = Number(process.env.PRINTER_WIDTH_PX || 384);
const TEXT = process.env.PRINT_TEXT || 'మొత్తం బిల్లు: ₹500';
const FONT_FAMILY = 'TeluguReceiptFont';

const candidateFonts = [
  process.env.TELUGU_FONT_PATH,
  path.join(PROJECT_ROOT, 'fonts', 'NotoSansTelugu-Regular.otf'),
  path.join(PROJECT_ROOT, 'fonts', 'Gautami.ttf'),
  path.join(PROJECT_ROOT, 'fonts', 'NotoSansTelugu-Regular.ttf'),
  path.join(PROJECT_ROOT, 'fonts', 'NotoSerifTelugu-Regular.ttf'),
  path.join(PROJECT_ROOT, 'fonts', 'Pothana.ttf'),
  path.join(PROJECT_ROOT, 'fonts', 'Mandali-Regular.ttf'),
].filter(Boolean);

function findFontPath() {
  return candidateFonts.find((fontPath) => fs.existsSync(fontPath));
}

function rasterCommandFromCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bytesPerRow = Math.ceil(width / 8);
  const raster = Buffer.alloc(bytesPerRow * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelOffset = (y * width + x) * 4;
      const r = data[pixelOffset];
      const g = data[pixelOffset + 1];
      const b = data[pixelOffset + 2];
      const alpha = data[pixelOffset + 3] / 255;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) * alpha + 255 * (1 - alpha);

      if (luminance < 160) {
        const byteIndex = y * bytesPerRow + Math.floor(x / 8);
        raster[byteIndex] |= 0x80 >> (x % 8);
      }
    }
  }

  const xL = bytesPerRow & 0xff;
  const xH = (bytesPerRow >> 8) & 0xff;
  const yL = height & 0xff;
  const yH = (height >> 8) & 0xff;

  return Buffer.concat([
    Buffer.from([0x1b, 0x40]), // ESC @ initialize
    Buffer.from([0x1d, 0x76, 0x30, 0x00, xL, xH, yL, yH]), // GS v 0 raster bit image
    raster,
    Buffer.from([0x0a, 0x0a, 0x1d, 0x56, 0x42, 0x00]), // feed + partial cut if supported
  ]);
}

function createReceiptCanvas(fontPath) {
  registerFont(fontPath, { family: FONT_FAMILY });

  const paddingX = 16;
  const paddingY = 14;
  const fontSize = Number(process.env.FONT_SIZE || 34);
  const lineHeight = Math.ceil(fontSize * 1.45);
  const height = paddingY * 2 + lineHeight;
  const canvas = createCanvas(PRINTER_WIDTH_PX, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'top';
  ctx.font = `700 ${fontSize}px "${FONT_FAMILY}"`;

  const measured = ctx.measureText(TEXT);
  const x = Math.max(paddingX, Math.floor((canvas.width - measured.width) / 2));
  ctx.fillText(TEXT, x, paddingY);

  return canvas;
}

function writeNetwork(buffer) {
  const host = process.env.PRINTER_HOST;
  const port = Number(process.env.PRINTER_PORT || 9100);

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port }, () => {
      socket.write(buffer, () => socket.end());
    });

    socket.on('error', reject);
    socket.on('close', resolve);
  });
}

function writeUsb(buffer) {
  const escpos = require('escpos');
  escpos.USB = require('escpos-usb');

  return new Promise((resolve, reject) => {
    const device = new escpos.USB();
    device.open((error) => {
      if (error) {
        reject(error);
        return;
      }

      device.write(buffer, (writeError) => {
        if (writeError) {
          reject(writeError);
          return;
        }
        device.close(resolve);
      });
    });
  });
}

async function main() {
  const fontPath = findFontPath();
  if (!fontPath) {
    console.error('No Telugu TTF/OTF font found.');
    console.error('Put NotoSansTelugu-Regular.otf, Gautami.ttf, Pothana.ttf, or another Telugu font in ./fonts/');
    console.error('Or run with TELUGU_FONT_PATH=/absolute/path/to/TeluguFont.ttf');
    process.exit(1);
  }

  const canvas = createReceiptCanvas(fontPath);
  const rasterBuffer = rasterCommandFromCanvas(canvas);
  const previewPath = path.join(PROJECT_ROOT, 'telugu-receipt-preview.png');
  fs.writeFileSync(previewPath, canvas.toBuffer('image/png'));

  if (process.env.OUTPUT_FILE) {
    fs.writeFileSync(process.env.OUTPUT_FILE, rasterBuffer);
    console.log(`Wrote ESC/POS raster bytes to ${process.env.OUTPUT_FILE}`);
  } else if (process.env.PRINTER_HOST) {
    await writeNetwork(rasterBuffer);
    console.log(`Sent Telugu raster receipt to ${process.env.PRINTER_HOST}:${process.env.PRINTER_PORT || 9100}`);
  } else if (process.env.PRINTER_USB === '1') {
    await writeUsb(rasterBuffer);
    console.log('Sent Telugu raster receipt to USB ESC/POS printer');
  } else {
    const rawPath = path.join(PROJECT_ROOT, 'telugu-receipt-raster.bin');
    fs.writeFileSync(rawPath, rasterBuffer);
    console.log(`No printer target configured. Wrote ${rawPath} for raw device testing.`);
  }

  console.log(`Preview PNG: ${previewPath}`);
  console.log(`Font used: ${fontPath}`);
  console.log(`Canvas: ${canvas.width}x${canvas.height}px, 1-bit raster via GS v 0`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
