// 直接从"手摆板复制件"的节点建组件：不重画、不改视觉，只做归组 + 组件化
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'mkfrom', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const BOARD = '890:1281';       // 复制件
const OX = 5600, OY = 0;        // 该板的页面原点（子节点坐标是 local）
const idOf = (s) => (s.match(/(\d+:\d+)/) || [])[1];

// [包装名, localX, localY, w, h, [成员id...]]
const CLUSTERS = [
  ['Btn/Status, kind=launch', 1045, 34, 117, 45, ['890:1350', '890:1351', '890:1352', '890:1353']],
  ['Btn/Status, kind=stop', 1038, 84, 124, 45, ['890:1388', '890:1389', '890:1390', '890:1391']],
  ['Chip/Status, kind=draft', 421, 78, 81, 32, ['890:1392', '890:1393', '890:1394']],
  ['Chip/Status, kind=active', 421, 132, 81, 32, ['890:1395', '890:1396', '890:1397']],
  ['Btn/Action, state=normal', 31, 79, 61, 30, ['890:1304', '890:1306']],
  ['Btn/Action, state=disabled', 111, 79, 61, 30, ['890:1307', '890:1325']],
  ['Btn/Confirm', 1045, 169, 113, 40, ['890:1345', '890:1346', '890:1347']],
  ['Clock', 265, 83, 121, 22, ['890:1343', '890:1344']],
  ['Signal', 197, 89, 46, 10, ['890:1319', '890:1324', '890:1321']],
];

const built = [];
for (const [name, lx, ly, w, h, members] of CLUSTERS) {
  const px = OX + lx, py = OY + ly;
  // 1) 建空包装帧（透明、无描边），页面坐标 = 板原点 + 局部
  const jsx = `<Frame name="${name}" x={${px}} y={${py}} w={${w}} h={${h}} flex="none" />`;
  const rr = await render(jsx);
  const wrapId = (rr.match(/Rendered:\s*(\d+:\d+)/) || [])[1];
  if (!wrapId) { console.log(`FAIL render ${name}: ${rr.trim().slice(0, 100)}`); continue; }
  // 2) 成员移入（reparent 保留画布位置）
  let moved = 0;
  for (const m of members) {
    const o = await run(['node', 'reparent', m, wrapId]);
    if (/Moved/.test(o)) moved++;
    else console.log(`  ! reparent ${m}: ${o.trim().slice(0, 90)}`);
  }
  // 3) 转组件
  const cc = await run(['node', 'to-component', wrapId]);
  const compId = idOf(cc);
  // 4) 组件移回板
  await run(['node', 'reparent', compId, BOARD]);
  built.push({ name, compId, moved, total: members.length });
  console.log(`${name.padEnd(26)} 成员 ${moved}/${members.length}  组件 ${compId}`);
}

// 5) 同基名的合并为变体集
const groups = {};
for (const x of built) {
  const base = x.name.split(',')[0].trim();
  (groups[base] = groups[base] || []).push(x);
}
for (const [base, items] of Object.entries(groups)) {
  if (items.length < 2) { console.log(`单组件（不合并）: ${base} ${items[0].compId}`); continue; }
  const o = await run(['component', 'combine', ...items.map((i) => i.compId)]);
  const setId = (o.match(/\((\d+:\d+)\)/) || [])[1];
  console.log(`combine ${base} (${items.length}) -> ${setId || o.trim().slice(0, 100)}`);
  if (setId) {
    for (const it of items) await run(['node', 'rename', it.compId, it.name.slice(it.name.indexOf(',') + 1).trim()]);
    await run(['node', 'rename', setId, base]);
    await run(['node', 'reparent', setId, BOARD]);
  }
}
child.kill(); process.exit(0);
