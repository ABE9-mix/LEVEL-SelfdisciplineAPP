// 重排合并库：按新尺寸重算位置 + 重建标签
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'relayout', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');
const firstId = (s) => (s.match(/(\d+:\d+)/) || [])[1];
const F = 'font="Ark Pixel 12px Mono zh-Hans"';
const BOARD = '908:31', OX = 7000, OY = 0, PAD = 40, COLW = 1290;

// 清掉旧标签
{
  const tr = await run(['node', 'tree', BOARD, '--depth', '1', '--ids']);
  const dels = [];
  for (const line of tr.split('\n')) {
    const m = line.match(/TEXT: L .*?\[(\d+:\d+)\]/);
    if (m) dels.push(m[1]);
  }
  if (dels.length) { const o = await run(['node', 'delete', ...dels]); console.log(`清标签 ${dels.length}: ${o.trim().split('\n')[0].slice(0, 50)}`); }
}

// 实际尺寸（Bar/Progress 已修为 1154×44）
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
  ['⑥ 反馈与状态', [['模板/Block/Ring', 840, 260, false], ['模板/Bar/Progress', 1154, 44, false],
    ['模板/Panel/Dialog', 696, 200, true], ['模板/Toast', 1066, 44, true],
    ['模板/State/Page', 758, 240, true]]],
  ['⑦ 图标与头像', [['模板/Icon/Glyph', 466, 94, false], ['模板/Avatar', 164, 64, false]]],
];

let y = 100;
const moves = [], labels = [];
for (const [title, items] of PLAN) {
  labels.push({ text: title, x: PAD, y, size: 24, color: '#ffffff', h: 22 });
  y += 34;
  let cx = PAD, rowH = 0;
  for (const [name, w, h, ownRow] of items) {
    if (ownRow && cx > PAD) { y += rowH + 24; cx = PAD; rowH = 0; }
    if (cx + w > PAD + COLW) { y += rowH + 24; cx = PAD; rowH = 0; }
    moves.push({ name, x: cx, y });
    labels.push({ text: name.replace('模板/', ''), x: cx, y: y - 20, size: 12, color: '#9a9a9a', h: 18 });
    cx += w + 40; rowH = Math.max(rowH, h);
    if (ownRow) { y += rowH + 24; cx = PAD; rowH = 0; }
  }
  if (rowH > 0) y += rowH + 24;
  y += 26;
}
const H = y + 40;

let ok = 0;
for (const mv of moves) {
  const f = await run(['find', mv.name, '--type', 'COMPONENT_SET', '--limit', '3']);
  const sid = firstId(f);
  if (!sid) { console.log('! ' + mv.name); continue; }
  const o = await run(['node', 'move', sid, String(OX + mv.x), String(OY + mv.y)]);
  if (/Moved/.test(o)) ok++;
}
console.log(`重排 ${ok}/${moves.length}`);

for (const lb of labels) {
  const o = await render(`<Text name="L" x={${OX + lb.x}} y={${OY + lb.y}} w={520} h={${lb.h}} size={${lb.size}} color="${lb.color}" ${F}>${lb.text}</Text>`);
  const lid = firstId(o);
  if (lid) await run(['node', 'reparent', lid, BOARD]);
}
await run(['node', 'set', BOARD, '--width', String(COLW + PAD * 2), '--height', String(H)]);
console.log(`画板改为 ${COLW + PAD * 2}x${H}`);

const sc = await rpc('tools/call', { name: 'figma_screenshot', arguments: { nodeId: BOARD, scale: 0.5 } });
console.log((sc.result?.content || []).map((c) => c.text ?? '').join('\n').slice(0, 240));
child.kill(); process.exit(0);
