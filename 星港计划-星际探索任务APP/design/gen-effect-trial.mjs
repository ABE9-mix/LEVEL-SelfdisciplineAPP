// 试片 v3：用修正后的 duplicate 解析（取 " as " 之后的 id）从新副本复制带效果的节点
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'trial3b', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const COPY = '903:1643';
const asId = (s) => { const m = s.match(/ as .*?\((\d+:\d+)\)/); return m ? m[1] : null; };
const firstId = (s) => (s.match(/(\d+:\d+)/) || [])[1];
const F = 'font="Ark Pixel 12px Mono zh-Hans"';
const t = (s, x, y, w, h, o = {}) => `<Text x={${x}} y={${y}} w={${w}} h={${h}} size={${o.size || 12}} color="${o.color || '#ffffff'}" ${F}>${s}</Text>`;
const OX = 5600, OY = 1220;

// 找浅色文字源
let lightText = null;
{
  const tr = await run(['node', 'tree', COPY, '--depth', '4', '--ids']);
  for (const line of tr.split('\n')) {
    const m = line.match(/TEXT: (Emergency stop|LAUNCH) .*?\[(\d+:\d+)\]/);
    if (m) { lightText = m[2]; break; }
  }
}
console.log('浅色文字源: ' + lightText);

// [标签, 源id, 目标x, 目标y]
const ITEMS = [
  ['① 容器 361×40（DROP 4,4 #393939）', '903:1644', 60, 150],
  ['② 凸起块 61×30（INNER×2 + DROP）', '903:1688', 60, 250],
  ['③ 中灰块 108×108（INNER×2）', '903:1670', 60, 340],
  ['④ 凹下块 115×30（INNER 2,2）', '903:1650', 250, 340],
  ['⑤ 白进度条 124×8（INNER×2）', '903:1680', 60, 500],
  ['⑥ 绿点', '903:1681', 60, 570],
  ['⑦ 黄点', '903:1686', 120, 570],
  ['⑧ 红点', '903:1683', 180, 570],
  ['⑨ 深色文字（DROP 0,1 #6d6d6d）', '903:1652', 60, 640],
];
if (lightText) ITEMS.push(['⑩ 浅色文字（DROP 0,1 #000@25%）', lightText, 300, 640]);

// 画框
const rr = await render(`<Frame name="效果试片 v3（复制带效果）" x={${OX}} y={${OY}} w={900} h={780} bg="#1a1a1a" flex="none">
  ${t('效果试片 v3 · 全部由「复制带效果的源节点」得到', 24, 20, 860, 30, { size: 24 })}
  ${t('未做任何效果写入（node set --effects 会被事务回滚，不可用）', 24, 54, 860, 20, { size: 12, color: '#b0b0b0' })}
</Frame>`);
const BOARD = firstId(rr);
console.log('试片画框: ' + BOARD);

// 标签
for (const [label, , x, y] of ITEMS) {
  const one = await render(`<Text name="L" x={${OX + x}} y={${OY + y - 22}} w={440} h={18} size={12} color="#9a9a9a" ${F}>${label}</Text>`);
  const lid = firstId(one);
  if (lid) await run(['node', 'reparent', lid, BOARD]);
}

// 复制源节点
let ok = 0;
const made = [];
for (const [label, src, x, y] of ITEMS) {
  const d = await run(['node', 'duplicate', src]);
  const dupId = asId(d);
  if (!dupId) { console.log(`! ${label}: ${d.trim().slice(0, 100)}`); continue; }
  await run(['node', 'rename', dupId, label]);
  await run(['node', 'reparent', dupId, BOARD]);
  await run(['node', 'move', dupId, String(OX + x), String(OY + y)]);
  made.push({ label, dupId });
  const ins = await run(['inspect', dupId, '--json']);
  const cnt = (ins.match(/"type"\s*:\s*"(INNER_SHADOW|DROP_SHADOW)"/g) || []).length;
  if (cnt > 0) ok++;
  console.log(`  ${cnt ? '✓' : '✗'} ${label.padEnd(38)} 效果 ${cnt}  (源 ${src})`);
}
console.log(`\n带效果 ${ok}/${made.length}`);

// 恢复用户的「样例」组
console.log('\n=== 恢复用户样例 ===');
const g = await render(`<Frame name="样例（已恢复）" x={${OX + 620}} y={${OY + 150}} w={76} h={45} flex="none" />`);
const gid = firstId(g);
if (gid) {
  await run(['node', 'reparent', gid, BOARD]);
  const w1 = await run(['node', 'duplicate', '903:1644']);      // 外框：DROP 4,4
  const id1 = asId(w1);
  if (id1) { await run(['node', 'rename', id1, '外框']); await run(['node', 'reparent', id1, gid]); await run(['node', 'set', id1, '--width', '76', '--height', '45']); }
  const w2 = await run(['node', 'duplicate', '903:1688']);      // 内部元素：INNER×2+DROP
  const id2 = asId(w2);
  if (id2) { await run(['node', 'rename', id2, '内部元素']); await run(['node', 'reparent', id2, gid]); await run(['node', 'set', id2, '--x', '8', '--y', '8']); }
  console.log(`  外框 ${id1} / 内部元素 ${id2}`);
}

const sc = await rpc('tools/call', { name: 'figma_screenshot', arguments: { nodeId: BOARD, scale: 1.5 } });
console.log((sc.result?.content || []).map((c) => c.text ?? '').join('\n').slice(0, 320));
child.kill(); process.exit(0);
