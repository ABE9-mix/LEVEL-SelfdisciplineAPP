// 组件库第二批：补齐 IA 10 屏与手摆板还缺的控件
// 全部颜色走 var: 令牌，便于后续整体约束视觉
import { writeFileSync } from 'node:fs';

const L = [];
const P = (s) => L.push('      ' + s);
const V = (n) => `var:${n}`;
const T = { p: V('text/primary'), i: V('text/inverse'), s: V('text/secondary'), d: V('text/disabled'), m: V('text/muted') };
const BG = { void: V('bg/void'), sunk: V('bg/sunken'), base: V('bg/base'), raise: V('bg/raise') };

function r(x, y, w, h, o = {}) {
  const a = [`x={${x}}`, `y={${y}}`, `w={${w}}`, `h={${h}}`];
  if (o.bg) a.push(`bg="${o.bg}"`);
  if (o.stroke) a.push(`stroke="${o.stroke}"`, `strokeWidth={${o.sw ?? 2}}`);
  if (o.radius) a.push(`radius={${o.radius}}`);
  a.push('flex="none"');
  return `<Frame name="${o.name || 'r'}" ${a.join(' ')} />`;
}
function t(s, x, y, w, h, o = {}) {
  const a = [`x={${x}}`, `y={${y}}`, `w={${w}}`, `h={${h}}`, `size={${o.size || 12}}`, `color="${o.color || T.p}"`];
  if (o.align) a.push(`align="${o.align}"`);
  return `<Text ${a.join(' ')}>${s}</Text>`;
}
function label(s, x, y) { P(t(s, x, y, 300, 14, { size: 12, color: T.m })); }
function sect(s, y) { P(t(s, 40, y, 1320, 24, { size: 24, color: V('text/primary') })); }
function variant(name, x, y, w, h, kids) {
  P(`<Frame name="${name}" x={${x}} y={${y}} w={${w}} h={${h}} bg="${BG.void}" flex="none">`);
  for (const k of kids) P('  ' + k);
  P(`</Frame>`);
}

P(`<Frame name="组件库-标准 v2" x={4050} y={0} w={1400} h={3560} bg="#1a1a1a" flex="none">`);

// ══ ① Bar/Status 390×28
sect('① Bar/Status 状态栏 390×28', 24);
for (const [k, bg, fg] of [['default', BG.sunk, T.p], ['inverse', V('line/strong'), T.i]]) {
  const x = 40 + (k === 'inverse' ? 430 : 0);
  variant(`Bar/Status, kind=${k}`, x, 60, 390, 28, [
    r(0, 0, 390, 28, { name: 'bg', bg }),
    t('9:41', 10, 6, 60, 16, { size: 12, color: fg }),
    ...[0, 1, 2, 3].map((i) => r(320 + i * 6, 18 - i * 4, 4, 4 + i * 4, { name: 'sig' + i, bg: fg })),
    r(352, 9, 22, 10, { name: 'bat', stroke: fg, sw: 1 }),
    r(374, 12, 2, 4, { name: 'batcap', bg: fg }),
  ]);
}

// ══ ② Bar/Nav 390×44
sect('② Bar/Nav 导航栏 390×44', 116);
const NAV = [['none', null], ['text', '保存'], ['icon', 'ico']];
NAV.forEach(([k, act], i) => {
  const x = 40 + i * 430;
  const kids = [
    r(0, 0, 390, 44, { name: 'bg', bg: BG.base }),
    r(0, 43, 390, 1, { name: 'line', bg: V('line/soft') }),
    r(12, 16, 10, 2, { name: 'chev1', bg: T.p }), r(10, 18, 2, 2, { name: 'chev2', bg: T.p }),
    r(14, 20, 2, 2, { name: 'chev3', bg: T.p }), r(12, 22, 10, 2, { name: 'chev4', bg: T.p }),
    t('任务详情', 0, 14, 390, 18, { size: 12, align: 'center', color: T.p }),
  ];
  if (k === 'text') kids.push(t(act, 330, 14, 48, 18, { size: 12, align: 'center', color: V('accent/go') }));
  if (k === 'icon') kids.push(r(352, 14, 16, 16, { name: 'icon', stroke: T.p, sw: 2 }));
  variant(`Bar/Nav, action=${k}`, x, 152, 390, 44, kids);
});

