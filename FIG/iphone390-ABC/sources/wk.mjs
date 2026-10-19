// iphone390 · 自建 .figcraft 写盘版的线框控件库（不依赖 FigCraft，纯 JSON 生成）
// 与 widgets.mjs（走 MCP 建节点的那一版）保持同样的尺寸令牌，方便两版对照。
import { FigDoc, rgb } from './figdoc.mjs';

export const SCREEN_W = 390, SCREEN_H = 844;
export const G = {
  canvas: '#F4F5F7', surface: '#FFFFFF', line: '#E2E4E8', edge: '#C9CDD4',
  ph: '#B4B6B9', ph2: '#DCDFE4', ink3: '#8B8D90', ink2: '#5A5C60', ink1: '#181B20', white: '#FFFFFF',
};
export const F = 'MiSans';
export const FS = { display: 28, title: 20, nav: 17, body: 15, sub: 13, cap: 11 };
export const R = { sm: 8, md: 12, lg: 16, pill: 999 };
// 圆角一律夹到短边一半：超过后引擎按镜像半径算，会外扩
R.pill_ = 32;
export const M = { side: 16, cardPad: 14, navH: 44 };
export const PAD_H = 16, CONTENT_W = SCREEN_W - 32, BTN_H = 52, TAB_H = 49;
export const ICON = { nav: 20, tab: 24, list: 22, empty: 44 };
export const STATUS = { h: 47 };
export const HOME = { w: 139, h: 5, y: 836 };

/** 便捷画布：一个屏 frame 作为坐标系 */
export class Canvas {
  constructor(doc, frame) { this.doc = doc; this.f = frame; }
  rect(o) { return this.doc.rect(this.f, o); }
  text(o) { return this.doc.text(this.f, o); }
  path(o) { return this.doc.path(this.f, o); }
  frame(o) { return this.doc.frame(this.f, o); }
}

const t1h = (size) => Math.round(size * 1.45);

// ── 图标：24 单位「切角方块 + 挖空内窗」（与 MCP 版同一画法）
export function icon(doc, c, { x, y, s = 24, on = false, name = 'icon' }) {
  const m = Math.round(s * 0.25), k = Math.round(s * 0.22);
  const iw = s - 2 * m;
  const pts = [
    [0, 0], [s - k, 0], [s, k], [s, s], [0, s],                      // 外框（顺时针）
    [m, m], [m, m + iw], [m + iw, m + iw], [m + iw, m],              // 内窗（逆时针 → 挖空）
  ];
  const segs = [
    { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }, { a: 4, b: 0 },
    { a: 5, b: 6 }, { a: 6, b: 7 }, { a: 7, b: 8 }, { a: 8, b: 5 },
  ].map(({ a, b }) => ({ a, b, ta: [0, 0], tb: [0, 0] }));
  return doc._add({
    id: doc._id(), name, type: 'vector', parent: c.f.id, transform: [1, 0, 0, 1, x, y],
    width: s, height: s,
    network: {
      vertices: pts.map(([vx, vy]) => ({ x: vx, y: vy, radius: 0 })),
      segments: segs,
      regions: [{ loops: [[0, 1, 2, 3, 4], [5, 6, 7, 8]], winding: 'nonZero' }],
    },
    fills: [{ type: 'solid', color: rgb(on ? G.ink1 : G.ink3) }],
  });
}

/** 描边折线（chevron / 对勾 / 火焰：一律用 strokes 列表画线，不靠填充） */
export function strokePath(doc, c, { name, pts, color = G.ink3, sw = 1.6, cap = 'round', join = 'round', dashes = null }) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const w = Math.max(1, Math.max(...xs) - x0), h = Math.max(1, Math.max(...ys) - y0);
  return doc._add({
    id: doc._id(), name, type: 'vector', parent: c.f.id, transform: [1, 0, 0, 1, x0, y0],
    width: w, height: h,
    network: {
      vertices: pts.map(([px, py]) => ({ x: px - x0, y: py - y0, radius: 0 })),
      segments: pts.slice(0, -1).map((_, i) => ({ a: i, b: i + 1, ta: [0, 0], tb: [0, 0] })),
      regions: [],
    },
    fills: [],
    strokes: [{ type: 'solid', color: rgb(color) }],
    stroke: { weight: sw, align: 'center', sides: null, cap_start: cap, cap_end: cap, join, miter_limit: 4, dashes: dashes || [] },
  });
}

