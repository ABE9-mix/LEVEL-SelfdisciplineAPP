// 补标签：figma_render 根元素必须是 Frame，故包一层再取出 Text
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'labels', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');
const firstId = (s) => (s.match(/(\d+:\d+)/) || [])[1];
const F = 'font="Ark Pixel 12px Mono zh-Hans"';
const BOARD = '908:31', OX = 7000, OY = 0, PAD = 40, COLW = 1290;

// 与 _relayout.mjs 完全一致的布局计算
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
let y = 100; const labels = [];
for (const [title, items] of PLAN) {
  labels.push({ text: title, x: PAD, y, size: 24, color: '#ffffff', h: 22 });
  y += 34;
  let cx = PAD, rowH = 0;
  for (const [name, w, h, ownRow] of items) {
    if (ownRow && cx > PAD) { y += rowH + 24; cx = PAD; rowH = 0; }
    if (cx + w > PAD + COLW) { y += rowH + 24; cx = PAD; rowH = 0; }
    labels.push({ text: name.replace('模板/', ''), x: cx, y: y - 20, size: 12, color: '#9a9a9a', h: 18 });
    cx += w + 40; rowH = Math.max(rowH, h);
    if (ownRow) { y += rowH + 24; cx = PAD; rowH = 0; }
  }
  if (rowH > 0) y += rowH + 24;
  y += 26;
}

// 全部标签放进一个 wrapper 帧（根必须是 Frame）
const jsx = `<Frame name="__labels" x={${OX}} y={${OY}} w={${COLW + PAD * 2}} h={${y}} flex="none">
${labels.map((l, i) => `  <Text name="L${i}" x={${l.x}} y={${l.y}} w={1100} h={${l.h}} size={${l.size}} color="${l.color}" ${F}>${l.text}</Text>`).join('\n')}
</Frame>`;
const r1 = await render(jsx);
const WRAP = firstId(r1);
console.log('wrapper: ' + WRAP + '  ' + r1.split('\n').filter((l) => /error|Invalid/i.test(l)).join(' '));
if (!WRAP) process.exit(1);

// 逐个 Text 移出 wrapper 进画板
const tr = await run(['node', 'tree', WRAP, '--depth', '1', '--ids']);
const texts = [];
for (const line of tr.split('\n')) {
  const m = line.match(/TEXT: (L\d+) \(.*?\) \[(\d+:\d+)\]/);
  if (m) texts.push({ name: m[1], id: m[2] });
}
console.log(`wrapper 内文字 ${texts.length} / 期望 ${labels.length}`);
let ok = 0;
for (const t of texts) {
  const pos = labels[parseInt(t.name.slice(1), 10)];
  const o1 = await run(['node', 'reparent', t.id, BOARD]);
  if (/Moved/.test(o1)) {
    await run(['node', 'move', t.id, String(OX + pos.x), String(OY + pos.y)]);
    ok++;
  } else if (ok === 0) console.log('  reparent 失败样本: ' + o1.trim().split('\n')[0].slice(0, 110));
}
console.log(`标签移入 ${ok}/${texts.length}`);
await run(['node', 'delete', WRAP]);

const tr2 = await run(['node', 'tree', BOARD, '--depth', '1', '--ids']);
const n = ((tr2.split('\n').filter((l) => /TEXT:/.test(l))).length);
console.log(`画板内 TEXT 节点: ${n}`);
child.kill(); process.exit(0);
