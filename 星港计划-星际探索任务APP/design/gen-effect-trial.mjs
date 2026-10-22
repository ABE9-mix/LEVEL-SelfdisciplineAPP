// 重做紧凑试片（标题放进画框内），并 1.5x 截图
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
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('timeout')); } }, t); }); }
async function run(args) { const r = await rpc('tools/call', { name: 'figma_run', arguments: { args } });
  return (r.result?.content || []).map((c) => c.text ?? '').join('\n'); }
async function render(jsx) { const r = await rpc('tools/call', { name: 'figma_render', arguments: { jsx } });
  return (r.result?.content || []).map((c) => c.text ?? '').join('\n'); }
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'trial2', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

// 删掉上一版
await run(['node', 'delete', '899:1537']).catch(() => {});

const F = 'font="Ark Pixel 12px Mono zh-Hans"';
const t = (s, x, y, w, h, o = {}) => `<Text x={${x}} y={${y}} w={${w}} h={${h}} size={${o.size || 12}} color="${o.color || '#ffffff'}" ${F}>${s}</Text>`;
const r = (nm, x, y, w, h, o = {}) => {
  const a = [`x={${x}}`, `y={${y}}`, `w={${w}}`, `h={${h}}`];
  if (o.bg) a.push(`bg="${o.bg}"`);
  if (o.stroke) a.push(`stroke="${o.stroke}"`, `strokeWidth={${o.sw ?? 2}}`);
  a.push('flex="none"');
  return `<Frame name="${nm}" ${a.join(' ')} />`;
};

const W = 820;
const rows = [];
let y = 84;
const jobs = [];
function pair(label, w, h, o) {
  rows.push(t(label, 20, y, 500, 18, { size: 12, color: '#9a9a9a' }));
  rows.push(t('无效果', 20, y + 22, 90, 14, { size: 12, color: '#6a6a6a' }));
  rows.push(t('带效果', 20 + w + 100, y + 22, 90, 14, { size: 12, color: '#6a6a6a' }));
  rows.push(r(`flat_${label}`, 20, y + 42, w, h, o));
  rows.push(r(`eff_${label}`, 20 + w + 100, y + 42, w, h, o));
  jobs.push(`eff_${label}`);
  y += 42 + Math.max(h, 20) + 38;
}
rows.push(t('星港计划 · 矩形体积感试片', 20, 20, 700, 30, { size: 24, color: '#ffffff' }));
rows.push(t('效果逐字取自手摆板；全部 blur = 0', 20, 54, 700, 20, { size: 12, color: '#b0b0b0' }));
pair('① 凸起按钮 61×30 #c8c8c8', 61, 30, { bg: '#c8c8c8' });
pair('② 容器/面板 361×40 #2c2c2c+描边', 361, 40, { bg: '#2c2c2c', stroke: '#c8c8c8', sw: 2 });
pair('③ 中灰块 88×88 #666666', 88, 88, { bg: '#666666' });
pair('④ 凹下块 115×30 #151515', 115, 30, { bg: '#151515' });
pair('⑤ 白进度条 124×8 #ffffff', 124, 8, { bg: '#ffffff' });

// 状态点单独一行（放大版对照：3 个小 + 3 个放大 4 倍便于看清）
rows.push(t('⑥ 状态点 10×10（上：原尺寸 ／ 下：放大 4 倍示意）', 20, y, 700, 18, { size: 12, color: '#9a9a9a' }));
['#04ff00', '#ffd000', '#ff0000'].forEach((c, i) => {
  rows.push(r(`flat_dot${i}`, 20 + i * 50, y + 24, 10, 10, { bg: c }));
  rows.push(r(`eff_dot${i}`, 200 + i * 50, y + 24, 10, 10, { bg: c }));
  jobs.push(`eff_dot${i}`);
});
['#04ff00', '#ffd000', '#ff0000'].forEach((c, i) => {
  rows.push(r(`flat_big${i}`, 20 + i * 96, y + 46, 40, 40, { bg: c }));
  rows.push(r(`eff_big${i}`, 340 + i * 96, y + 46, 40, 40, { bg: c }));
  jobs.push(`eff_big${i}`);
});
y += 110;

