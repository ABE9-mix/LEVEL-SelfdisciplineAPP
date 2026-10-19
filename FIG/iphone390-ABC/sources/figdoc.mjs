// iphone390 · .figcraft 原生写盘器（零依赖，直接生成 FigCraft 文档包）
//
// 依据：把引擎存的 .figcraft 拆开，document.json 的真实结构是「扁平 nodes 表 + parent/children 双向引用」：
//   { format:'figcraft', version:1, imageIndex:[], name, pages:[pageId], nodes:{ "id": {...} },
//     next_id, styles:[], variables:{collections,variables}, current_page, document_colors:[], comments:[] }
// 节点字段（实测拷贝自引擎输出）：
//   page      : background{r,g,b,a} prototype{device,background,rotation} flows guides children width height
//   frame     : parent children width height fills[] clip?
//   rectangle : parent transform[1,0,0,1,x,y] width height fills[] strokes[] stroke{} corners{radii,smoothing}
//   vector    : network{vertices,segments,regions} transform width height fills[] stroke{}
//   text      : characters style{font_family,font_style,font_size,line_height,letter_spacing,decoration,case,fills,link}
//               auto_resize parent transform width height fills[] child_layout{}
// 文件是一个 ZIP：document.json（deflate 压缩）+ thumbnail.png（store）。thumbnail 非必需，但为了和图一致也写进去。
import { writeFileSync, mkdirSync } from 'node:fs';
import zlib from 'node:zlib';

// ── 2D 仿射矩阵（引擎要求 {a,b,c,d,e,f}）
function mat(x, y) { return [1, 0, 0, 1, x, y]; }

// ── 颜色
export function rgb(hex, a = 1) {
  const h = hex.replace('#', '');
  const r = h.length === 8 ? h.slice(0, 6) : h;
  const alpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : a;
  return { r: parseInt(r.slice(0, 2), 16) / 255, g: parseInt(r.slice(2, 4), 16) / 255, b: parseInt(r.slice(4, 6), 16) / 255, a: alpha };
}
const paint = (hex, opacity = 1, visible = true) => ({ type: 'solid', color: rgb(hex), opacity, visible, blend: 'normal' });
const strokeWrap = (hex, { weight = 1, align = 'inside', dashes = [], cap = { s: 'none', e: 'none' }, join = 'miter' } = {}) => ({
  weight, align, sides: null, cap_start: cap.s, cap_end: cap.e, join, miter_limit: 4, dashes,
});

// ── 文档
export class FigDoc {
  /**
   * mode:
   *   'plain'   —— 与 MCP 版 1:1 一致（默认）
   *   'hover'   —— 指针悬停态：选中/悬停项给底色与描边，验证「状态可读性」
   *   'variant' —— 抽屉式替代布局：同一批内容换一种排版（列表 → 大卡、柱状 → 环形刻度）
   */
  constructor(name = 'wireframe', mode = 'plain') {
    this.mode = mode;
    this.name = name;
    this.nodes = {};
    this.next = 1;
    this.pageIds = [];
    this.page = null;
  }
  _id() { return this.next++; }
  _add(node) {
    this.nodes[String(node.id)] = node;
    if (this.page && node.type !== 'page') {
      if (node.parent) {
        const p = this.nodes[String(node.parent)];
        (p.children || (p.children = [])).push(node.id);
      } else {
        this.page.children.push(node.id);
      }
    }
    return node;
  }

  newPage(name, bg = '#F4F5F7') {
    const id = this._id();
    const page = {
      id, name, type: 'page', background: rgb(bg), flows: [],
      prototype: { device: 'None', background: rgb('#E5E5E5'), rotation: 'portrait' },
      guides: [], children: [], width: 0, height: 0,
    };
    this.nodes[String(id)] = page;
    this.pageIds.push(id);
    this.page = page;
    return page;
  }

  frame(parent, { name, x = 0, y = 0, w = 100, h = 100, fill = '#FFFFFF', r = 0, clip = false }) {
    const n = {
      id: this._id(), name, type: 'frame', ...(parent ? { parent: parent.id } : {}),
      transform: mat(x, y), width: w, height: h, children: [],
      fills: fill ? [paint(fill)] : [],
      ...(r ? { corners: { radii: [r, r, r, r], smoothing: 0 } } : {}),
      ...(clip ? { clip: true } : {}),
    };
    return this._add(n);
  }

