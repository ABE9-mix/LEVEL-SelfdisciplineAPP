// 线框稿灰度分层（正式）：按几何包含关系推断层级 → 套 PAINT 样式
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'wfgrade', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

const BOARDS = process.argv.slice(2).filter((a) => /^\d+:\d+$/.test(a));
const boards = BOARDS.length ? BOARDS : ['842:393'];
const STY = { 1: 'SP/Wire/L1', 2: 'SP/Wire/L2', 3: 'SP/Wire/L3' };
let grand = { l1: 0, l2: 0, l3: 0, fail: 0 };

for (const BOARD of boards) {
  const bt = await run(['node', 'tree', BOARD, '--depth', '1', '--ids']);
  const screens = [];
  for (const line of bt.split('\n')) {
    const m = line.match(/FRAME: (.+?) \((\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\) \[(\d+:\d+)\]/);
    // 捕获组：1=name 2=w 3=h 4=id（(?:...) 不计组）
    if (m) screens.push({ name: m[1].trim(), id: m[4] });
  }
  console.log(`\n=== ${BOARD}：${screens.length} 个屏 ===`);
  let done = 0;
  for (const sc of screens) {
    const st = await run(['node', 'tree', sc.id, '--depth', '2', '--ids']);
    const kids = [];
    for (const line of st.split('\n')) {
      // 跳过根行（缩进 2 空格的是屏本身，4 空格起才是子节点）
      if (!/^\s{2,}(FRAME|RECTANGLE):/.test(line)) continue;
      // 捕获组：1=type 2=name 3=w 4=h 5=id
      const m = line.match(/^\s*(FRAME|RECTANGLE): (.+?) \((\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\) \[(\d+:\d+)\]/);
      if (!m) continue;
      let j; try { j = JSON.parse(await run(['inspect', m[5], '--json'])); } catch { continue; }
      // 坐标在 j.raw.*（j.x/j.y 是 undefined）
      const x = j.raw?.x ?? j.x ?? 0, y = j.raw?.y ?? j.y ?? 0;
      kids.push({ id: m[5], w: j.raw?.width ?? +m[3], h: j.raw?.height ?? +m[4], x, y });
    }
    // 包含关系 → 层级
    const contains = (a, c) => a.id !== c.id && a.w >= c.w && a.h >= c.h &&
      a.x <= c.x + 0.5 && a.y <= c.y + 0.5 && a.x + a.w >= c.x + c.w - 0.5 && a.y + a.h >= c.y + c.h - 0.5 &&
      (a.w * a.h) > (c.w * c.h);
    for (const k of kids) k.level = kids.filter((o) => contains(o, k)).length;
    const buckets = { 1: [], 2: [], 3: [] };
    for (const k of kids) {
      if (k.level <= 0) continue;
      buckets[Math.min(k.level, 3)].push(k.id);
    }
    for (const lv of [1, 2, 3]) {
      const ids = buckets[lv];
      if (!ids.length) continue;
      for (let i = 0; i < ids.length; i += 60) {
        const o = await run(['style', 'apply', STY[lv], ids.slice(i, i + 60).join(','), '--field', 'fill']);
        if (/reject|failed|error/i.test(o)) { grand.fail++; console.log(`  ! L${lv}: ${o.trim().split('\n')[0].slice(0, 70)}`); }
      }
      grand['l' + lv] += ids.length;
    }
    done++;
  }
  console.log(`  处理 ${done} 屏；L1 ${grand.l1} / L2 ${grand.l2} / L3 ${grand.l3}，失败 ${grand.fail}`);
}
child.kill(); process.exit(0);
