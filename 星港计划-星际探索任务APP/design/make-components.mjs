// 批量：帧 → 组件 → 合并变体集
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

await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'mkcomp', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const frames = JSON.parse(readFileSync('_frames.json', 'utf8'));
// 已转换过的补种
const seed = { '881:564': '882:653' };
const groups = {};
const log = [];

for (const f of frames) {
  const base = f.name.split(',')[0].trim();
  let newId = seed[f.id];
  if (!newId) {
    const out = await run(['node', 'to-component', f.id]);
    const m = out.match(/Converted:\s*(\d+:\d+)/);
    if (!m) { log.push(`FAIL to-component ${f.id} ${f.name} :: ${out.trim().slice(0, 120)}`); continue; }
    newId = m[1];
  }
  (groups[base] = groups[base] || []).push({ variant: f.name, id: newId });
  log.push(`component ${base} <- ${f.name} = ${newId}`);
}

console.log('--- 转换 ---');
log.forEach((l) => console.log('  ' + l));

const sets = [];
for (const [base, items] of Object.entries(groups)) {
  if (items.length < 2) { console.log(`跳过合并（单变体）: ${base}`); continue; }
  const out = await run(['component', 'combine', ...items.map((x) => x.id)]);
  const m = out.match(/(\d+:\d+)/g);
  sets.push({ base, count: items.length, result: out.trim().slice(0, 200), setIds: m });
  console.log(`combine ${base} (${items.length}) -> ${out.trim().slice(0, 160)}`);
}

writeFileSync('_compset.json', JSON.stringify({ groups, sets }, null, 1));
child.kill(); process.exit(0);
