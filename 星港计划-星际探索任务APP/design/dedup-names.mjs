// 解决重名：我重画的两块板里的组件集统一加「模板/」前缀，手摆来源的保持原名
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'dedup', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

for (const root of ['881:430', '887:689']) {
  const tree = await run(['node', 'tree', root, '--depth', '1', '--ids']);
  const sets = [];
  for (const line of tree.split('\n')) {
    const m = line.match(/COMPONENT_SET: (.+?) \(.*?\) \[(\d+:\d+)\]/);
    if (m && !m[1].startsWith('模板/')) sets.push({ name: m[1].trim(), id: m[2] });
  }
  console.log(`\n${root}: 组件集 ${sets.length}`);
  for (const s of sets) {
    const o = await run(['node', 'rename', s.id, '模板/' + s.name]);
    if (/Renamed/.test(o)) console.log(`  ${s.name} → 模板/${s.name}`);
    else console.log(`  ! ${s.name}: ${o.trim().slice(0, 90)}`);
  }
}

// 复核：重名检测
const cl = await run(['component', 'list', '--json']);
const j = JSON.parse(cl);
const byName = {};
for (const s of j.componentSets || []) byName[s.name] = (byName[s.name] || 0) + 1;
const dup = Object.entries(byName).filter(([, n]) => n > 1);
console.log(`\n组件集总数 ${j.componentSets.length}；重名 ${dup.length}`);
if (dup.length) dup.forEach(([n, c]) => console.log(`  重名: ${n} ×${c}`));
console.log('\n全部组件集:');
for (const s of j.componentSets || []) {
  const axes = Object.entries(s.variantAxes || {}).map(([k, v]) => `${k}=[${v.values.join(',')}]`).join(' ');
  console.log(`  ${s.name.padEnd(22)} ${String(s.variants.length).padStart(2)} 变体  ${axes}`);
}
child.kill(); process.exit(0);
