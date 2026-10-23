// 1) Btn/Status 文字改成手摆"发射"按钮的排法（小英文左下 / 大中文右，白色）
// 2) Card/Task 后两个变体完全还原成第一个（launching，用户改过的）的摆放
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'fix2', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const errs = [];
async function set(id, o) {
  const a = ['node', 'set', id];
  if (o.x != null) a.push('--x', String(o.x));
  if (o.y != null) a.push('--y', String(o.y));
  if (o.w != null) a.push('--width', String(o.w));
  if (o.h != null) a.push('--height', String(o.h));
  if (o.fill) a.push('--fill', o.fill);
  if (o.name) a.push('--name', o.name);
  const out = await run(a);
  if (/error|rejected|failed|rollback|Malformed/i.test(out)) errs.push(`${id} ${JSON.stringify(o)} -> ${out.trim().split('\n')[0].slice(0, 90)}`);
  return out;
}

// ── 1) Btn/Status：手摆 113×45 的排法等比换算到 120×48
//    发射 (55,14,62,29) → (58,15,62,29)    LAUNCH (17,28,46,13) → (18,30,46,13)
console.log('=== Btn/Status ===');
// kind=launch (882:667)：labelzh 881:540 "发射", labelen 881:541
await set('881:540', { x: 58, y: 15, w: 62, h: 29, fill: '#ffffff' });
await set('881:541', { x: 18, y: 30, w: 46, h: 13, fill: '#ffffff' });
// kind=stop (882:668)：labelen 881:544 "Emergency stop", labelzh 881:545 "终止"
await set('881:544', { x: 4, y: 30, w: 66, h: 14, fill: '#ffffff' });
await set('881:545', { x: 58, y: 15, w: 62, h: 29, fill: '#ffffff' });
console.log(`  launch: 发射(58,15,62,29) LAUNCH(18,30,46,13)  white`);
console.log(`  stop  : 终止(58,15,62,29) Emergency stop(4,30,66,14)  white`);

// ── 2) Card/Task：把 launching(882:674) 的摆放复制到 idle(882:675) / done(882:676)
//    目标几何（组件内局部坐标，取自 launching 的绝对值，其组件位于 0,0）
const G = {
  bg:      { x: 0,   y: 0,   w: 358, h: 150 },
  visual:  { x: 2,   y: 2,   w: 354, h: 77 },
  divider: { x: 2,   y: 79,  w: 354, h: 2 },
  time:    { x: 14,  y: 87,  w: 110, h: 32 },
  PM:      { x: 106, y: 91,  w: 30,  h: 16 },
  chipbg:  { x: 136, y: 90,  w: 80,  h: 32 },
  chipdot: { x: 142, y: 101, w: 10,  h: 10 },
  chipTxt: { x: 156, y: 98,  w: 54,  h: 18 },
  actbg:   { x: 227, y: 90,  w: 120, h: 48 },
  bigTxt:  { x: 64,  y: 20,  w: 60,  h: 26 },   // 相对 actbg
  smallTxt:{ x: 227, y: 123, w: 62,  h: 14 },   // 相对组件
  ptrack:  { x: 14,  y: 130, w: 202, h: 8 },
};
// 进度填充按原比例换算到新轨道宽 202
const VARIANTS = [
  { label: 'idle', comp: '882:675', nodes: { bg: '881:609', visual: '881:610', divider: '881:611', time: '881:612', PM: '881:613', chipbg: '881:614', chipdot: '881:615', chipTxt: '881:616', actbg: '881:617', smallTxt: '881:618', bigTxt: '881:619', ptrack: '881:620', pfill: '881:621' }, ratio: 130 / 326 },
  { label: 'done', comp: '882:676', nodes: { bg: '881:623', visual: '881:624', divider: '881:625', time: '881:626', PM: '881:627', chipbg: '881:628', chipdot: '881:629', chipTxt: '881:630', actbg: '881:631', smallTxt: '881:632', bigTxt: '881:633', ptrack: '881:634', pfill: '881:635' }, ratio: 1 },
];
console.log('\n=== Card/Task 还原 ===');
for (const v of VARIANTS) {
  const n = v.nodes;
  for (const k of ['bg', 'visual', 'divider', 'time', 'PM', 'chipbg', 'chipdot', 'chipTxt', 'actbg', 'ptrack']) {
    await set(n[k], G[k]);
  }
  // 大中文移进 actbg（与 launching 结构一致），再设局部坐标
  const rp = await run(['node', 'reparent', n.bigTxt, n.actbg]);
  if (!/Moved/.test(rp)) errs.push(`reparent bigTxt ${n.bigTxt} -> ${n.actbg}: ${rp.trim().split('\n')[0].slice(0, 80)}`);
  await set(n.bigTxt, G.bigTxt);
  await set(n.smallTxt, G.smallTxt);
  await set(n.pfill, { x: G.ptrack.x, y: G.ptrack.y, w: Math.round(G.ptrack.w * v.ratio), h: G.ptrack.h });
  console.log(`  ${v.label}: 全部子节点按 launching 摆放；pfill 宽 ${Math.round(G.ptrack.w * v.ratio)}（原比例 ${(v.ratio * 100).toFixed(0)}%）`);
}

// ── 3) 复核
console.log('\n=== 复核 ===');
for (const [label, id] of [['launch', '882:667'], ['stop', '882:668']]) {
  const t = await run(['node', 'tree', id, '--depth', '2', '--ids']);
  console.log(`  Btn/Status ${label}:`);
  for (const l of t.split('\n').slice(1)) if (l.trim()) console.log('    ' + l.trim());
}
for (const v of [{ l: 'launching', c: '882:674' }, { l: 'idle', c: '882:675' }, { l: 'done', c: '882:676' }]) {
  const t = await run(['node', 'tree', v.c, '--depth', '2', '--ids']);
  const n = t.split('\n').filter((l) => /FRAME|TEXT/.test(l)).length;
  console.log(`  Card/Task ${v.l}: 子节点 ${n}`);
}
if (errs.length) { console.log('\n!! 失败项:'); errs.slice(0, 12).forEach((e) => console.log('   ' + e)); }
else console.log('\n无失败项');
child.kill(); process.exit(0);
