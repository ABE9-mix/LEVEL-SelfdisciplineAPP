// 打印 Card/Task 三个变体的逐子节点坐标，用于把 idle/done 还原成 launching 的摆放
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'ctdump', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const VARIANTS = [['launching(用户改过)', '882:674'], ['idle', '882:675'], ['done', '882:676']];
const dump = {};
for (const [label, vid] of VARIANTS) {
  const tr = await run(['node', 'tree', vid, '--depth', '3', '--ids']);
  const items = [];
  for (const line of tr.split('\n')) {
    const m = line.match(/(FRAME|TEXT|RECTANGLE): (.+?) \(([\d.]+)x([\d.]+)\) \[(\d+:\d+)\]/);
    if (m) items.push({ type: m[1], name: m[2].trim(), w: +m[3], h: +m[4], id: m[5] });
  }
  for (const it of items) {
    try {
      const j = JSON.parse(await run(['inspect', it.id, '--json']));
      it.x = j.x; it.y = j.y; it.w = j.width; it.h = j.height;
      it.fill = (j.style?.fills || [])[0] ?? null;
      if (j.type === 'TEXT') { it.chars = j.characters; it.size = j.fontSize; }
    } catch { /* ignore */ }
  }
  dump[label] = items;
  console.log(`\n=== ${label}  [${vid}] ===`);
  for (const it of items) {
    const ind = it.name === 'bg' || it.id === vid ? '' : '';
    console.log(`  ${String(it.type).padEnd(9)} ${it.name.padEnd(12)} x=${String(it.x).padStart(6)} y=${String(it.y).padStart(5)} ${String(it.w).padStart(5)}x${String(it.h).padStart(4)}  fill=${it.fill ?? '-'}${it.chars ? '  "' + it.chars + '" ' + it.size + 'px' : ''}`);
  }
}
child.kill(); process.exit(0);