export function arrow(doc, c, { x, y, w = 7, h = 12, dir = 'right', color = G.ink3, sw = 1.6, name = 'arrow' }) {
  const P = {
    right: [[x, y], [x + w, y + h / 2], [x, y + h]],
    left: [[x + w, y], [x, y + h / 2], [x + w, y + h]],
    down: [[x, y], [x + w / 2, y + h], [x + w, y]],
    up: [[x, y + h], [x + w / 2, y], [x + w, y + h]],
  }[dir];
  return strokePath(doc, c, { name, pts: P, color, sw });
}

export function check(doc, c, { x, y, s = 12, color = G.white, name = 'check' }) {
  return strokePath(doc, c, { name, pts: [[x, y + Math.round(s * 0.5)], [x + Math.round(s * 0.36), y + Math.round(s * 0.9)], [x + s, y]], color, sw: 1.8 });
}

export function flame(doc, c, { x, y, s = 28, color = G.ink1, name = 'flame' }) {
  const w = Math.round(s * 0.62);
  return strokePath(doc, c, {
    name,
    pts: [[x + w / 2, y], [x + w, y + Math.round(s * 0.42)], [x + w, y + Math.round(s * 0.7)], [x + w / 2, y + s], [x, y + Math.round(s * 0.7)], [x, y + Math.round(s * 0.42)], [x + w / 2, y]],
    color, sw: 1.6,
  });
}

// ── 系统层
export function statusBar(doc, c) {
  c.text({ name: 'time', x: 0, y: 15, w: 110, text: '9:41', size: 15, color: G.ink1, align: 'center' });
  const bx = 274;
  for (let i = 0; i < 4; i++) c.rect({ name: `cell${i}`, x: bx + i * 5, y: 29 - (i + 1) * 2, w: 3, h: 4 + (i + 1) * 2, r: 1, fill: G.ink1 });
  c.rect({ name: 'wifi1', x: bx + 26, y: 25, w: 14, h: 3, r: 1, fill: G.ink1 });
  c.rect({ name: 'wifi2', x: bx + 29, y: 30, w: 8, h: 3, r: 1, fill: G.ink1 });
  c.rect({ name: 'wifi3', x: bx + 31, y: 35, w: 4, h: 2, r: 1, fill: G.ink1 });
  c.rect({ name: 'batt', x: bx + 48, y: 24, w: 22, h: 11, r: 3, stroke: G.ink1 });
  c.rect({ name: 'batt-in', x: bx + 50, y: 26, w: 14, h: 7, r: 1, fill: G.ink1 });
  c.rect({ name: 'batt-tip', x: bx + 71, y: 27, w: 2, h: 5, r: 1, fill: G.ink1 });
}

export function homeBar(doc, c) {
  c.rect({ name: 'HOME', x: Math.round((SCREEN_W - HOME.w) / 2), y: HOME.y, w: HOME.w, h: HOME.h, r: 3, fill: G.ink1 });
}

export function navBar(doc, c, { title, y = 59, back = true, right = null, rule = true }) {
  if (back) arrow(doc, c, { x: 18, y: y + 15, w: 9, h: 15, dir: 'left', color: G.ink1, sw: 2, name: 'back' });
  c.text({ name: 'NAV title', x: 76, y: y + 13, w: SCREEN_W - 152, text: title, size: FS.nav, align: 'center' });
  if (right) c.text({ name: 'NAV right', x: SCREEN_W - 76, y: y + 15, w: 60, text: right, size: FS.body, color: G.ink2, align: 'right' });
  if (rule) c.rect({ name: 'NAV rule', x: 0, y: y + M.navH, w: SCREEN_W, h: 1, fill: G.line });
  return y + M.navH + 1;
}

