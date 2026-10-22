// 组件库生成器：输出 JSX，渲染为变体帧（之后转组件 + 合并变体）
import { writeFileSync } from 'node:fs';

const L = [];
const P = (s) => L.push('      ' + s);

const V = (n) => `var:${n}`;
function rect(x, y, w, h, o = {}) {
  const a = [`x={${x}}`, `y={${y}}`, `w={${w}}`, `h={${h}}`];
  if (o.bg) a.push(`bg="${o.bg}"`);
  if (o.stroke) a.push(`stroke="${o.stroke}"`, `strokeWidth={${o.sw ?? 2}}`);
  if (o.radius) a.push(`radius={${o.radius}}`);
  a.push('flex="none"');
  return `<Frame name="${o.name || 'r'}" ${a.join(' ')} />`;
}
function txt(s, x, y, w, h, o = {}) {
  const a = [`x={${x}}`, `y={${y}}`, `w={${w}}`, `h={${h}}`, `size={${o.size || 12}}`, `color="${o.color || V('text/primary')}"`];
  if (o.align) a.push(`align="${o.align}"`);
  return `<Text ${a.join(' ')}>${s}</Text>`;
}
// 变体帧
function variant(name, x, y, w, h, kids) {
  P(`<Frame name="${name}" x={${x}} y={${y}} w={${w}} h={${h}} bg="${V('bg/void')}" flex="none">`);
  for (const k of kids) P('  ' + k);
  P(`</Frame>`);
}

// ══ 分组标题
P(`<Frame name="组件库-标准 v1" x={2600} y={0} w={1300} h={2140} bg="#1a1a1a" flex="none">`);
const H = (s, y) => P(`<Text x={40} y={${y}} w={1180} h={28} size={24} color="#ffffff">${s}</Text>`);

// ── ① 令牌图例
H('① 令牌 Tokens（SP/Color · SP/Metric）', 40);
const swatches = [
  ['bg/void', '#000000'], ['bg/sunken', '#151515'], ['bg/base', '#2c2c2c'], ['bg/raise', '#4b4b4b'],
  ['line/strong', '#c8c8c8'], ['line/soft', '#a9a9a9'], ['line/track', '#666666'],
  ['text/primary', '#ffffff'], ['text/inverse', '#000000'], ['text/secondary', '#b0b0b0'],
  ['text/disabled', '#7e7e7e'], ['text/muted', '#666666'],
  ['accent/go', '#04ff00'], ['accent/go-deep', '#2bbf18'], ['accent/stop', '#ff0d00'],
  ['accent/warn', '#ffe100'], ['accent/confirm', '#4d8fd6'],
];
swatches.forEach(([n, hex], i) => {
  const cx = 40 + (i % 3) * 400;
  const cy = 84 + Math.floor(i / 3) * 44;
  P(rect(cx, cy, 36, 36, { name: n, bg: hex, stroke: '#555555', sw: 1 }));
  P(txt(n, cx + 46, cy + 4, 240, 16, { size: 12, color: '#ffffff' }));
  P(txt(hex, cx + 46, cy + 20, 240, 16, { size: 12, color: '#7e7e7e' }));
});
P(txt('尺寸: space 4/8/12/16/24 · stroke 1/2 · h 32/40/48 · content 358 · type 12/24/36/48', 40, 372, 1180, 20, { size: 12, color: '#b0b0b0' }));

// ── ② Seg/Bar  358×40
H('② Seg/Bar 分段选择器 358×40（选中=浅底黑字）', 410);
const SEG = ['PLAN 计划列表', 'TASKS 任务', 'BASE 基地'];
for (let sel = 0; sel < 3; sel++) {
  const bx = 40 + sel * 420;
  const kids = [];
  for (let i = 0; i < 3; i++) {
    const on = i === sel;
    kids.push(rect(2 + i * 118, 2, 114, 32, { name: 'seg' + i, bg: V(on ? 'line/strong' : 'bg/sunken') }));
    kids.push(txt(SEG[i], 2 + i * 118, 8, 114, 20, { size: 12, align: 'center', color: V(on ? 'text/inverse' : 'text/disabled') }));
  }
  variant(`Seg/Bar, sel=${['plan', 'tasks', 'base'][sel]}`, bx, 454, 358, 40, kids);
}

