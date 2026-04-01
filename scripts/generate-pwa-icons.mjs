/**
 * 単色プレースホルダー用。本番アイコンは `public/icon-*.png` をデザイン画像で差し替えている場合があります（上書きに注意）。
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createRgbPng(width, height, r, g, b) {
  const rowLen = 1 + width * 3;
  const raw = Buffer.alloc(rowLen * height);
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0;
    for (let x = 0; x < width; x++) {
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
    }
  }
  const compressed = deflateSync(raw);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function createIcoFromPng(pngData, width, height) {
  const iconDir = Buffer.alloc(6);
  iconDir.writeUInt16LE(0, 0);
  iconDir.writeUInt16LE(1, 2);
  iconDir.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry[0] = width >= 256 ? 0 : width;
  entry[1] = height >= 256 ? 0 : height;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngData.length, 8);
  entry.writeUInt32LE(6 + 16, 12);

  return Buffer.concat([iconDir, entry, pngData]);
}

const publicDir = join(__dirname, "..", "public");
const blue = { r: 37, g: 99, b: 235 };

const icon192 = createRgbPng(192, 192, blue.r, blue.g, blue.b);
const icon512 = createRgbPng(512, 512, blue.r, blue.g, blue.b);
const appleTouch = createRgbPng(180, 180, blue.r, blue.g, blue.b);
const favicon = createIcoFromPng(icon192, 192, 192);

writeFileSync(join(publicDir, "icon-192x192.png"), icon192);
writeFileSync(join(publicDir, "icon-512x512.png"), icon512);
writeFileSync(join(publicDir, "apple-touch-icon.png"), appleTouch);
writeFileSync(join(publicDir, "favicon.ico"), favicon);

console.log("Wrote PWA icons + favicon to public/");