export function largeHeader(doc, c, { kicker, title, y = 59, action = '编辑' }) {
  c.text({ name: 'kicker', x: PAD_H, y, w: CONTENT_W - 88, text: kicker, size: FS.sub, color: G.ink3 });
  c.text({ name: 'h1', x: PAD_H, y: y + 22, w: CONTENT_W - 88, text: title, size: FS.display });
  if (action) {
    c.rect({ name: 'act bg', x: SCREEN_W - PAD_H - 56, y: y + 16, w: 56, h: 30, r: R.pill, stroke: G.edge });
    c.text({ name: 'act', x: SCREEN_W - PAD_H - 56, y: y + 23, w: 56, text: action, size: FS.sub, color: G.ink2, align: 'center' });
  }
  return y + 66;
}

export function tabBar(doc, c, { active = 0, items = ['今日', '目标', '成长', '我的'], y = SCREEN_H - TAB_H - 34 }) {
  c.rect({ name: 'TAB bg', x: 0, y, w: SCREEN_W, h: TAB_H + 34, fill: G.surface });
  c.rect({ name: 'TAB rule', x: 0, y, w: SCREEN_W, h: 1, fill: G.line });
  // 列宽必须整除 390：用 floor 并把余量分给最后一列，否则文字框会探出屏幕右缘（实测 +2px）
  const n = items.length;
  const cw = Math.floor(SCREEN_W / n);
  for (let i = 0; i < n; i++) {
    const on = i === active;
    const x0 = i * cw;
    const w0 = i === n - 1 ? SCREEN_W - x0 : cw;
    const cx = x0 + Math.round(w0 / 2);
    icon(doc, c, { x: cx - ICON.tab / 2, y: y + 6, s: ICON.tab, on, name: `TAB ic ${i}` });
    c.text({ name: `TAB lb ${i}`, x: x0, y: y + 32, w: w0, text: items[i], size: FS.cap, color: on ? G.ink1 : G.ink3, align: 'center' });
  }
}

// ── 主控件
export const BTN_STATES = ['default', 'pressed', 'secondary', 'disabled', 'risk'];

export function button(doc, c, { x = PAD_H, y, w = CONTENT_W, h = BTN_H, label = '开始专注', state = 'default', sub = '' }) {
  const dy = state === 'pressed' ? 2 : 0;
  if (state === 'default' || state === 'pressed') {
    c.rect({ name: `BTN ${state}`, x, y: y + dy, w, h, r: R.md, fill: G.ink1 });
    c.text({ name: 'BTN label', x, y: y + dy + (sub ? 8 : 16), w, text: label, size: FS.body, color: G.white, align: 'center' });
    if (sub) c.text({ name: 'BTN sub', x, y: y + dy + 30, w, text: sub, size: FS.cap, color: G.white, align: 'center' });
  } else if (state === 'secondary') {
    c.rect({ name: 'BTN secondary', x, y, w, h, r: R.md, stroke: G.edge, sw: 1.2 });
    c.text({ name: 'BTN label', x, y: y + 16, w, text: label, size: FS.body, align: 'center' });
  } else if (state === 'disabled') {
    c.rect({ name: 'BTN disabled', x, y, w, h, r: R.md, fill: G.ph2 });
    c.text({ name: 'BTN label', x, y: y + 16, w, text: label, size: FS.body, color: G.ink3, align: 'center' });
  } else {
    c.rect({ name: 'BTN risk', x, y, w, h, r: R.md, stroke: G.ink2, dashes: [5, 4] });
    c.text({ name: 'BTN label', x, y: y + 16, w, text: label, size: FS.body, align: 'center' });
  }
}