// ── ③ Btn/Action  112×40
H('③ Btn/Action 动作按钮 112×40', 530);
const KINDS = [
  ['light', V('line/strong'), null, V('text/inverse')],
  ['outline', V('bg/base'), V('line/strong'), V('text/primary')],
  ['go', V('accent/go-deep'), null, V('text/inverse')],
  ['stop', V('accent/stop'), null, V('text/primary')],
  ['confirm', V('accent/confirm'), null, V('text/primary')],
];
KINDS.forEach(([k, bg, st, tx], i) => {
  const bx = 40 + i * 168;
  variant(`Btn/Action, kind=${k}, state=normal`, bx, 574, 112, 40,
    [rect(0, 0, 112, 40, { name: 'bg', bg, ...(st ? { stroke: st, sw: 2 } : {}) }),
     txt('按钮', 0, 10, 112, 20, { size: 12, align: 'center', color: tx })]);
});
KINDS.forEach(([k], i) => {
  const bx = 40 + i * 168;
  variant(`Btn/Action, kind=${k}, state=disabled`, bx, 634, 112, 40,
    [rect(0, 0, 112, 40, { name: 'bg', bg: V('line/track') }),
     txt('按钮', 0, 10, 112, 20, { size: 12, align: 'center', color: V('text/disabled') })]);
});

// ── ④ Btn/Status  120×48（双行）
H('④ Btn/Status 任务状态按钮 120×48（双行）', 706);
variant('Btn/Status, kind=launch', 40, 750, 120, 48, [
  rect(0, 0, 120, 48, { name: 'bg', bg: V('accent/go-deep') }),
  txt('LAUNCH', 0, 5, 120, 14, { size: 12, align: 'center', color: V('text/inverse') }),
  txt('发射', 0, 18, 120, 28, { size: 24, align: 'center', color: V('text/inverse') }),
]);
variant('Btn/Status, kind=stop', 200, 750, 120, 48, [
  rect(0, 0, 120, 48, { name: 'bg', bg: V('accent/stop') }),
  txt('Emergency stop', 0, 5, 120, 14, { size: 12, align: 'center', color: V('text/primary') }),
  txt('终止', 0, 18, 120, 28, { size: 24, align: 'center', color: V('text/primary') }),
]);

// ── ⑤ Chip/Status  80×32
H('⑤ Chip/Status 状态标签 80×32', 822);
const CHIPS = [
  ['idle', '待机', V('text/disabled')],
  ['active', '执行中', V('accent/go')],
  ['success', '任务成功', V('accent/go')],
  ['warn', '待确认', V('accent/warn')],
];
CHIPS.forEach(([k, label, dot], i) => {
  const bx = 40 + i * 120;
  variant(`Chip/Status, kind=${k}`, bx, 866, 80, 32, [
    rect(0, 0, 80, 32, { name: 'bg', bg: V('line/strong') }),
    rect(6, 11, 10, 10, { name: 'dot', bg: dot }),
    txt(label, 20, 8, 54, 18, { size: 12, align: 'center', color: V('text/inverse') }),
  ]);
});

// ── ⑥ Bar/Progress  358×12
H('⑥ Bar/Progress 进度条 358×12', 922);
variant('Bar/Progress, style=block', 40, 966, 358, 12, [
  rect(0, 0, 358, 8, { name: 'track', bg: V('line/track') }),
  rect(0, 0, 143, 8, { name: 'fill', bg: V('text/primary') }),
]);
variant('Bar/Progress, style=ticks', 440, 966, 358, 12, [
  rect(0, 0, 358, 12, { name: 'track', bg: V('bg/sunken') }),
  ...Array.from({ length: 24 }, (_, i) => rect(i * 15, 2, 8, 8, { name: 't' + i, bg: i < 10 ? V('text/primary') : V('line/track') })),
]);

