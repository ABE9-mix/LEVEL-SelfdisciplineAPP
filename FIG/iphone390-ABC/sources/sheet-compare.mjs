// 三套变体总览：A / B / C 各一行 12 屏，纵向堆叠（行间 32 灰带分隔）
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import zlib from 'node:zlib';

const OUT = 'F:\\deepseek\\作业\\figcraft_mcp\\out\\iphone390';
const SRC = OUT + '\\merge-shots';

function decodePng(buf) {
  let p = 8, W = 0, H = 0, bd = 0, ct = 0; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), typ = buf.toString('ascii', p + 4, p + 8);
    const d = buf.subarray(p + 8, p + 8 + len);
    if (typ === 'IHDR') { W = d.readUInt32BE(0); H = d.readUInt32BE(4); bd = d[8]; ct = d[9]; }
    else if (typ === 'IDAT') idat.push(d); else if (typ === 'IEND') break;
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : ct === 4 ? 2 : 1;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = W * bpp; const out = Buffer.alloc(H * stride); const zero = Buffer.alloc(stride);
  let o = 0, r = 0;
  for (let y = 0; y < H; y++) {
    const f = raw[r++]; const line = raw.subarray(r, r + stride); r += stride;
    const cur = out.subarray(o, o + stride); const prev = y ? out.subarray(o - stride, o) : zero;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      cur[i] = v & 255;
    }
    o += stride;
  }
  return { W, H, bpp, px: out };
}
let TBL = null;
function crc32(buf) {
  if (!TBL) { TBL = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; TBL[n] = c; } }
  let c = -1; for (let i = 0; i < buf.length; i++) c = TBL[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0;
}
function encodePng(W, H, rgb) {
  const stride = W * 3;
  const raw = Buffer.alloc(H * (stride + 1));
  for (let y = 0; y < H; y++) { raw[y * (stride + 1)] = 0; rgb.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride); }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const ROWS = ['A', 'B', 'C'];
const all = readdirSync(SRC).filter((f) => f.endsWith('--1x.png'));
const GAP = 20, PAD = 20, BAND = 32, CW = 390, CH = 844;
const ROWBG = { A: [236, 237, 239], B: [232, 236, 242], C: [238, 234, 228] };
const W = PAD + 12 * (CW + GAP);
const H = PAD + ROWS.length * (CH + GAP) + (ROWS.length - 1) * BAND;
const canvas = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) { canvas[i * 3] = 250; canvas[i * 3 + 1] = 250; canvas[i * 3 + 2] = 250; }

ROWS.forEach((k, ri) => {
  const files = all.filter((f) => f.startsWith(k + '_')).sort();
  const oy = PAD + ri * (CH + GAP + BAND);
  // 行底色
  for (let y = oy - 8; y < oy + CH + 8 && y < H; y++) for (let x = 0; x < W; x++) {
    const d = (y * W + x) * 3;
    canvas[d] = ROWBG[k][0]; canvas[d + 1] = ROWBG[k][1]; canvas[d + 2] = ROWBG[k][2];
  }
  files.forEach((f, i) => {
    const im = decodePng(readFileSync(SRC + '\\' + f));
    const ox = PAD + i * (CW + GAP);
    for (let y = 0; y < Math.min(im.H, CH); y++) for (let x = 0; x < Math.min(im.W, CW); x++) {
      const s = (y * im.W + x) * im.bpp;
      const d = ((oy + y) * W + (ox + x)) * 3;
      canvas[d] = im.px[s]; canvas[d + 1] = im.px[s + 1]; canvas[d + 2] = im.px[s + 2];
    }
  });
});
writeFileSync(OUT + '\\sheet-compare.png', encodePng(W, H, canvas));
console.log(`sheet-compare.png ${W}×${H}  3 行 × 12 屏（A 灰 / B 蓝灰 / C 暖灰 行底区分）`);