export function row(doc, c, { x = 0, y, w = SCREEN_W, h = 60, label, sub = '', trailing = 'chev', value = '', selected = false, checked = false, rule = true, accent = false, hasIcon = true }) {
  if (selected) c.rect({ name: 'ROW sel', x, y, w, h, fill: G.canvas });
  if (accent) c.rect({ name: 'ROW accent', x, y: y + 10, w: 3, h: h - 20, r: 2, fill: G.ink1 });
  let tx = x + PAD_H;
  if (hasIcon) {
    c.rect({ name: 'ROW ic', x: tx, y: y + Math.round((h - ICON.list) / 2), w: ICON.list, h: ICON.list, r: 6, fill: G.ph });
    tx += ICON.list + 12;
  }
  c.text({ name: 'ROW label', x: tx, y: sub ? y + 10 : y + Math.round((h - 22) / 2), w: w - tx - PAD_H - 76, text: label, size: FS.body });
  if (sub) c.text({ name: 'ROW sub', x: tx, y: y + 32, w: w - tx - PAD_H - 76, text: sub, size: FS.sub, color: G.ink3 });
  const rx = x + w - PAD_H;
  if (checked) {
    c.rect({ name: 'ROW cb', x: rx - 24, y: y + Math.round((h - 24) / 2), w: 24, h: 24, r: R.pill, fill: G.ink1 });
    check(doc, c, { x: rx - 17, y: y + Math.round((h - 24) / 2) + 8, s: 10 });
  } else if (trailing === 'chev') {
    arrow(doc, c, { x: rx - 7, y: y + Math.round((h - 16) / 2), w: 7, h: 14, dir: 'right', name: 'ROW chev' });
  } else if (trailing === 'value') {
    c.text({ name: 'ROW value', x: rx - 130, y: y + Math.round((h - 20) / 2) + 1, w: 130, text: value, size: FS.body, color: G.ink2, align: 'right' });
  } else if (trailing === 'tag') {
    const tw = value.length * 13 + 18;
    c.rect({ name: 'ROW tag bg', x: rx - tw, y: y + Math.round((h - 24) / 2), w: tw, h: 24, r: R.sm, stroke: G.line });
    c.text({ name: 'ROW tag', x: rx - tw, y: y + Math.round((h - 24) / 2) + 5, w: tw, text: value, size: FS.cap, color: G.ink2, align: 'center' });
  }
  if (rule) c.rect({ name: 'ROW sep', x: x + (hasIcon ? PAD_H + ICON.list + 12 : PAD_H), y: y + h - 1, w: w - (hasIcon ? PAD_H * 2 + ICON.list + 12 : PAD_H * 2), h: 1, fill: G.line });
}

export function taskCard(doc, c, { x = PAD_H, y, w = CONTENT_W, h = 76, title, sub, xp = '+20', done = false, carry = false }) {
  c.rect({ name: 'TASK card', x, y, w, h, r: R.md, stroke: G.line });
  const bx = x + 14, by = y + Math.round((h - 24) / 2);
  if (done) {
    c.rect({ name: 'TASK cb', x: bx, y: by, w: 24, h: 24, r: R.pill, fill: G.ink1 });
    check(doc, c, { x: bx + 6, y: by + 8, s: 12 });
  } else {
    c.rect({ name: 'TASK cb', x: bx, y: by, w: 24, h: 24, r: R.pill, stroke: carry ? G.ink2 : G.edge, sw: 1.4, dashes: carry ? [3, 3] : null });
  }
  c.text({ name: 'TASK title', x: x + 50, y: y + 18, w: w - 50 - 74, text: title, size: FS.body, color: done ? G.ink3 : G.ink1 });
  if (done) c.rect({ name: 'TASK strike', x: x + 50, y: y + 27, w: Math.min(170, title.length * 15), h: 1, fill: G.ink3 });
  c.text({ name: 'TASK sub', x: x + 50, y: y + 40, w: w - 50 - 74, text: sub, size: FS.sub, color: G.ink3 });
  c.text({ name: 'TASK xp', x: x + w - 74, y: y + 18, w: 60, text: xp, size: FS.sub, color: done ? G.ink3 : G.ink2, align: 'right' });
  c.rect({ name: 'TASK soul', x: x + w - 74 + 44, y: y + h - 26, w: 16, h: 16, r: 4, stroke: G.edge, dashes: [2, 2] });
}