// ══ ③ Icon/Glyph 16×16
sect('③ Icon/Glyph 图标字形 16×16', 228);
const G = {
  menu: [[0, 3, 14, 2], [0, 7, 14, 2], [0, 11, 14, 2]],
  check: [[2, 7, 3, 3], [5, 10, 3, 3], [8, 7, 3, 3], [11, 4, 3, 3]],
  'tri-down': [[2, 5, 12, 3], [4, 8, 8, 3], [6, 11, 4, 3]],
  'tri-up': [[6, 2, 4, 3], [4, 5, 8, 3], [2, 8, 12, 3]],
  'arrow-right': [[1, 7, 9, 2], [9, 4, 2, 2], [11, 6, 2, 2], [9, 10, 2, 2], [11, 8, 2, 2]],
  'arrow-left': [[6, 7, 9, 2], [5, 4, 2, 2], [3, 6, 2, 2], [5, 10, 2, 2], [3, 8, 2, 2]],
  play: [[4, 3, 3, 10], [7, 5, 3, 6], [10, 7, 3, 2]],
  pause: [[4, 3, 3, 10], [9, 3, 3, 10]],
  plus: [[7, 2, 2, 12], [2, 7, 12, 2]],
  close: [[2, 2, 2, 2], [4, 4, 2, 2], [6, 6, 2, 2], [8, 8, 2, 2], [10, 10, 2, 2], [12, 12, 2, 2],
    [12, 2, 2, 2], [10, 4, 2, 2], [8, 6, 2, 2], [6, 8, 2, 2], [4, 10, 2, 2], [2, 12, 2, 2]],
  user: [[6, 2, 4, 4], [3, 8, 10, 3], [4, 11, 8, 3]],
  gear: [[6, 1, 4, 14], [1, 6, 14, 4], [6, 6, 4, 4]],
};
const gnames = Object.keys(G);
gnames.forEach((g, i) => {
  const x = 40 + (i % 6) * 90;
  const y = 264 + Math.floor(i / 6) * 78;
  variant(`Icon/Glyph, name=${g}`, x, y, 16, 16, G[g].map((b, j) => r(b[0], b[1], b[2], b[3], { name: 'b' + j, bg: T.p })));
  label(g, x, y + 24);
});

// ══ ④ Icon/Btn 28×28
sect('④ Icon/Btn 图标按钮 28×28', 436);
[['normal', BG.base, null, T.p], ['active', V('line/strong'), null, T.i], ['disabled', V('line/track'), null, T.d]]
  .forEach(([k, bg, st, fg], i) => {
    const x = 40 + i * 60;
    variant(`Icon/Btn, state=${k}`, x, 472, 28, 28, [
      r(0, 0, 28, 28, { name: 'bg', bg, ...(st ? { stroke: st, sw: 2 } : {}) }),
      ...[0, 1, 2].map((j) => r(8, 9 + j * 4, 12, 2, { name: 'g' + j, bg: fg })),
    ]);
  });

// ══ ⑤ Field/Input 358×48
sect('⑤ Field/Input 输入框 358×48', 524);
[['normal', V('line/soft')], ['focus', V('accent/confirm')], ['disabled', V('line/track')], ['error', V('accent/stop')]]
  .forEach(([k, st], i) => {
    const x = 40 + (i % 2) * 400;
    const y = 560 + Math.floor(i / 2) * 66;
    variant(`Field/Input, state=${k}`, x, y, 358, 48, [
      r(0, 0, 358, 48, { name: 'bg', bg: k === 'disabled' ? V('bg/sunken') : BG.sunken, stroke: st, sw: 2 }),
      t('输入内容', 12, 15, 300, 18, { size: 12, color: k === 'disabled' ? T.d : (k === 'normal' ? T.m : T.p) }),
    ]);
  });