const jsx = `<Frame name="效果试片" x={5600} y={1200} w={${W}} h={${y + 30}} bg="#1a1a1a" flex="none">
      ${rows.join('\n      ')}
    </Frame>`;
const rr = await render(jsx);
const cid = (rr.match(/Rendered:\s*(\d+:\d+)/) || [])[1];
console.log('render: ' + cid + '  ' + rr.split('\n').filter((l) => /error|Error/.test(l)).join(' '));

// 套效果
const hex = (hh) => { const n = parseInt(hh.slice(1), 16); return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: 1 }; };
const IN = (x, yy, c, a = 1) => ({ type: 'INNER_SHADOW', color: { ...hex(c), a }, offset: { x, y: yy }, radius: 0, spread: 0, visible: true, blendMode: 'NORMAL' });
const DR = (x, yy, c, a = 1) => ({ type: 'DROP_SHADOW', color: { ...hex(c), a }, offset: { x, y: yy }, radius: 0, spread: 0, visible: true, blendMode: 'NORMAL' });
const FX = {
  'eff_① 凸起按钮 61×30 #c8c8c8': [IN(-2, -2, '#969696'), IN(2, 2, '#d6d6d6'), DR(2, 2, '#393939')],
  'eff_② 容器/面板 361×40 #2c2c2c+描边': [DR(4, 4, '#393939')],
  'eff_③ 中灰块 88×88 #666666': [IN(-2, -2, '#737373'), IN(2, 2, '#757575'), DR(2, 2, '#393939')],
  'eff_④ 凹下块 115×30 #151515': [IN(2, 2, '#000000')],
  'eff_⑤ 白进度条 124×8 #ffffff': [IN(-2, -2, '#939393'), IN(2, 2, '#b6b6b6')],
  'eff_dot0': [IN(-2, -2, '#488747'), IN(2, 2, '#72c171'), DR(2, 2, '#393939')],
  'eff_dot1': [IN(-2, -2, '#85752c'), IN(2, 2, '#d1b952'), DR(2, 2, '#393939')],
  'eff_dot2': [IN(-2, -2, '#853f3f'), IN(2, 2, '#da6868'), DR(2, 2, '#393939')],
  'eff_big0': [IN(-8, -8, '#488747'), IN(8, 8, '#72c171'), DR(8, 8, '#393939')],
  'eff_big1': [IN(-8, -8, '#85752c'), IN(8, 8, '#d1b952'), DR(8, 8, '#393939')],
  'eff_big2': [IN(-8, -8, '#853f3f'), IN(8, 8, '#da6868'), DR(8, 8, '#393939')],
};
const tree = await run(['node', 'tree', cid, '--depth', '1', '--ids']);
const map = {};
for (const line of tree.split('\n')) {
  const m = line.match(/FRAME: (.+?) \((\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\) \[(\d+:\d+)\]/);
  if (m) map[m[1].trim()] = m[4];
}
let ok = 0;
for (const [nm, fx] of Object.entries(FX)) {
  const id = map[nm];
  if (!id) { console.log('! 缺 ' + nm); continue; }
  const o = await run(['node', 'set', id, '--effects', JSON.stringify(fx)]);
  if (/error|Invalid|unsupported/i.test(o)) console.log(`! ${nm}: ${o.trim().slice(0, 110)}`);
  else ok++;
}
console.log(`效果 ${ok}/${Object.keys(FX).length}`);
const sc = await rpc('tools/call', { name: 'figma_screenshot', arguments: { nodeId: cid, scale: 1.5 } });
console.log((sc.result?.content || []).map((c) => c.text ?? '').join('\n').slice(0, 400));
child.kill(); process.exit(0);