export function progress(doc, c, { x, y, w, v = 0.4, h = 6, mark = null, dashedFill = false, name = 'PROG' }) {
  c.rect({ name: name + ' track', x, y, w, h, r: 3, fill: G.ph2 });
  const fw = Math.round(w * Math.max(0, Math.min(1, v)));
  if (fw > 0) {
    if (dashedFill) c.rect({ name: name + ' fill', x, y, w: fw, h, r: 3, stroke: G.ink2, dashes: [4, 3] });
    else c.rect({ name: name + ' fill', x, y, w: fw, h, r: 3, fill: G.ink1 });
  }
  if (mark !== null) c.rect({ name: name + ' mark', x: x + Math.round(w * mark) - 1, y: y - 4, w: 2, h: h + 8, r: 1, fill: G.ink2 });
}

export function levelRing(doc, c, { x, y, s = 84, label = 'Lv', value = '07' }) {
  c.rect({ name: 'RING track', x, y, w: s, h: s, r: R.pill, stroke: G.line, sw: 6 });
  c.rect({ name: 'RING arc', x, y, w: s, h: s, r: R.pill, stroke: G.ink1, sw: 6, dashes: [2, 4] });
  const mid = y + Math.round(s / 2), vs = s >= 80 ? 20 : 15;
  c.text({ name: 'RING v', x, y: mid - vs + 2, w: s, text: value, size: vs, align: 'center' });
  c.text({ name: 'RING l', x, y: mid + 8, w: s, text: label, size: FS.cap, color: G.ink3, align: 'center' });
}

export function dots(doc, c, { x, y, n = 7, filled = 3, s = 12, gap = 6 }) {
  for (let i = 0; i < n; i++) c.rect({ name: `DOT ${i}`, x: x + i * (s + gap), y, w: s, h: s, r: 3, fill: i < filled ? G.ink1 : G.ph2 });
}

export function bars(doc, c, { x, y, w, h = 64, vals = [0.3, 0.5, 0.4, 0.7, 0.55, 0.8, 0.9] }) {
  const n = vals.length, gap = 8;
  const bw = Math.floor((w - gap * (n - 1)) / n);
  for (let i = 0; i < n; i++) {
    const bh = Math.max(4, Math.round(h * vals[i]));
    c.rect({ name: `BAR ${i}`, x: x + i * (bw + gap), y: y + h - bh, w: bw, h: bh, r: 3, fill: i === n - 1 ? G.ink1 : G.ph2 });
  }
}

export function segmented(doc, c, { x = PAD_H, y, w = CONTENT_W, h = 32, items = ['日', '周', '月'], active = 1 }) {
  c.rect({ name: 'SEG bg', x, y, w, h, r: R.sm, fill: G.ph2 });
  const cw = Math.floor((w - 4) / items.length);
  for (let i = 0; i < items.length; i++) {
    const on = i === active, cx2 = x + 2 + i * cw;
    if (on) c.rect({ name: 'SEG sel', x: cx2, y: y + 2, w: cw, h: h - 4, r: R.sm - 2, fill: G.surface, stroke: G.edge });
    c.text({ name: `SEG it ${i}`, x: cx2, y: y + 8, w: cw, text: items[i], size: FS.sub, color: on ? G.ink1 : G.ink3, align: 'center' });
  }
}

export function toggle(doc, c, { x, y, on = true }) {
  c.rect({ name: 'TOGGLE track', x, y, w: 51, h: 31, r: R.pill, fill: on ? G.ink1 : G.ph2 });
  c.rect({ name: 'TOGGLE knob', x: on ? x + 23 : x + 3, y: y + 3, w: 25, h: 25, r: R.pill, fill: G.white, stroke: on ? null : G.edge });
}

export function radio(doc, c, { x, y, on = true }) {
  c.rect({ name: 'RADIO ring', x, y, w: 22, h: 22, r: R.pill, stroke: on ? G.ink1 : G.edge, sw: 1.6 });
  if (on) c.rect({ name: 'RADIO dot', x: x + 6, y: y + 6, w: 10, h: 10, r: R.pill, fill: G.ink1 });
}

