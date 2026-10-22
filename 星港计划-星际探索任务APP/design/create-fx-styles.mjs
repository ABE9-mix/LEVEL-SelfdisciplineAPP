// 用 EFFECT 样式写效果（node set --effects 会被回滚，样式不会）
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'fxstyle', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const hx = (h) => { const n = parseInt(h.slice(1), 16); return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: 1 }; };
const IN = (x, y, c, a = 1) => ({ type: 'INNER_SHADOW', color: { ...hx(c), a }, offset: { x, y }, radius: 0, spread: 0, visible: true, blendMode: 'NORMAL' });
const DR = (x, y, c, a = 1) => ({ type: 'DROP_SHADOW', color: { ...hx(c), a }, offset: { x, y }, radius: 0, spread: 0, visible: true, blendMode: 'NORMAL' });

const RECIPES = {
  'SP/FX/容器': [DR(4, 4, '#393939')],
  'SP/FX/凸起': [IN(-2, -2, '#969696'), IN(2, 2, '#d6d6d6'), DR(2, 2, '#393939')],
  'SP/FX/凸起无投影': [IN(-2, -2, '#969696'), IN(2, 2, '#d6d6d6')],
  'SP/FX/中灰': [IN(-2, -2, '#737373'), IN(2, 2, '#757575')],
  'SP/FX/中灰带投影': [IN(-2, -2, '#737373'), IN(2, 2, '#757575'), DR(2, 2, '#393939')],
  'SP/FX/凹下': [IN(2, 2, '#000000')],
  'SP/FX/白条': [IN(-2, -2, '#939393'), IN(2, 2, '#b6b6b6')],
  'SP/FX/点绿': [IN(-2, -2, '#488747'), IN(2, 2, '#72c171'), DR(2, 2, '#393939')],
  'SP/FX/点黄': [IN(-2, -2, '#85752c'), IN(2, 2, '#d1b952'), DR(2, 2, '#393939')],
  'SP/FX/点红': [IN(-2, -2, '#853f3f'), IN(2, 2, '#da6868'), DR(2, 2, '#393939')],
  'SP/FX/字深': [DR(0, 1, '#6d6d6d')],
  'SP/FX/字浅': [DR(0, 1, '#000000', 0.25)],
  'SP/FX/凹槽': [IN(-1, 0, '#000000', 0.25)],
};

console.log('=== 创建 EFFECT 样式 ===');
for (const [name, fx] of Object.entries(RECIPES)) {
  for (const field of ['--field', '--json']) { /* noop */ }
  const o = await run(['style', 'create', 'EFFECT', name, '-p', JSON.stringify({ effects: fx })]);
  const okLine = o.trim().split('\n')[0].slice(0, 90);
  console.log(`  ${/reject|error|failed/i.test(o) ? '✗' : '✓'} ${name.padEnd(20)} ${okLine}`);
}

// 试套到试片节点（这些节点现在没有效果）
const TARGETS = [
  ['试片扁平块 A', null],
];
const rr = await run(['node', 'tree', '904:1780', '--depth', '1', '--ids']);
console.log('\n=== 试片节点 ===');
console.log(rr.split('\n').slice(0, 4).join('\n'));
child.kill(); process.exit(0);
