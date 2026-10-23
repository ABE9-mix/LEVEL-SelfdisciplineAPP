// 盘点线框稿所有屏里的占位元素名称与几何，用于建立 占位→组件 映射
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'inv', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const BOARD = '842:393';
const bt = await run(['node', 'tree', BOARD, '--depth', '2', '--ids']);
const screens = [];
for (const line of bt.split('\n')) {
  if (!/^\s{2}\s*FRAME:/.test(line) && !/^FRAME:/.test(line)) continue;
  const m = line.match(/FRAME: (.+?) \((\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\) \[(\d+:\d+)\]/);
  if (m && m[1].includes('屏')) screens.push({ name: m[1].trim(), id: m[4] });
}
console.log(`屏 ${screens.length}`);

const names = {};
const out = [];
for (const sc of screens) {
  const st = await run(['node', 'tree', sc.id, '--depth', '2', '--ids']);
  const kids = [];
  for (const line of st.split('\n')) {
    const m = line.match(/^\s{2,}(FRAME|RECTANGLE): (.+?) \((\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\) \[(\d+:\d+)\]/);
    if (!m) continue;
    let j; try { j = JSON.parse(await run(['inspect', m[5], '--json'])); } catch { continue; }
    kids.push({ name: m[2].trim(), w: j.raw?.width ?? +m[3], h: j.raw?.height ?? +m[4], x: j.raw?.x ?? 0, y: j.raw?.y ?? 0, id: m[5] });
    names[m[2].trim()] = (names[m[2].trim()] || 0) + 1;
  }
  out.push({ screen: sc.name, id: sc.id, kids });
}
console.log('\n=== 全部占位元素名（按出现次数）===');
for (const [n, c] of Object.entries(names).sort((a, c) => c[1] - a[1])) console.log(`  ${String(c).padStart(3)} × ${n}`);
writeFileSync('_wfinv.json', JSON.stringify(out, null, 1));
console.log(`\n已写 _wfinv.json（${out.length} 屏）`);
child.kill(); process.exit(0);
