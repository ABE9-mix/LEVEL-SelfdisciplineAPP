// Seg/Bar 未选中文字 #7e7e7e → #666666
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'seg', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

// 先测 --fill #666666 是否可写（102/255 = 0.4 精确）
const t = await run(['node', 'tree', '882:679', '--depth', '3', '--ids']);
const texts = [];
for (const line of t.split('\n')) {
  const m = line.match(/TEXT: .+? \((\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\) \[(\d+:\d+)\]/);
  if (m) texts.push({ id: m[3], w: +m[1], h: +m[2] });
}
console.log(`Seg/Bar 内文字层 ${texts.length}`);
const targets = [];
for (const x of texts) {
  let j; try { j = JSON.parse(await run(['inspect', x.id, '--json'])); } catch { continue; }
  const f = (j.style?.fills || [])[0];
  if (f === '#7e7e7e') targets.push(x.id);
}
console.log(`其中未选中的（#7e7e7e）${targets.length} 个`);
if (targets.length) {
  const probe = await run(['node', 'set', targets[0], '--fill', '#666666']);
  const chk = JSON.parse(await run(['inspect', targets[0], '--json']));
  const got = (chk.style?.fills || [])[0];
  console.log(`  探针 ${targets[0]}: fill=${got}  ${/roll|failed/i.test(probe) ? '(回滚) ' : ''}`);
  if (got === '#666666') {
    let ok = 1;
    for (const id of targets.slice(1)) {
      const o = await run(['node', 'set', id, '--fill', '#666666']);
      if (!/roll|failed/i.test(o)) ok++;
    }
    console.log(`  ✅ 改色成功 ${ok}/${targets.length}`);
  } else {
    console.log('  ✗ #666666 也不可写，需改用 PAINT 样式');
  }
}
child.kill(); process.exit(0);
