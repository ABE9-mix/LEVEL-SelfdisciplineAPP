// 生成配色表画板（数据源：组件库 v3 全量扫描）
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
async function run(args) { const r = await rpc('tools/call', { name: 'figma_run', arguments: { arguments: undefined, args } });
  return (r.result?.content || []).map((c) => c.text ?? '').join('\n'); }
async function render(jsx) { const r = await rpc('tools/call', { name: 'figma_render', arguments: { jsx } });
  return (r.result?.content || []).map((c) => c.text ?? '').join('\n'); }
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'palette', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');
const firstId = (s) => (s.match(/(\d+:\d+)/) || [])[1];
const F = 'font="Ark Pixel 12px Mono zh-Hans"';

// [令牌名, hex, 用途, 用量]
const GROUPS = [
  ['① 表面 / 底色', [
    ['bg/void', '#000000', '最底层、画板底', 129],
    ['bg/sunken', '#151515', '未选中、凹槽', 9],
    ['bg/base', '#2c2c2c', '卡片、容器', 34],
    ['—（未令牌）', '#3a3a3a', 'Card/Task 视觉区', 2],
    ['bg/raise', '#4b4b4b', '次级表面、占位', 12],
    ['line/track', '#666666', '轨道、禁用底', 118],
  ]],
  ['② 描边 / 线条', [
    ['line/soft', '#a9a9a9', '细描边 1px', 12],
    ['line/strong', '#c8c8c8', '主描边 2px', 43],
  ]],
  ['③ 文字', [
    ['text/primary', '#ffffff', '一级文字', 199],
    ['text/inverse', '#000000', '浅底上的黑字', '—'],
    ['text/secondary', '#b0b0b0', '二级文字', 26],
    ['text/disabled', '#7e7e7e', '禁用、未选中', 31],
    ['text/muted', '#666666', '极弱信息', '·'],
  ]],
  ['④ 强调色', [
    ['accent/go', '#04ff00', '成功点、状态灯', 11],
    ['accent/go-deep', '#2bbf18', '绿按钮底（黑字）', 7],
    ['accent/warn', '#ffe100', '编号、警示', 6],
    ['accent/stop', '#ff0d00', '终止、危险', 5],
    ['accent/confirm', '#4d8fd6', '确认（蓝）', 3],
  ]],
  ['⑤ 非组件色（仅板内标注用）', [
    ['—', '#9a9a9a', '分区/组件名标签', 25],
    ['—', '#1a1a1a', '画板底', 1],
  ]],
];

const OX = 7000, OY = 3640, PAD = 40, COLS = 3, CELLW = 430, CELLH = 118, BLOCK = 92;
let y = 100;
const parts = [];
for (const [title, items] of GROUPS) {
  parts.push(`<Text x={${PAD}} y={${y}} w={1100} h={24} size={24} color="#ffffff" ${F}>${title}</Text>`);
  y += 38;
  let col = 0, rowY = y;
  for (const [name, hex, use, cnt] of items) {
    const x = PAD + col * CELLW;
    // 色块（描边保证浅色可辨）
    parts.push(`<Frame x={${x}} y={${rowY}} w={${BLOCK}} h={${BLOCK}} bg="${hex}" stroke="#4b4b4b" strokeWidth={1} flex="none" />`);
    parts.push(`<Text x={${x + BLOCK + 16}} y={${rowY + 6}} w={300} h={20} size={12} color="#ffffff" ${F}>${name}</Text>`);
    parts.push(`<Text x={${x + BLOCK + 16}} y={${rowY + 30}} w={300} h={20} size={12} color="#c8c8c8" ${F}>${hex}</Text>`);
    parts.push(`<Text x={${x + BLOCK + 16}} y={${rowY + 54}} w={320} h={20} size={12} color="#b0b0b0" ${F}>${use}</Text>`);
    parts.push(`<Text x={${x + BLOCK + 16}} y={${rowY + 76}} w={300} h={18} size={12} color="#7e7e7e" ${F}>用量 ${cnt}</Text>`);
    col++;
    if (col >= COLS) { col = 0; rowY += CELLH; }
  }
  y = (col > 0 ? rowY + CELLH : rowY) + 26;
}

const jsx = `<Frame name="组件库配色表" x={${OX}} y={${OY}} w={${PAD * 2 + COLS * CELLW + 40}} h={${y + 30}} bg="#1a1a1a" flex="none">
  <Text x={${PAD}} y={30} w={1300} h={34} size={24} color="#ffffff" ${F}>星港计划 · 组件库配色表</Text>
  <Text x={${PAD}} y={68} w={1400} h={20} size={12} color="#b0b0b0" ${F}>数据源：组件库 v3（908:31）673 节点全量扫描 · 用量为出现次数（填充+描边）</Text>
  ${parts.join('\n  ')}
</Frame>`;
const rr = await render(jsx);
const BOARD = firstId(rr);
console.log('配色表: ' + BOARD + '\n' + rr.split('\n').filter((l) => /Rendered|error|Invalid/i.test(l)).join('\n'));
const sc = await rpc('tools/call', { name: 'figma_screenshot', arguments: { nodeId: BOARD, scale: 1.0 } });
const txt = (sc.result?.content || []).map((c) => c.text ?? '').join('\n');
const m = txt.match(/"saved"\s*:\s*"([^"]+)"/);
console.log('PNG: ' + (m ? m[1] : txt.slice(0, 200)));
child.kill(); process.exit(0);
