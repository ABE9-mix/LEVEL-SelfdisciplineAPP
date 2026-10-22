// 用 TEXT Style 把字体统一为 Ark Pixel（node set 不支持字体，样式可以）
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'style', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const FONT = 'Ark Pixel 12px Mono zh-Hans';
const SIZES = [12, 24, 36, 48];
const styleName = (s) => `SP/Text/${s}`;

// 1) 建四个文字样式
for (const s of SIZES) {
  const p = JSON.stringify({ fontName: { family: FONT, style: 'Regular' }, fontSize: s, lineHeight: { unit: 'PIXELS', value: s } });
  const o = await run(['style', 'create', 'TEXT', styleName(s), '-p', p]);
  console.log(`style ${styleName(s)}: ${o.trim().split('\n')[0].slice(0, 100)}`);
}

// 2) 收集两个板里的文字层及其字号
const buckets = new Map(SIZES.map((s) => [s, []]));
const others = [];
for (const root of ['881:430', '887:689']) {
  const tree = await run(['node', 'tree', root, '--depth', '8', '--ids']);
  const ids = [];
  for (const line of tree.split('\n')) {
    const m = line.match(/^\s*TEXT: .*\[(\d+:\d+)\]/);
    if (m) ids.push(m[1]);
  }
  for (const id of ids) {
    const j = await run(['inspect', id, '--json']);
    const fm = j.match(/"fontSize":\s*([\d.]+)/);
    const sz = fm ? Math.round(parseFloat(fm[1])) : null;
    if (sz && buckets.has(sz)) buckets.get(sz).push(id);
    else others.push({ id, sz, raw: (j.match(/"fontName":\s*\{[^}]*\}/) || [''])[0] });
  }
}
console.log('\n按字号分组:');
for (const s of SIZES) console.log(`  ${s}px: ${buckets.get(s).length} 层`);
if (others.length) {
  console.log(`  其他字号: ${others.length} 层 -> ` + [...new Set(others.map((o) => o.sz))].join(', '));
}

// 3) 逐个字号套样式
for (const s of SIZES) {
  const ids = buckets.get(s);
  if (!ids.length) continue;
  // 分批，避免单次参数过长
  for (let i = 0; i < ids.length; i += 40) {
    const chunk = ids.slice(i, i + 40);
    const o = await run(['style', 'apply', styleName(s), chunk.join(','), '--field', 'text']);
    if (/error|Invalid|failed/i.test(o)) console.log(`  ! ${s}px 批次${i}: ${o.trim().slice(0, 120)}`);
  }
  console.log(`  ${s}px 已套 ${ids.length} 层`);
}
// 其他字号（如 14/9/10）单独建样式
for (const sz of [...new Set(others.map((o) => o.sz))].filter(Boolean)) {
  if (SIZES.includes(sz)) continue;
  const p = JSON.stringify({ fontName: { family: FONT, style: 'Regular' }, fontSize: sz, lineHeight: { unit: 'PIXELS', value: sz } });
  const sm = `SP/Text/${sz}`;
  await run(['style', 'create', 'TEXT', sm, '-p', p]);
  const ids = others.filter((o) => o.sz === sz).map((o) => o.id);
  await run(['style', 'apply', sm, ids.join(','), '--field', 'text']);
  console.log(`  ${sz}px 已套 ${ids.length} 层（新建样式 ${sm}）`);
}
child.kill(); process.exit(0);
