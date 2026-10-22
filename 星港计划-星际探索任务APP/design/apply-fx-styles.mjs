// 用 EFFECT 样式批量套效果（--field effect 单数）并验证
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
async function render(jsx) { const r = await rpc('tools/call', { name: 'figma_render', arguments: { jsx } });
  return (r.result?.content || []).map((c) => c.text ?? '').join('\n'); }
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'fxall', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');
const firstId = (s) => (s.match(/(\d+:\d+)/) || [])[1];

// 规格：13 种配方 → 一个演示块（尺寸/底色取该配方的典型用法）
const DEMO = [
  ['容器', 'SP/FX/容器', 361, 40, '#2c2c2c', '#c8c8c8'],
  ['凸起', 'SP/FX/凸起', 61, 30, '#c8c8c8', null],
  ['凸起无投影', 'SP/FX/凸起无投影', 61, 30, '#c8c8c8', null],
  ['中灰', 'SP/FX/中灰', 88, 88, '#666666', null],
  ['中灰带投影', 'SP/FX/中灰带投影', 88, 88, '#666666', null],
  ['凹下', 'SP/FX/凹下', 115, 30, '#151515', null],
  ['白条', 'SP/FX/白条', 124, 8, '#ffffff', null],
  ['点绿', 'SP/FX/点绿', 40, 40, '#04ff00', null],
  ['点黄', 'SP/FX/点黄', 40, 40, '#ffd000', null],
  ['点红', 'SP/FX/点红', 40, 40, '#ff0000', null],
  ['凹槽', 'SP/FX/凹槽', 40, 40, '#7e7e7e', null],
];
// 文字两档
const TEXTS = [['字深', 'SP/FX/字深', '#000000'], ['字浅', 'SP/FX/字浅', '#ffffff']];

let parts = [];
let y = 90;
for (const [label, , w, h, bg, stroke] of DEMO) {
  parts.push(`<Text x={20} y={${y - 20}} w={300} h={16} size={12} color="#9a9a9a" font="Ark Pixel 12px Mono zh-Hans">${label}  ${w}×${h}</Text>`);
  parts.push(`<Frame name="d_${label}" x={340} y={${y - 24}} w={${w}} h={${h}} bg="${bg}"${stroke ? ` stroke="${stroke}" strokeWidth={2}` : ''} flex="none" />`);
  y += Math.max(h, 24) + 26;
}
for (const [label, , color] of TEXTS) {
  parts.push(`<Text name="x_${label}_lab" x={20} y={${y - 20}} w={300} h={16} size={12} color="#9a9a9a" font="Ark Pixel 12px Mono zh-Hans">${label}</Text>`);
  parts.push(`<Text name="x_${label}" x={340} y={${y - 20}} w={300} h={24} size={24} color="${color}" font="Ark Pixel 12px Mono zh-Hans">星港 STARPORT</Text>`);
  y += 46;
}

const rr = await render(`<Frame name="效果样式验证台" x={6100} y={2100} w={760} h={${y + 20}} bg="#1a1a1a" flex="none">
  <Text x={20} y={20} w={700} h={30} size={24} color="#ffffff" font="Ark Pixel 12px Mono zh-Hans">效果样式验证台</Text>
  <Text x={20} y={54} w={700} h={20} size={12} color="#b0b0b0" font="Ark Pixel 12px Mono zh-Hans">EFFECT 样式 + style apply --field effect（单数）</Text>
  ${parts.join('\n  ')}
</Frame>`);
const BENCH = firstId(rr);
console.log('验证台: ' + BENCH);

const tr = await run(['node', 'tree', BENCH, '--depth', '1', '--ids']);
const map = {};
for (const line of tr.split('\n')) {
  const m = line.match(/(?:FRAME|TEXT): (\S+) \([\d.]+x[\d.]+\) \[(\d+:\d+)\]/);
  if (m) map[m[1]] = m[2];
}

console.log('\n=== 套样式并验证 ===');
let ok = 0, total = 0;
for (const [label, style] of DEMO) {
  const id = map['d_' + label];
  total++;
  const o = await run(['style', 'apply', style, id, '--field', 'effect']);
  const ins = await run(['inspect', id, '--json']);
  const cnt = (ins.match(/"type"\s*:\s*"(INNER_SHADOW|DROP_SHADOW)"/g) || []).length;
  if (cnt) ok++;
  console.log(`  ${cnt ? '✓' : '✗'} ${label.padEnd(12)} 效果数 ${cnt}  ${cnt ? '' : o.trim().split('\n')[0].slice(0, 70)}`);
}
for (const [label, style, ] of TEXTS) {
  const id = map['x_' + label];
  total++;
  await run(['style', 'apply', style, id, '--field', 'effect']);
  const ins = await run(['inspect', id, '--json']);
  const cnt = (ins.match(/"type"\s*:\s*"(INNER_SHADOW|DROP_SHADOW)"/g) || []).length;
  if (cnt) ok++;
  console.log(`  ${cnt ? '✓' : '✗'} ${label.padEnd(12)} 效果数 ${cnt}`);
}
console.log(`\n成功 ${ok}/${total}`);
const sc = await rpc('tools/call', { name: 'figma_screenshot', arguments: { nodeId: BENCH, scale: 1.3 } });
console.log((sc.result?.content || []).map((c) => c.text ?? '').join('\n').slice(0, 260));
child.kill(); process.exit(0);