export function slider(doc, c, { x, y, w, v = 0.35, marks = 5, left = '轻', right = '重' }) {
  c.rect({ name: 'SLIDER track', x, y: y + 14, w, h: 4, r: 2, fill: G.ph2 });
  c.rect({ name: 'SLIDER fill', x, y: y + 14, w: Math.round(w * v), h: 4, r: 2, fill: G.ink1 });
  for (let i = 0; i < marks; i++) c.rect({ name: `SLIDER mark ${i}`, x: x + Math.round((w - 2) * (i / (marks - 1))), y: y + 24, w: 2, h: 5, r: 1, fill: G.edge });
  c.rect({ name: 'SLIDER knob', x: x + Math.round(w * v) - 13, y: y + 2, w: 26, h: 26, r: R.pill, fill: G.surface, stroke: G.ink1, sw: 2 });
  c.text({ name: 'SLIDER l', x, y: y + 34, w: 44, text: left, size: FS.cap, color: G.ink3 });
  c.text({ name: 'SLIDER r', x: x + w - 44, y: y + 34, w: 44, text: right, size: FS.cap, color: G.ink3, align: 'right' });
}

export function field(doc, c, { x = PAD_H, y, w = CONTENT_W, h = 52, label = null, value = '', placeholder = '点击选择' }) {
  if (label) c.text({ name: 'FIELD label', x, y: y - 22, w, text: label, size: FS.sub, color: G.ink3 });
  c.rect({ name: 'FIELD bg', x, y, w, h, r: R.sm, fill: G.surface, stroke: G.edge });
  c.text({ name: 'FIELD text', x: x + 14, y: y + Math.round((h - 20) / 2), w: w - 60, text: value || placeholder, size: FS.body, color: value ? G.ink1 : G.ink3 });
  arrow(doc, c, { x: x + w - 26, y: y + Math.round((h - 14) / 2), w: 9, h: 14, dir: 'down', name: 'FIELD chev' });
}

export function stepper(doc, c, { x, y, value = '3', w = 104, h = 34 }) {
  c.rect({ name: 'STEP bg', x, y, w, h, r: R.sm, fill: G.surface, stroke: G.edge });
  c.rect({ name: 'STEP minus', x: x + 12, y: y + Math.round(h / 2) - 1, w: 12, h: 2, r: 1, fill: G.ink2 });
  c.text({ name: 'STEP v', x: x + 28, y: y + Math.round((h - 20) / 2), w: w - 56, text: value, size: FS.body, align: 'center' });
  c.rect({ name: 'STEP plus-h', x: x + w - 24, y: y + Math.round(h / 2) - 1, w: 12, h: 2, r: 1, fill: G.ink2 });
  c.rect({ name: 'STEP plus-v', x: x + w - 19, y: y + Math.round(h / 2) - 6, w: 2, h: 12, r: 1, fill: G.ink2 });
}

export function chip(doc, c, { x, y, label, on = false, h = 28 }) {
  const w = Math.max(48, label.length * 13 + 24);
  c.rect({ name: 'CHIP bg', x, y, w, h, r: R.pill, fill: on ? G.ink1 : G.surface, stroke: on ? null : G.edge });
  c.text({ name: 'CHIP lb', x, y: y + 6, w, text: label, size: FS.cap, color: on ? G.white : G.ink2, align: 'center' });
  return { w, h };
}

export function medal(doc, c, { x, y, s = 72, tone = 'locked' }) {
  c.rect({ name: 'MEDAL disc', x, y, w: s, h: s, r: R.pill, fill: tone === 'on' ? G.ink1 : null, stroke: tone === 'on' ? null : G.edge, dashes: tone === 'locked' ? [4, 4] : null });
  const g = x + Math.round(s / 2) - 12;
  c.rect({ name: 'MEDAL glyph', x: g, y: y + Math.round(s / 2) - 12, w: 24, h: 24, r: 6, fill: tone === 'on' ? G.white : null, stroke: tone === 'on' ? null : G.edge, dashes: tone === 'on' ? null : [3, 3] });
}

