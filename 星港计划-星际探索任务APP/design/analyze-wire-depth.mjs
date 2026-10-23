// 线框稿层级普查：按嵌套深度列出，并统计现有填充
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'wfdepth', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const ROOT = process.argv[2] || '842:425';
const t = await run(['node', 'tree', ROOT, '--depth', '6', '--ids']);
const rows = [];
for (const line of t.split('\n')) {
  const m = line.match(/^(\s*)(FRAME|TEXT|RECTANGLE|VECTOR|GROUP|ELLIPSE): (.+?) \(([\d.]+)x([\d.]+)\) \[(\d+:\d+)\]/);
  if (!m) continue;
  const depth = Math.floor(m[1].length / 2);
  rows.push({ depth, type: m[2], name: m[3].trim(), w: +m[4], h: +m[5], id: m[6] });
}
// 取填充/描边
for (const r of rows) {
  try {
    const j = JSON.parse(await run(['inspect', r.id, '--json']));
    const st = j.style || {};
    r.fill = (st.fills || [])[0] ?? null;
    r.stroke = (st.strokes || [])[0] ?? null;
  } catch { }
}
console.log(`=== ${ROOT} 共 ${rows.length} 节点 ===`);
console.log('深度分布:');
const byDepth = {};
for (const r of rows) byDepth[r.depth] = (byDepth[r.depth] || 0) + 1;
for (const [d, n] of Object.entries(byDepth).sort()) console.log(`  depth ${d}: ${n}`);
console.log('\n前 40 行:');
for (const r of rows.slice(0, 40)) {
  console.log(`${'  '.repeat(r.depth)}d${r.depth} ${r.type.padEnd(9)} ${r.name.slice(0, 26).padEnd(28)} ${String(r.w).padStart(4)}x${String(r.h).padStart(4)}  fill=${r.fill ?? '-'} stroke=${r.stroke ?? '-'}`);
}
writeFileSync('_wfdepth.json', JSON.stringify(rows, null, 1));
// 现有填充统计
const fills = {};
for (const r of rows) if (r.fill) fills[r.fill] = (fills[r.fill] || 0) + 1;
console.log('\n现有填充: ' + Object.entries(fills).map(([c, n]) => `${c}×${n}`).join('  '));
const strokes = {};
for (const r of rows) if (r.stroke) strokes[r.stroke] = (strokes[r.stroke] || 0) + 1;
console.log('现有描边: ' + Object.entries(strokes).map(([c, n]) => `${c}×${n}`).join('  '));
child.kill(); process.exit(0);
