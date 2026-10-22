// 恢复：重建干净副本（修正 node duplicate 的 id 解析）
// node duplicate 返回形如：Duplicated "X" (源id) as "X" (新id) in ...
// 新 id 是「 as 」之后的那个，之前我误取了第一个（源 id），导致把原节点搬走又删掉。
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'recover', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

// ✅ 正确解析：取「 as 」之后的 id
const asId = (s) => { const m = s.match(/ as .*?\((\d+:\d+)\)/); return m ? m[1] : null; };
// 取第一个 id（用于 to-component / combine 等返回）
const firstId = (s) => (s.match(/(\d+:\d+)/) || [])[1];

// 1) 删掉受损副本 + 上一轮试片
for (const id of ['890:1281', '902:1638']) {
  const o = await run(['node', 'delete', id]);
  console.log(`delete ${id}: ${o.trim().split('\n')[0].slice(0, 70)}`);
}

// 2) 从原始手摆板重新复制（正确解析新 id）
const raw = await run(['node', 'duplicate', '807:180']);
const COPY = asId(raw);
console.log(`\nduplicate 原始板 -> ${COPY}`);
if (!COPY) { console.log('解析失败: ' + raw.trim().slice(0, 200)); process.exit(1); }

await run(['node', 'move', COPY, '5600', '0']);
await run(['node', 'rename', COPY, '组件库-正式（复制自手摆板）']);

// 3) 核验副本与原始子节点数一致
for (const [nm, id] of [['原始 807:180', '807:180'], ['副本 ' + COPY, COPY]]) {
  const t = await run(['node', 'tree', id, '--depth', '1', '--ids']);
  const n = (t.split('\n').filter((l) => l.trim()).length) - 1;
  console.log(`  ${nm}: 子节点 ${n}`);
}
child.kill(); process.exit(0);