// ══ ⑥ Row/List 358×56
sect('⑥ Row/List 列表行 358×56', 700);
[['normal', '个人资料'], ['toggle', '提醒通知'], ['value', '目标名称'], ['danger', '归档机构']]
  .forEach(([k, lab], i) => {
    const x = 40 + (i % 2) * 400;
    const y = 736 + Math.floor(i / 2) * 66;
    const kids = [
      r(0, 0, 358, 56, { name: 'bg', bg: BG.base }),
      r(0, 55, 358, 1, { name: 'line', bg: V('line/soft') }),
      t(lab, 12, 19, 200, 18, { size: 12, color: k === 'danger' ? V('accent/stop') : T.p }),
    ];
    if (k === 'normal') kids.push(r(42, 12, 10, 2, { name: 'c1', bg: T.d }), r(44, 14, 2, 2, { name: 'c2', bg: T.d }), r(46, 16, 2, 2, { name: 'c3', bg: T.d }), r(44, 18, 6, 2, { name: 'c4', bg: T.d }));
    if (k === 'toggle') kids.push(r(302, 16, 44, 24, { name: 'tbg', bg: V('accent/go-deep') }), r(324, 18, 20, 20, { name: 'knob', bg: T.p }));
    if (k === 'value') kids.push(t('8 周力量', 240, 19, 106, 18, { size: 12, align: 'right', color: T.s }));
    variant(`Row/List, kind=${k}`, x, y, 358, 56, kids);
  });

// ══ ⑦ Ctrl/Toggle 44×24
sect('⑦ Ctrl/Toggle 开关 44×24', 880);
[['true', V('accent/go-deep'), 22], ['false', V('line/track'), 2]].forEach(([k, bg, kx], i) => {
  variant(`Ctrl/Toggle, on=${k}`, 40 + i * 100, 916, 44, 24, [
    r(0, 0, 44, 24, { name: 'bg', bg }),
    r(kx, 2, 20, 20, { name: 'knob', bg: T.p }),
  ]);
});

// ══ ⑧ Ctrl/Check 24×24
sect('⑧ Ctrl/Check 勾选框 24×24', 976);
[['true', BG.base, V('line/strong')], ['false', BG.sunken, V('line/soft')]].forEach(([k, bg, st], i) => {
  const x = 40 + i * 60;
  const kids = [r(0, 0, 24, 24, { name: 'bg', bg, stroke: st, sw: 2 })];
  if (k === 'true') kids.push(r(4, 10, 4, 4, { name: 'k1', bg: T.i }), r(8, 14, 4, 4, { name: 'k2', bg: T.i }), r(12, 10, 4, 4, { name: 'k3', bg: T.i }), r(16, 6, 4, 4, { name: 'k4', bg: T.i }));
  variant(`Ctrl/Check, on=${k}`, x, 1012, 24, 24, kids);
});

// ══ ⑨ Ctrl/Slider 358×24
sect('⑨ Ctrl/Slider 滑杆 358×24', 1072);
[['normal', T.p], ['disabled', T.d]].forEach(([k, fg], i) => {
  variant(`Ctrl/Slider, state=${k}`, 40 + i * 400, 1108, 358, 24, [
    r(0, 9, 358, 6, { name: 'track', bg: V('line/track') }),
    r(0, 9, 143, 6, { name: 'fill', bg: fg }),
    r(135, 0, 16, 24, { name: 'knob', bg: fg }),
  ]);
});

// ══ ⑩ Chip/Filter 88×32
sect('⑩ Chip/Filter 筛选芯片 88×32', 1168);
[['true', V('line/strong'), null, T.i], ['false', BG.base, V('line/soft'), T.s]].forEach(([k, bg, st, fg], i) => {
  variant(`Chip/Filter, on=${k}`, 40 + i * 120, 1204, 88, 32, [
    r(0, 0, 88, 32, { name: 'bg', bg, ...(st ? { stroke: st, sw: 2 } : {}) }),
    t('体能署', 0, 8, 88, 18, { size: 12, align: 'center', color: fg }),
  ]);
});

