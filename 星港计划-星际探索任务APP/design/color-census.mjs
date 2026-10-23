// 配色普查：统计组件库与线框稿里实际用到的所有颜色
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'census', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

async function census(root, label, maxDepth = 8) {
  const tree = await run(['node', 'tree', root, '--depth', String(maxDepth), '--ids']);
  const ids = [];
  for (const line of tree.split('\n')) { const m = line.match(/\[(\d+:\d+)\]/); if (m) ids.push(m[1]); }
  const byColor = {}; let n = 0;
  for (const id of ids) {
    let j; try { j = JSON.parse(await run(['inspect', id, '--json'])); } catch { continue; }
    n++;
    const st = j.style || {};
    for (const c of [...(st.fills || []), ...(st.strokes || [])]) {
      if (typeof c !== 'string' || !c.startsWith('#')) continue;
      const k = c.toLowerCase();
      byColor[k] = (byColor[k] || 0) + 1;
    }
  }
  console.log(`\n=== ${label}（${root}）节点 ${n}，颜色 ${Object.keys(byColor).length} 种 ===`);
  const sorted = Object.entries(byColor).sort((a, c) => c[1] - a[1]);
  for (const [c, k] of sorted) console.log(`  ${c}  ×${k}`);
  return { root, label, byColor, nodes: n };
}

const r1 = await census('908:31', '组件库 v3');
const r2 = await census('842:393', '线框稿 v1', 4);
const r3 = await census('874:6', '线框稿 手摆', 4);
writeFileSync('_census.json', JSON.stringify({ r1, r2, r3 }, null, 1));

// 合并去重
const all = new Set([...Object.keys(r1.byColor), ...Object.keys(r2.byColor), ...Object.keys(r3.byColor)]);
console.log(`\n=== 三处合计去重 ${all.size} 种颜色 ===`);
const grays = [...all].filter((c) => { const n = parseInt(c.slice(1), 16); const R = (n >> 16) & 255, G = (n >> 8) & 255, B = n & 255; return R === G && G === B; }).sort();
const colors = [...all].filter((c) => !grays.includes(c)).sort();
console.log(`灰阶 ${grays.length}: ${grays.join(' ')}`);
console.log(`彩色 ${colors.length}: ${colors.join(' ')}`);
child.kill(); process.exit(0);
