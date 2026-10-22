// 第二批流水线：帧 → 组件 → 合并变体 → 修正命名 → reparent 回画板
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'p2', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const ROOT = '887:689';
const tree = await run(['node', 'tree', ROOT, '--depth', '1', '--ids']);
const frames = [];
for (const line of tree.split('\n')) {
  const m = line.match(/FRAME: ([^\(]+?) \((\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\) \[(\d+:\d+)\]/);
  if (m && m[1].includes(', ')) frames.push({ name: m[1].trim(), id: m[4] });
}
console.log('变体帧: ' + frames.length);

// 1) 转组件
const groups = {};
for (const f of frames) {
  const out = await run(['node', 'to-component', f.id]);
  const mm = out.match(/Converted:\s*(\d+:\d+)/);
  if (!mm) { console.log('FAIL ' + f.name); continue; }
  const base = f.name.split(',')[0].trim();
  const desc = f.name.slice(f.name.indexOf(',') + 1).trim();
  (groups[base] = groups[base] || []).push({ desc, id: mm[1] });
}
console.log('组件组: ' + Object.keys(groups).length);

// 2) 合并（Bar/Progress 需带上前一批的 block/ticks）
const EXTRA = { 'Bar/Progress': ['882:653', '882:673'] };
const results = [];
for (const [base, items] of Object.entries(groups)) {
  const ids = [...items.map((x) => x.id), ...(EXTRA[base] || [])];
  if (ids.length < 2) { console.log(`跳过（单变体）: ${base}`); continue; }
  const out = await run(['component', 'combine', ...ids]);
  const setId = (out.match(/\((\d+:\d+)\)/) || [])[1];
  if (!setId) { console.log(`FAIL combine ${base}: ${out.trim().slice(0, 120)}`); continue; }
  results.push({ base, setId, items });
  console.log(`combine ${base} (${ids.length}) -> ${setId}`);
}

// 3) 修正命名：变体只留属性部分，组件集用原名（含 /）
for (const r of results) {
  for (const it of r.items) await run(['node', 'rename', it.id, it.desc]);
  await run(['node', 'rename', r.setId, r.base]);
  // 4) reparent 回画板
  await run(['node', 'reparent', r.setId, ROOT]);
}

// 5) 复核
const chk = await run(['component', 'list', '--json']);
writeFileSync('_clist2.json', chk);
console.log('\n=== 复核 ===');
const j = JSON.parse(chk);
console.log('组件集总数: ' + (j.componentSets || []).length);
for (const s of j.componentSets || []) {
  const axes = Object.entries(s.variantAxes || {}).map(([k, v]) => `${k}=[${v.values.join(',')}]`).join(' × ');
  console.log(`  ${s.name.padEnd(18)} ${String(s.variants.length).padStart(2)} 变体  ${axes}`);
}
child.kill(); process.exit(0);
