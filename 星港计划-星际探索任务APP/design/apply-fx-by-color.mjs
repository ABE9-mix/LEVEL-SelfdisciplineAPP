// 按底色/文字色匹配 SP/FX 样式，批量套到合并后的组件库
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'fxlayer', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const ROOT = process.argv[2] || '908:31';
const DRY = process.argv.includes('--dry');

// 收集节点
const tree = await run(['node', 'tree', ROOT, '--depth', '8', '--ids']);
const ids = [];
for (const line of tree.split('\n')) {
  const m = line.match(/\[(\d+:\d+)\]/);
  if (m) ids.push(m[1]);
}
console.error('节点 ' + ids.length);

// 规则：按 (类型, 底色/文字色, 尺寸) → 样式名
function pick(j) {
  const st = j.style || {};
  const fills = (st.fills || []).filter((f) => typeof f === 'string' && f.startsWith('#'));
  const c = fills[0] ? fills[0].toLowerCase() : null;
  const w = j.width || 0, h = j.height || 0;
  if (j.type === 'TEXT') {
    const col = (st.fills || [])[0];
    if (!col) return null;
    const dark = ['#000000', '#151515', '#2c2c2c', '#4b4b4b', '#666666'];
    const light = ['#ffffff', '#c8c8c8', '#b0b0b0', '#a9a9a9'];
    if (dark.includes(col.toLowerCase())) return 'SP/FX/字深';
    if (light.includes(col.toLowerCase())) return 'SP/FX/字浅';
    if (col.toLowerCase() === '#7e7e7e') return 'SP/FX/字深';   // 灰字
    return null;
  }
  if (!c) return null;
  // 排除图案小格（斜纹 4×4 / 刻度 8×8），它们是纹理不是面
  if (w <= 8 && h <= 8) return null;
  const small = w <= 48 && h <= 48;
  switch (c) {
    case '#c8c8c8': case '#b0b0b0': return 'SP/FX/凸起';
    case '#666666': return small ? 'SP/FX/中灰' : 'SP/FX/中灰带投影';
    case '#4b4b4b': return small ? 'SP/FX/中灰' : 'SP/FX/容器';
    case '#2c2c2c': return (w >= 150 || h >= 60) ? 'SP/FX/容器' : 'SP/FX/中灰';
    case '#151515': return (w >= 150 || h >= 60) ? 'SP/FX/容器' : 'SP/FX/凹下';
    case '#ffffff': return (h <= 16 && w >= 40) ? 'SP/FX/白条' : (small ? 'SP/FX/凸起' : 'SP/FX/容器');
    case '#04ff00': return small ? 'SP/FX/点绿' : null;
    case '#ffe100': case '#ffd000': return small ? 'SP/FX/点黄' : null;
    case '#ff0d00': case '#ff0000': return small ? 'SP/FX/点红' : null;
    default: return null;
  }
}

const plan = [];
const tally = {};
for (const id of ids) {
  let j; try { j = JSON.parse(await run(['inspect', id, '--json'])); } catch { continue; }
  const sty = pick(j);
  if (!sty) continue;
  plan.push({ id, name: j.name, sty });
  tally[sty] = (tally[sty] || 0) + 1;
}
console.log('=== 匹配统计 ===');
for (const [k, v] of Object.entries(tally).sort((a, c) => c[1] - a[1])) console.log(`  ${k.padEnd(20)} ${v}`);
console.log(`合计 ${plan.length} 个节点`);

if (DRY) { console.log('\n[干跑] 未写入'); child.kill(); process.exit(0); }

console.log('\n=== 套用 ===');
let ok = 0, fail = 0;
for (const p of plan) {
  const o = await run(['style', 'apply', p.sty, p.id, '--field', 'effect']);
  if (/rejected|failed|error/i.test(o)) { fail++; if (fail <= 3) console.log(`  ! ${p.name}: ${o.trim().split('\n')[0].slice(0, 80)}`); }
  else ok++;
}
console.log(`成功 ${ok} / 失败 ${fail}`);

// 抽查 6 个
console.log('\n=== 抽查 ===');
for (const p of plan.filter((_, i) => i % Math.max(1, Math.floor(plan.length / 6)) === 0).slice(0, 6)) {
  const ins = await run(['inspect', p.id, '--json']);
  const cnt = (ins.match(/"type"\s*:\s*"(INNER_SHADOW|DROP_SHADOW)"/g) || []).length;
  console.log(`  ${cnt ? '✓' : '✗'} ${p.name.padEnd(26)} ${p.sty}  效果数 ${cnt}`);
}
child.kill(); process.exit(0);
