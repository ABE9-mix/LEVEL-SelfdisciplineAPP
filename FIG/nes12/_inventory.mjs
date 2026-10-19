// 从 nes12 的构建脚本里抽「组件清单」：每个 widget 的参数、默认尺寸、状态、配色
// 只做静态分析（正则 + 版本号），保证统计表里的尺寸/状态与代码一致。
import { readFileSync } from 'node:fs';

const P = 'F:\\deepseek\\作业\\figcraft_mcp\\pixel\\nes12';
const core = readFileSync(P + '\\core.mjs', 'utf8');
const wid = readFileSync(P + '\\widgets.mjs', 'utf8');
const build = readFileSync(P + '\\build.mjs', 'utf8');

// ── 调色板
const palette = {};
const pm = core.match(/export const P = \{([\s\S]*?)\};/);
for (const line of pm[1].split('\n')) {
  const m = line.match(/^\s*(\w+):\s*'(#[0-9a-fA-F]{6})',?\s*\/\/\s*(.*)$/);
  if (m) palette[m[1]] = { hex: m[2].toLowerCase(), note: m[3].trim() };
}

// ── 全部 export function / const（widgets）
const fns = [];
const re = /export (?:async )?function (\w+)\(mcp, parent, \{([\s\S]*?)\}\) \{/g;
let m;
while ((m = re.exec(wid))) {
  const name = m[1];
  const argsRaw = m[2].replace(/\s+/g, ' ');
  // 默认值：拆逗号（忽略嵌套）
  const params = [];
  let depth = 0, cur = '';
  for (const ch of argsRaw) {
    if ('{[('.includes(ch)) depth++;
    if ('}])'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) { params.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) params.push(cur.trim());
  const parsed = params.filter(Boolean).map((p) => {
    const [k, v] = p.split('=').map((x) => x.trim());
    return v === undefined ? { key: k, def: null } : { key: k, def: v };
  });
  fns.push({ name, params: parsed, isWidget: true });
}

// ── 私有的绘制辅助（不 export）
const priv = [];
const pre = /^async function (\w+)\(mcp, parent, \{([\s\S]*?)\}\) \{/gm;
while ((m = pre.exec(wid))) priv.push(m[1]);

// ── 状态枚举
const states = {};
const bsm = wid.match(/export const BTN_STATES = \[([^\]]+)\]/);
if (bsm) states.btn = bsm[1].split(',').map((s) => s.trim().replace(/'/g, ''));

// ── build.mjs 里实际用到的组件与画面
const used = [...new Set([...build.matchAll(/\b(btn|button|row|menu|dialog|toggle|checkbox|radio|stepper|optRow|win|bevel|v|t)\(/g)].map((x) => x[1]))];
const screens = [...build.matchAll(/t: '([^']+)'/g)].map((x) => x[1]);

console.log(JSON.stringify({ palette, fns, priv, states, used, screens }, null, 1));
