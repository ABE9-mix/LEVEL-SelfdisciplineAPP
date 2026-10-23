// 线框稿灰度分层：按几何包含关系推断层级，用 PAINT 样式上灰（node set --fill 会回滚）
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'wfgrade', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const hx = (h) => { const n = parseInt(h.slice(1), 16); return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: 1 }; };
const LEVELS = [
  ['SP/Wire/L1', '#E4E4E4'],   // 一级区块：状态栏/顶部/分段/主内容区/Home
  ['SP/Wire/L2', '#D2D2D2'],   // 二级：卡片、芯片、星球模型、标题、图标钮
  ['SP/Wire/L3', '#C0C0C0'],   // 三级：更内层
  ['SP/Wire/L0', '#F6F6F6'],   // 屏底
];
console.log('=== 建 PAINT 样式 ===');
for (const [n, c] of LEVELS) {
  const o = await run(['style', 'create', 'PAINT', n, '-p', JSON.stringify({ paints: [{ type: 'SOLID', color: hx(c) }] })]);
  console.log(`  ${/reject|error|failed/i.test(o) ? '✗' : '✓'} ${n} ${c}  ${o.trim().split('\n')[0].slice(0, 40)}`);
}

// 测 --field 写法
const probe = await run(['node', 'tree', '842:425', '--depth', '1', '--ids']);
const probeId = (probe.match(/\[(\d+:\d+)\]/g) || [])[1]?.replace(/[\[\]]/g, '');
for (const f of ['fill', 'paint', 'fills']) {
  const o = await run(['style', 'apply', 'SP/Wire/L1', probeId, '--field', f]);
  const ins = await run(['inspect', probeId, '--json']);
  const got = (ins.match(/"fills"\s*:\s*\[\s*"([^"]+)"/) || [])[1];
  console.log(`  --field ${f.padEnd(6)} -> fill=${got ?? '?'}  ${/reject/i.test(o) ? '(rejected)' : ''}`);
  if (got === '#e4e4e4') { console.log(`  ✅ 可用写法 --field ${f}`); break; }
}
child.kill(); process.exit(0);