export function emptyState(doc, c, { x = PAD_H, y, w = CONTENT_W, title = '还没有记录', sub = '完成第一个行动后会出现在这里', cta = '去添加目标' }) {
  c.rect({ name: 'EMPTY ph', x: x + Math.round(w / 2) - 24, y, w: 48, h: 48, r: 12, fill: G.ph2 });
  c.text({ name: 'EMPTY title', x, y: y + 62, w, text: title, size: FS.body, color: G.ink2, align: 'center' });
  c.text({ name: 'EMPTY sub', x, y: y + 86, w, text: sub, size: FS.sub, color: G.ink3, align: 'center' });
  c.rect({ name: 'EMPTY cta', x: x + Math.round(w / 2) - 60, y: y + 120, w: 120, h: 40, r: R.sm, stroke: G.edge });
  c.text({ name: 'EMPTY cta lb', x: x + Math.round(w / 2) - 60, y: y + 130, w: 120, text: cta, size: FS.sub, align: 'center' });
}

export function toast(doc, c, { x = PAD_H, y, w = CONTENT_W, h = 56, title = '专注 25 分钟', value = '+25 XP', dashedBar = false }) {
  c.rect({ name: 'TOAST bg', x, y, w, h, r: R.md, stroke: G.line });
  if (dashedBar) c.rect({ name: 'TOAST bar', x: x + 12, y: y + 12, w: 3, h: h - 24, r: 2, stroke: G.ink2, dashes: [3, 3] });
  else c.rect({ name: 'TOAST bar', x: x + 12, y: y + 12, w: 3, h: h - 24, r: 2, fill: G.ink1 });
  c.text({ name: 'TOAST title', x: x + 24, y: y + 18, w: w - 24 - 80, text: title, size: FS.body });
  c.text({ name: 'TOAST value', x: x + w - 92, y: y + 19, w: 80, text: value, size: FS.sub, color: G.ink2, align: 'right' });
}

export function sheet(doc, c, { y, h }) {
  c.rect({ name: 'SHEET scrim', x: 0, y: 0, w: SCREEN_W, h: SCREEN_H, fill: G.ink1, opacity: 0.28 });
  c.rect({ name: 'SHEET panel', x: 0, y, w: SCREEN_W, h, r: R.lg, fill: G.canvas });
  c.rect({ name: 'SHEET grab', x: Math.round(SCREEN_W / 2) - 18, y: y + 8, w: 36, h: 4, r: 2, fill: G.edge });
  return y + 30;
}

export function sectionHead(doc, c, { x = PAD_H, y, w = CONTENT_W, title, action = '查看全部' }) {
  c.text({ name: 'SEC t', x, y, w: w - 80, text: title, size: FS.body });
  if (action) c.text({ name: 'SEC a', x: x + w - 80, y: y + 1, w: 80, text: action, size: FS.sub, color: G.ink3, align: 'right' });
}

export function kvRow(doc, c, { x = PAD_H, y, w = CONTENT_W, k, v = '', h = 52, rule = true }) {
  c.text({ name: 'KV k', x, y: y + Math.round((h - 20) / 2), w: Math.round(w * 0.55), text: k, size: FS.body });
  if (v) c.text({ name: 'KV v', x: x + Math.round(w * 0.55), y: y + Math.round((h - 20) / 2), w: w - Math.round(w * 0.55), text: v, size: FS.body, color: G.ink3, align: 'right' });
  if (rule) c.rect({ name: 'KV sep', x, y: y + h - 1, w, h: 1, fill: G.line });
}

export function tableRow(doc, c, { x = PAD_H, y, w = CONTENT_W, cells, h = 44, head = false }) {
  const cw = Math.floor(w / cells.length);
  for (let i = 0; i < cells.length; i++) {
    c.text({ name: `TF c${i}`, x: x + i * cw, y: y + Math.round((h - 18) / 2), w: cw - 6, text: cells[i], size: head ? FS.cap : FS.sub, color: head ? G.ink3 : G.ink1, align: i === 0 ? 'left' : 'right' });
  }
  c.rect({ name: 'TF sep', x, y: y + h - 1, w, h: 1, fill: G.line });
}

export function skeleton(doc, c, { x = PAD_H, y, w = CONTENT_W, rows = 3 }) {
  for (let i = 0; i < rows; i++) c.rect({ name: `SK ${i}`, x, y: y + i * 34, w: i % 3 === 2 ? Math.round(w * 0.55) : w, h: 14, r: 4, fill: G.ph2 });
}

export { rgb };