// ══ ⑪ Block/Ring 260×260
sect('⑪ Block/Ring 进度环 260×260', 1264);
[['idle', 0], ['running', 130], ['done', 260]].forEach(([k, front], i) => {
  const x = 40 + i * 290;
  const kids = [r(0, 0, 260, 260, { name: 'outer', bg: BG.base, radius: 130, stroke: V('line/track'), sw: 2 })];
  if (front) kids.push(r(6, 6, front === 260 ? 248 : 248, 248, { name: 'prog', bg: k === 'done' ? V('accent/go') : V('accent/warn'), radius: 124 }));
  kids.push(r(24, 24, 212, 212, { name: 'inner', bg: BG.void, radius: 106 }));
  kids.push(t('25:00', 0, 112, 260, 34, { size: 36, align: 'center', color: T.p }));
  variant(`Block/Ring, state=${k}`, x, 1300, 260, 260, kids);
});

// ══ ⑫ Card/Event 358×120
sect('⑫ Card/Event 事件卡 358×120', 1600);
[['text', false], ['media', true]].forEach(([k, hasBox], i) => {
  const x = 40 + i * 400;
  const kids = [
    r(0, 0, 358, 120, { name: 'bg', bg: BG.base, stroke: V('line/strong'), sw: 2 }),
    t('事件：XXXXX', 12, 14, 220, 20, { size: 12, color: T.p }),
    t('详细内容：XXXXXXXXXX', 12, 40, 300, 18, { size: 12, color: T.s }),
  ];
  if (hasBox) kids.push(r(12, 68, 60, 40, { name: 'thumb', bg: BG.raise }));
  kids.push(r(288, 68, 26, 26, { name: 'circle', bg: BG.raise, radius: 13 }),
    r(322, 68, 24, 26, { name: 'playbtn', bg: V('line/strong') }),
    r(329, 74, 4, 14, { name: 'p1', bg: T.i }), r(333, 77, 4, 8, { name: 'p2', bg: T.i }), r(337, 80, 4, 2, { name: 'p3', bg: T.i }));
  variant(`Card/Event, kind=${k}`, x, 1636, 358, 120, kids);
});

// ══ ⑬ Card/Program 358×88
sect('⑬ Card/Program 计划卡 358×88', 1780);
[['active', '进行中', V('accent/go')], ['paused', '已暂停', T.d], ['done', '已完成', V('accent/confirm')]]
  .forEach(([k, st, dot], i) => {
    const x = 40 + i * 400;
    variant(`Card/Program, state=${k}`, x, 1816, 358, 88, [
      r(0, 0, 358, 88, { name: 'bg', bg: BG.base, stroke: V('line/strong'), sw: 2 }),
      t('8 周力量', 12, 14, 220, 20, { size: 12, color: T.p }),
      r(300, 16, 10, 10, { name: 'dot', bg: dot }),
      t(st, 240, 14, 56, 18, { size: 12, align: 'right', color: T.s }),
      r(12, 46, 334, 8, { name: 'ptrack', bg: V('line/track') }),
      r(12, 46, k === 'done' ? 334 : 140, 8, { name: 'pfill', bg: T.p }),
      t('第 5 / 24 格', 12, 62, 200, 16, { size: 12, color: T.s }),
    ]);
  });

// ══ ⑭ Card/Facility 358×92
sect('⑭ Card/Facility 设施卡 358×92', 1936);
[['building', '营建中', V('accent/warn')], ['running', '在营', V('accent/go')],
 ['idle', '巡航', T.d], ['parked', '停机', T.m]].forEach(([k, st, dot], i) => {
  const x = 40 + (i % 2) * 400;
  const y = 1972 + Math.floor(i / 2) * 104;
  variant(`Card/Facility, state=${k}`, x, y, 358, 92, [
    r(0, 0, 358, 92, { name: 'bg', bg: k === 'parked' ? BG.void : BG.base, stroke: k === 'parked' ? V('line/track') : V('line/strong'), sw: 2 }),
    r(12, 14, 64, 64, { name: 'thumb', bg: BG.raise }),
    t('体能署', 88, 20, 200, 20, { size: 12, color: k === 'parked' ? T.m : T.p }),
    r(88, 46, 10, 10, { name: 'dot', bg: dot }),
    t(st, 104, 44, 100, 16, { size: 12, color: T.s }),
    t('I2 · 8 周力量 · 第 5/24 格', 88, 64, 254, 16, { size: 12, color: T.s }),
  ]);
});

