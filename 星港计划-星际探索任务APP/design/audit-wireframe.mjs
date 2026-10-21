// 线框稿自检：扫全树，找塌陷元素 / 越界元素
import { spawn } from 'node:child_process';
const b = 'C:/Users/ABE9/.workbuddy/mcp-servers/figma-bridge-mcp/node_modules/figma-bridge-mcp/src/server.js';
const child = spawn(process.execPath, [b], { stdio: ['pipe', 'pipe', 'pipe'] });
let buf = ''; const pending = new Map(); let nextId = 1;
child.stdout.on('data', (d) => { buf += d.toString(); let nl;
  while ((nl = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
    if (!line) continue; let m; try { m = JSON.parse(line); } catch { continue; }
    if (m.id && pending.has(m.id)) { pending.get(m.id).resolve(m); pending.delete(m.id); } } });
child.stderr.on('data', () => {});
function rpc(m, p, t = 240000) { const id = nextId++;
  return new Promise((res, rej) => { pending.set(id, { resolve: res, reject: rej });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method: m, params: p }) + '\n');
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error('timeout ' + m)); } }, t); }); }
async function run(args) { const r = await rpc('tools/call', { name: 'figma_run', arguments: { args } });
  return (r.result?.content || []).map((c) => c.text ?? '').join('\n'); }

await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'auditw', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const ROOT = process.argv[2] || '842:393';
const tree = await run(['node', 'tree', ROOT, '--depth', '4', '--ids']);
const lines = tree.split('\n');
const re = /^(\s*)(\w+): (.*?) \((-?\d+(?:\.\d+)?)x(-?\d+(?:\.\d+)?)\) \[(\d+:\d+)\]/;

let curScreen = null;
const stats = {};
const issues = [];
let nodeCount = 0;

for (const line of lines) {
  const m = line.match(re);
  if (!m) continue;
  const [, indent, type, label, w, h, id] = m;
  const W = parseFloat(w), H = parseFloat(h);
  nodeCount++;
  // 屏幕框：顶层缩进最浅且名字以「屏 」开头
  if (/^屏 /.test(label) && indent.length <= 2) { curScreen = label; stats[curScreen] = { nodes: 0, texts: 0 }; continue; }
  if (curScreen && stats[curScreen]) stats[curScreen].nodes++;
  if (type === 'TEXT') {
    if (curScreen && stats[curScreen]) stats[curScreen].texts++;
    if (W < 20) issues.push(`COLLAPSED-TEXT  ${label} (${W}x${H}) [${id}] @ ${curScreen}`);
  }
  if ((type === 'FRAME' || type === 'RECTANGLE') && (W <= 0 || H <= 0)) {
    issues.push(`ZERO-SIZE       ${label} (${W}x${H}) [${id}] @ ${curScreen}`);
  }
  // 越界：屏幕内的子元素不该超出 390x844
  if (curScreen && indent.length > 2) {
    if (W > 390.5 || H > 844.5) issues.push(`OVERFLOW-SIZE   ${label} (${W}x${H}) [${id}] @ ${curScreen}`);
  }
}

console.log('总节点: ' + nodeCount);
console.log('\n各屏节点数:');
for (const [k, v] of Object.entries(stats)) console.log(`  ${k}  nodes=${v.nodes} texts=${v.texts}`);
console.log('\n问题数: ' + issues.length);
for (const i of issues) console.log('  ' + i);
child.kill(); process.exit(0);
