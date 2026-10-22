// 全量提取节点效果，归纳配方
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'eff', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const ROOT = process.argv[2] || '890:1281';
const tree = await run(['node', 'tree', ROOT, '--depth', '8', '--ids']);
const ids = [];
for (const line of tree.split('\n')) {
  const m = line.match(/\[(\d+:\d+)\]/);
  if (m) ids.push(m[1]);
}
console.error('nodes ' + ids.length);

const rows = [];
for (const id of ids) {
  let t;
  try { t = await run(['inspect', id, '--json']); } catch { continue; }
  let j; try { j = JSON.parse(t); } catch { continue; }
  const eff = j.effects || j.style?.effects;
  if (!eff || !Array.isArray(eff) || !eff.length) continue;
  rows.push({
    id, type: j.type, name: j.name, w: j.width, h: j.height,
    fill: (j.style?.fills || []).join(','),
    stroke: (j.style?.strokes || []).join(','),
    sw: j.style?.strokeWeight,
    effects: eff,
  });
}
writeFileSync('_effects.json', JSON.stringify(rows, null, 1));
console.log('带效果的节点: ' + rows.length);

// 配方签名（inspect 归一化后的字段是 x/y/blur/spread/color/alpha）
const sig = (e) => e
  .filter((x) => x.visible !== false)
  .map((x) => `${x.type}|x${x.x},y${x.y}|blur${x.blur}|spr${x.spread}|${x.color}@a${x.alpha}`)
  .join('  +  ');

const groups = {};
for (const r of rows) {
  const s = sig(r.effects);
  (groups[s] = groups[s] || []).push(r);
}
console.log('\n=== 不同效果配方 ===');
let i = 0;
for (const [s, list] of Object.entries(groups).sort((a, c) => c[1].length - a[1].length)) {
  i++;
  console.log(`\n[配方 ${i}] 用 ${list.length} 处`);
  console.log('  ' + s);
  const sample = list.slice(0, 5).map((x) => `${x.name}(${x.w}x${x.h} fill=${x.fill} stroke=${x.stroke||'-'} sw=${x.sw||'-'})`);
  console.log('  样本: ' + sample.join('\n        '));
  console.log('  原始 effect 对象:');
  console.log(JSON.stringify(list[0].effects, null, 2).split('\n').map((l) => '    ' + l).join('\n'));
}
child.kill(); process.exit(0);