  rect(parent, { name = 'rect', x, y, w, h, fill, r = 0, stroke, sw = 1, dashes, opacity = null }) {
    r = Math.min(r, Math.floor(Math.min(w, h) / 2)); // 圆角超过短边一半 → 引擎按镜像半径外扩
    const n = {
      id: this._id(), name, type: 'rectangle', ...(parent ? { parent: parent.id } : {}),
      blend: 'normal', transform: mat(x, y), width: w, height: h,
      fills: fill ? [paint(fill, opacity ?? 1)] : [],
      ...(stroke ? { strokes: [paint(stroke)], stroke: strokeWrap(stroke, { weight: sw, dashes: dashes || [] }) } : {}),
      ...(r ? { corners: { radii: [r, r, r, r], smoothing: 0 } } : {}),
    };
    return this._add(n);
  }

  /** 折线 / 多边形：pts 为局部坐标点列；closed=false 时描边呈现 */
  path(parent, { name = 'path', pts, fill = null, stroke = null, sw = 1.6, closed = true, cap = 'round', join = 'round', dashes = null, stripStroke = false }) {
    const vertices = pts.map(([x, y]) => ({ x, y, radius: 0 }));
    const segments = [];
    const n = pts.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      segments.push({ a: i, b: (i + 1) % n, ta: [0, 0], tb: [0, 0] });
    }
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const w = Math.max(...xs) - minX, h = Math.max(...ys) - minY;
    const local = pts.map(([x, y]) => ({ x: x - minX, y: y - minY, radius: 0 }));
    const node = {
      id: this._id(), name, type: 'vector', ...(parent ? { parent: parent.id } : {}), blend: 'normal',
      transform: mat(minX, minY), width: w, height: h,
      network: {
        vertices: local, segments,
        regions: closed ? [{ loops: [local.map((_, i) => i)], winding: 'nonZero' }] : [],
      },
      fills: fill ? [paint(fill)] : [],
      ...(stroke ? { strokes: [paint(stroke)] } : {}),
      // 关键：图层的 stroke 属性只描述「描边样式」，颜色在独立的 strokes 列表里（引擎实测）
      ...(!stripStroke ? { stroke: strokeWrap(stroke || '#000000', { weight: sw, align: 'center', cap: { s: cap, e: cap }, join, dashes: dashes || [] }) } : {}),
    };
    return this._add(node);
  }

  text(parent, { name = 'T', x, y, w, text, size = 15, color = '#181B20', align = 'left', lh = null, font = 'MiSans', weight = 'Regular', autoH = true }) {
    const n = {
      id: this._id(), name, type: 'text', characters: text,
      style: {
        font_family: font, font_style: weight, font_size: size,
        line_height: lh ? { unit: 'pixels', value: lh } : { unit: 'auto' },
        letter_spacing: { unit: 'percent', value: 0 }, decoration: 'none', case: 'original',
        fills: null, link: null,
      },
      auto_resize: autoH ? 'height' : 'none',
      ...(align !== 'left' ? { align_h: align } : {}),
      ...(parent ? { parent: parent.id } : {}), blend: 'normal',
      transform: mat(x, y), width: w, height: Math.round(size * 1.45),
      fills: [paint(color)],
      child_layout: {
        sizing_h: 'fixed', sizing_v: autoH ? 'hug' : 'fixed', absolute: false,
        min_w: null, max_w: null, min_h: null, max_h: null,
        grid_column: null, grid_row: null, grid_column_span: 0, grid_row_span: 0,
      },
    };
    return this._add(n);
  }

  /** 生成 document.json 对象 */
  doc() {
    return {
      format: 'figcraft', version: 1, imageIndex: [], name: this.name,
      pages: this.pageIds, nodes: this.nodes, next_id: this.next,
      styles: [], variables: { collections: [], variables: [] },
      current_page: this.pageIds[0], document_colors: [], comments: [],
    };
  }

  /** 写 .figcraft（ZIP：document.json deflate + thumbnail.png store） */
  save(path, thumbnailPng = null) {
    const json = Buffer.from(JSON.stringify(this.doc()), 'utf8');
    const files = [
      { name: 'document.json', data: zlib.deflateRawSync(json, { level: 9 }), method: 8, crc: crc32(json), usize: json.length },
    ];
    if (thumbnailPng) files.push({ name: 'thumbnail.png', data: thumbnailPng, method: 0, crc: crc32(thumbnailPng), usize: thumbnailPng.length });
    const chunks = [];
    const central = [];
    let offset = 0;
    for (const f of files) {
      const nameBuf = Buffer.from(f.name, 'utf8');
      const lh = Buffer.alloc(30);
      lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6);
      lh.writeUInt16LE(f.method, 8); lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0, 12);
      lh.writeUInt32LE(f.crc, 14); lh.writeUInt32LE(f.data.length, 18); lh.writeUInt32LE(f.usize, 22);
      lh.writeUInt16LE(nameBuf.length, 26); lh.writeUInt16LE(0, 28);
      chunks.push(lh, nameBuf, f.data);
      const ch = Buffer.alloc(46);
      ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6);
      ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(f.method, 10); ch.writeUInt16LE(0, 12); ch.writeUInt16LE(0, 14);
      ch.writeUInt32LE(f.crc, 16); ch.writeUInt32LE(f.data.length, 20); ch.writeUInt32LE(f.usize, 24);
      ch.writeUInt16LE(nameBuf.length, 28); ch.writeUInt16LE(0, 30); ch.writeUInt16LE(0, 32);
      ch.writeUInt16LE(0, 34); ch.writeUInt16LE(0, 36); ch.writeUInt32LE(0, 38); ch.writeUInt32LE(offset, 42);
      central.push(Buffer.concat([ch, nameBuf]));
      offset += lh.length + nameBuf.length + f.data.length;
    }
    const cd = Buffer.concat(central);
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(0, 4); eocd.writeUInt16LE(0, 6);
    eocd.writeUInt16LE(files.length, 8); eocd.writeUInt16LE(files.length, 10);
    eocd.writeUInt32LE(cd.length, 12); eocd.writeUInt32LE(offset, 16); eocd.writeUInt16LE(0, 20);
    const out = Buffer.concat([...chunks, cd, eocd]);
    mkdirSync(path.replace(/[\\/][^\\/]+$/, ''), { recursive: true });
    writeFileSync(path, out);
    return { bytes: out.length, nodes: Object.keys(this.nodes).length, docBytes: json.length };
  }

  stats() {
    const all = Object.values(this.nodes);
    return {
      pages: this.pageIds.length,
      nodes: all.length,
      frames: all.filter((n) => n.type === 'frame').length,
      rects: all.filter((n) => n.type === 'rectangle').length,
      texts: all.filter((n) => n.type === 'text').length,
      vectors: all.filter((n) => n.type === 'vector').length,
    };
  }
}

