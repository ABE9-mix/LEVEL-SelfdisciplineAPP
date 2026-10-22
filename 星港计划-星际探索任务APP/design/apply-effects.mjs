// 给试片节点套手摆板原始效果
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'fx', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const hex = (h) => { const n = parseInt(h.slice(1), 16); return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: 1 }; };
const IN = (x, y, c, a = 1) => ({ type: 'INNER_SHADOW', color: { ...hex(c), a }, offset: { x, y }, radius: 0, spread: 0, visible: true, blendMode: 'NORMAL' });
const DR = (x, y, c, a = 1) => ({ type: 'DROP_SHADOW', color: { ...hex(c), a }, offset: { x, y }, radius: 0, spread: 0, visible: true, blendMode: 'NORMAL' });

const P = {
  raised: [IN(-2, -2, '#969696'), IN(2, 2, '#d6d6d6'), DR(2, 2, '#393939')],
  raisedNoDrop: [IN(-2, -2, '#969696'), IN(2, 2, '#d6d6d6')],
  panel: [DR(4, 4, '#393939')],
  midGrey: [IN(-2, -2, '#737373'), IN(2, 2, '#757575')],
  midGreyDrop: [IN(-2, -2, '#737373'), IN(2, 2, '#757575'), DR(2, 2, '#393939')],
  sunken: [IN(2, 2, '#000000')],
  whiteBar: [IN(-2, -2, '#939393'), IN(2, 2, '#b6b6b6')],
  green: [IN(-2, -2, '#488747'), IN(2, 2, '#72c171'), DR(2, 2, '#393939')],
  yellow: [IN(-2, -2, '#85752c'), IN(2, 2, '#d1b952'), DR(2, 2, '#393939')],
  red: [IN(-2, -2, '#853f3f'), IN(2, 2, '#da6868'), DR(2, 2, '#393939')],
  textDark: [DR(0, 1, '#6d6d6d')],
  textLight: [DR(0, 1, '#000000', 0.25)],
};

const JOBS = [
  ['898:1449', 'raised'], ['898:1454', 'raisedNoDrop'], ['898:1459', 'panel'],
  ['898:1464', 'midGrey'], ['898:1469', 'midGreyDrop'], ['898:1474', 'sunken'],
  ['898:1479', 'whiteBar'], ['898:1484', 'green'], ['898:1489', 'yellow'],
  ['898:1494', 'red'], ['898:1499', 'textDark'], ['898:1501', 'textLight'],
];
let ok = 0;
for (const [id, key] of JOBS) {
  const o = await run(['node', 'set', id, '--effects', JSON.stringify(P[key])]);
  if (/error|Invalid|unsupported/i.test(o)) console.log(`! ${id} ${key}: ${o.trim().slice(0, 130)}`);
  else ok++;
}
console.log(`效果应用 ${ok}/${JOBS.length}`);
child.kill(); process.exit(0);