// ── ⑦ Card/Task  358×150
H('⑦ Card/Task 任务卡 358×150', 1022);
const TASK_STATES = [
  ['launching', '15:00', '执行中', 'stop', 'terminate'],
  ['idle', '12:00', '待机', 'launch', 'launch'],
  ['done', '12:00', '任务成功', 'launch', 'launch'],
];
TASK_STATES.forEach(([state, time, chip, kind, act], i) => {
  const bx = 40 + i * 420;
  const isStop = kind === 'stop';
  variant(`Card/Task, state=${state}`, bx, 1066, 358, 150, [
    rect(0, 0, 358, 150, { name: 'bg', bg: V('bg/base') }),
    rect(2, 2, 354, 56, { name: 'visual', bg: state === 'done' ? '#4b4b4b' : '#3a3a3a' }),
    rect(2, 58, 354, 2, { name: 'divider', bg: V('line/strong') }),
    txt(time, 14, 68, 110, 32, { size: 24, color: V('text/primary') }),
    txt('PM', 126, 82, 30, 16, { size: 12, color: V('text/primary') }),
    rect(166, 74, 80, 32, { name: 'chipbg', bg: V('line/strong') }),
    rect(172, 85, 10, 10, { name: 'chipdot', bg: state === 'idle' ? V('text/disabled') : V('accent/go') }),
    txt(chip, 186, 82, 54, 18, { size: 12, align: 'center', color: V('text/inverse') }),
    rect(238, 66, 120, 48, { name: 'actbg', bg: isStop ? V('accent/stop') : V('accent/go-deep') }),
    txt(isStop ? 'Emergency' : 'LAUNCH', 238, 71, 120, 14, { size: 12, align: 'center', color: isStop ? V('text/primary') : V('text/inverse') }),
    txt(act === 'terminate' ? '终止' : '发射', 238, 84, 120, 28, { size: 24, align: 'center', color: isStop ? V('text/primary') : V('text/inverse') }),
    rect(16, 126, 326, 8, { name: 'ptrack', bg: V('line/track') }),
    rect(16, 126, state === 'done' ? 326 : 130, 8, { name: 'pfill', bg: V('text/primary') }),
  ]);
});

// ── ⑧ Card/Knowledge  358×500
H('⑧ Card/Knowledge 知识卡 358×500', 1246);
for (const [k, code, label] of [['new', 'TIM-006', '新获得'], ['review', 'TIM-006', '复习']]) {
  const bx = k === 'new' ? 40 : 440;
  variant(`Card/Knowledge, state=${k}`, bx, 1290, 358, 500, [
    rect(0, 0, 358, 500, { name: 'bg', bg: V('bg/base') }),
    rect(2, 2, 354, 340, { name: 'art', bg: '#4b4b4b' }),
    txt('卡片正文：月亮离我们平均约 38 万公里，光走这段路约 1.3 秒。', 16, 354, 326, 48, { size: 12, color: V('text/primary') }),
    txt(code, 16, 408, 200, 44, { size: 36, color: V('accent/warn') }),
    rect(16, 456, 80, 32, { name: 'chipbg', bg: V('line/strong') }),
    rect(22, 467, 10, 10, { name: 'chipdot', bg: V('accent/go') }),
    txt(label, 36, 464, 54, 18, { size: 12, align: 'center', color: V('text/inverse') }),
  ]);
}

P(`</Frame>`);
writeFileSync(process.argv[2] || '_kit.jsx', L.join('\n'));
console.log('written; bytes=' + L.join('\n').length);