let TBL = null;
function crc32(buf) {
  if (!TBL) { TBL = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; TBL[n] = c; } }
  let c = -1; for (let i = 0; i < buf.length; i++) c = TBL[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0;
}

/** 读回 .figcraft（校验用）：返回 document.json 对象 */
export function readFigcraft(path) {
  const buf = readFileSyncSafe(path);
  // 走中央目录
  let c = -1;
  for (let i = 0; i < buf.length - 4; i++) if (buf.readUInt32LE(i) === 0x02014b50) { c = i; break; }
  const entries = [];
  while (c >= 0) {
    const method = buf.readUInt16LE(c + 10);
    const csize = buf.readUInt32LE(c + 20);
    const nlen = buf.readUInt16LE(c + 28), elen = buf.readUInt16LE(c + 30), clen = buf.readUInt16LE(c + 32);
    const lho = buf.readUInt32LE(c + 42);
    const name = buf.toString('utf8', c + 46, c + 46 + nlen);
    entries.push({ name, method, csize, lho });
    const next = c + 46 + nlen + elen + clen;
    c = next < buf.length - 4 && buf.readUInt32LE(next) === 0x02014b50 ? next : -1;
  }
  const e = entries.find((x) => x.name === 'document.json');
  if (!e) throw new Error('document.json not found');
  const nlen = buf.readUInt16LE(e.lho + 26), elen = buf.readUInt16LE(e.lho + 28);
  const s = e.lho + 30 + nlen + elen;
  let data = buf.subarray(s, s + e.csize);
  if (e.method === 8) data = zlib.inflateRawSync(data);
  return { json: JSON.parse(data.toString('utf8')), entries };
}

import { readFileSync as readFileSyncSafeRaw } from 'node:fs';
function readFileSyncSafe(p) { return readFileSyncSafeRaw(p); }