// ══ ⑮ Panel/Dialog 326×200
sect('⑮ Panel/Dialog 弹层 326×200', 2200);
[['confirm', '确认', V('accent/go-deep')], ['alert', '知道了', V('line/strong')]].forEach(([k, ok, okbg], i) => {
  const x = 40 + i * 370;
  variant(`Panel/Dialog, kind=${k}`, x, 2236, 326, 200, [
    r(0, 0, 326, 200, { name: 'bg', bg: BG.base, stroke: V('line/strong'), sw: 2 }),
    t('标题', 16, 20, 294, 22, { size: 24, color: T.p }),
    t('说明文字，最多两行。', 16, 56, 294, 40, { size: 12, color: T.s }),
    r(16, 130, 140, 40, { name: 'cancel', bg: BG.sunken, stroke: V('line/strong'), sw: 2 }),
    t('取消', 16, 141, 140, 18, { size: 12, align: 'center', color: T.s }),
    r(170, 130, 140, 40, { name: 'ok', bg: okbg }),
    t(ok, 170, 141, 140, 18, { size: 12, align: 'center', color: k === 'confirm' ? T.i : T.i }),
  ]);
});

// ══ ⑯ State/Page 358×240
sect('⑯ State/Page 空/错误状态 358×240', 2464);
[['empty', '还没有记录', '今天完成一次，趋势就会长出来。', '去打卡'],
 ['error', '记录没同步上', '本地这份还在。', '重试']].forEach(([k, ttl, sub, btn], i) => {
  const x = 40 + i * 400;
  variant(`State/Page, kind=${k}`, x, 2500, 358, 240, [
    r(0, 0, 358, 240, { name: 'bg', bg: BG.base, stroke: V('line/soft'), sw: 1 }),
    r(167, 40, 24, 24, { name: 'glyph', stroke: T.d, sw: 2 }),
    t(ttl, 0, 84, 358, 24, { size: 24, align: 'center', color: T.p }),
    t(sub, 0, 116, 358, 18, { size: 12, align: 'center', color: T.s }),
    r(103, 160, 152, 40, { name: 'btn', bg: BG.sunken, stroke: V('line/strong'), sw: 2 }),
    t(btn, 103, 171, 152, 18, { size: 12, align: 'center', color: T.p }),
  ]);
});

// ══ ⑰ Toast 326×44
sect('⑰ Toast 轻提示 326×44', 2780);
[['info', T.s], ['success', V('accent/go')], ['warn', V('accent/warn')]].forEach(([k, dot], i) => {
  const x = 40 + i * 370;
  variant(`Toast, kind=${k}`, x, 2816, 326, 44, [
    r(0, 0, 326, 44, { name: 'bg', bg: BG.base, stroke: V('line/strong'), sw: 2 }),
    r(14, 17, 10, 10, { name: 'dot', bg: dot }),
    t('记下了。+20 XP', 34, 13, 278, 18, { size: 12, color: T.p }),
  ]);
});

// ══ ⑱ Avatar 64×64
sect('⑱ Avatar 头像 64×64', 2900);
[['square', 0], ['circle', 32]].forEach(([k, rad], i) => {
  variant(`Avatar, shape=${k}`, 40 + i * 100, 2936, 64, 64, [
    r(0, 0, 64, 64, { name: 'bg', bg: BG.raise, radius: rad, stroke: V('line/strong'), sw: 2 }),
    r(22, 14, 20, 20, { name: 'head', bg: T.d, radius: 10 }),
    r(14, 40, 36, 16, { name: 'body', bg: T.d, radius: 4 }),
  ]);
});

// ══ ⑲ Bar/Progress 新增 stripe 变体
sect('⑲ Bar/Progress · 新增 style=stripe', 3040);
const stripe = [];
for (let row = 0; row < 3; row++) {
  for (let c = 0; c < 45; c++) {
    const x = c * 8 + row * 4;
    if (x + 4 > 358) continue;
    stripe.push(r(x, row * 4, 4, 4, { name: `s${row}_${c}`, bg: x < 143 ? T.p : V('line/track') }));
  }
}
variant('Bar/Progress, style=stripe', 40, 3076, 358, 12, stripe);

P(`</Frame>`);
writeFileSync(process.argv[2] || '_kit2.jsx', L.join('\n'));
console.log('written bytes=' + L.join('\n').length + ' lines=' + L.length);
