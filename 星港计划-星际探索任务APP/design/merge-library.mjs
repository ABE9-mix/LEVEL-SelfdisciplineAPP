// 合并 v1 + v2 的组件库：全部移入一个独立帧，按类别重排
import { spawn } from 'node:child_process';
const b = 'C:/Users/ABE9/.workbuddy/mcp-servers/figma-bridge-mcp/node_modules/figma-bridge-mcp/src/server.js';
const child = spawn(process.execPath, [b], { stdio: ['pipe', 'pipe', 'pipe'] });
let buf = ''; const pending = new Map(); let nextId = 1;
child.stdout.on('data', (d) => { buf += d.toString(); let nl;
  while ((nl = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
    if (!line) continue; let m; try { m = JSON.parse(line); } catch { continue; }
    if (m.id && pending.has(m.id)) { pending.get(m.id).resolve(m); pending.delete(m.id); } } });
child.stderr.on('data', () => {});
function rpc(m, p, t = 300000) { const id = nextId++;
  return new Promise((res, rej) => { pending.set(id, { resolve: res, reject: rej });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method: m, params: p }) + '\n');
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error('timeout')); } }, t); }); }
async function run(args) { const r = await rpc('tools/call', { name: 'figma_run', arguments: { args } });
  return (r.result?.content || []).map((c) => c.text ?? '').join('\n'); }
async function render(jsx) { const r = await rpc('tools/call', { name: 'figma_render', arguments: { jsx } });
  return (r.result?.content || []).map((c) => c.text ?? '').join('\n'); }
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'merge', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');
const firstId = (s) => (s.match(/(\d+:\d+)/) || [])[1];
const F = 'font="Ark Pixel 12px Mono zh-Hans"';

const OX = 7000, OY = 0, PAD = 40, COLW = 1290;
let y = 100;
const rows = [];      // { setId, x, y, w, h }
const labels = [];    // { text, x, y }

// 类别：[标题, [[组件集名, w, h, 独占一行?]...]]
const PLAN = [
  ['① 导航与状态', [['模板/Bar/Status', 820, 28, true], ['模板/Bar/Nav', 1250, 44, true]]],
  ['② 选择控件', [['模板/Seg/Bar', 1198, 40, true], ['模板/Ctrl/Toggle', 144, 24, false],
    ['模板/Ctrl/Check', 84, 24, false], ['模板/Chip/Filter', 208, 32, false],
    ['模板/Chip/Status', 440, 32, false], ['模板/Ctrl/Slider', 758, 24, true]]],
  ['③ 按钮', [['模板/Btn/Action', 784, 100, false], ['模板/Btn/Status', 280, 48, false],
    ['模板/Icon/Btn', 148, 28, false]]],
  ['④ 输入与列表', [['模板/Field/Input', 758, 114, true], ['模板/Row/List', 758, 122, true]]],
  ['⑤ 卡片', [['模板/Card/Task', 1198, 150, true], ['模板/Card/Program', 1158, 88, true],
    ['模板/Card/Facility', 758, 196, true], ['模板/Card/Event', 758, 120, true],
    ['模板/Card/Knowledge', 758, 500, true]]],
  ['⑥ 反馈与状态', [['模板/Block/Ring', 840, 260, false], ['模板/Bar/Progress', 378, 604, false],
    ['模板/Panel/Dialog', 696, 200, true], ['模板/Toast', 1066, 44, true],
    ['模板/State/Page', 758, 240, true]]],
  ['⑦ 图标与头像', [['模板/Icon/Glyph', 466, 94, false], ['模板/Avatar', 164, 64, false]]],
];

for (const [title, items] of PLAN) {
  labels.push({ text: title, x: PAD, y });
  y += 34;
  let cursorX = PAD, rowH = 0;
  for (const [name, w, h, ownRow] of items) {
    if (ownRow && cursorX > PAD) { y += rowH + 24; cursorX = PAD; rowH = 0; }
    if (cursorX + w > PAD + COLW) { y += rowH + 24; cursorX = PAD; rowH = 0; }
    rows.push({ name, x: cursorX, y, w, h });
    labels.push({ text: name.replace('模板/', ''), x: cursorX, y: y - 20 });
    cursorX += w + 40;
    rowH = Math.max(rowH, h);
    if (ownRow) { y += rowH + 24; cursorX = PAD; rowH = 0; }
  }
  if (rowH > 0) y += rowH + 24;
  y += 26;
}
const H = y + 40;

// 建独立帧
const rr = await render(`<Frame name="组件库 v3（模板 · 合并）" x={${OX}} y={${OY}} w={${COLW + PAD * 2}} h={${H}} bg="#1a1a1a" flex="none">
  <Text x={${PAD}} y={30} w={1200} h={34} size={24} color="#ffffff" ${F}>星港计划 · 组件库 v3（模板 · v1+v2 合并）</Text>
  <Text x={${PAD}} y={68} w={1200} h={20} size={12} color="#b0b0b0" ${F}>25 个组件集 · 独立帧（不挂展示板）· 文字 Ark Pixel 12px Mono zh-Hans</Text>
</Frame>`);
const BOARD = firstId(rr);
console.log('合并帧: ' + BOARD + '  尺寸 ' + (COLW + PAD * 2) + 'x' + H);

// 移入 + 定位
let moved = 0;
for (const it of rows) {
  const f = await run(['find', it.name, '--type', 'COMPONENT_SET', '--limit', '3']);
  const sid = firstId(f);
  if (!sid) { console.log(`! 找不到 ${it.name}`); continue; }
  const r1 = await run(['node', 'reparent', sid, BOARD]);
  if (!/Moved/.test(r1)) { console.log(`! reparent ${it.name}: ${r1.trim().slice(0, 80)}`); continue; }
  const r2 = await run(['node', 'move', sid, String(OX + it.x), String(OY + it.y)]);
  if (!/Moved/.test(r2)) console.log(`! move ${it.name}: ${r2.trim().slice(0, 80)}`);
  moved++;
}
console.log(`移入 ${moved}/${rows.length}`);

// 标签
for (const lb of labels) {
  const isSection = /^[①②③④⑤⑥⑦]/.test(lb.text);
  const o = await render(`<Text name="L" x={${OX + lb.x}} y={${OY + lb.y}} w={520} h={${isSection ? 22 : 18}} size={${isSection ? 24 : 12}} color="${isSection ? '#ffffff' : '#9a9a9a'}" ${F}>${lb.text}</Text>`);
  const lid = firstId(o);
  if (lid) await run(['node', 'reparent', lid, BOARD]);
}

// 删掉两个空壳旧板
for (const old of ['881:430', '887:689']) {
  const o = await run(['node', 'delete', old]);
  console.log(`删除旧板 ${old}: ${o.trim().split('\n')[0].slice(0, 60)}`);
}

const sc = await rpc('tools/call', { name: 'figma_screenshot', arguments: { nodeId: BOARD, scale: 0.42 } });
console.log((sc.result?.content || []).map((c) => c.text ?? '').join('\n').slice(0, 260));
child.kill(); process.exit(0);
