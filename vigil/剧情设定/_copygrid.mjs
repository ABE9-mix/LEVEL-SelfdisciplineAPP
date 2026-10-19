// 文案校验 + 生成：把 copy-bank.mjs 的每条文案按 NES12 的 12px 网格量一遍，
// 超宽/违禁词直接报错，然后输出可读的《文案库》Markdown。
//
// 度量规则（与 nes12/core.mjs 的 textWidth 一致）：CJK/全角 = 12px，拉丁/数字/半角 = 6px。
import { readFileSync, writeFileSync } from 'node:fs';
import { SLOTS, SECTIONS } from './copy-bank.mjs';

const OUT = 'F:\\industryworks\\图形界面设计\\LEVEL-app\\剧情设定\\文案库-NES12.md';
const ADV_CJK = 12, ADV_LAT = 6;

const width = (s) => {
  let w = 0;
  for (const ch of String(s)) w += ch.codePointAt(0) < 0x2e80 ? ADV_LAT : ADV_CJK;
  return w;
};
const cjk = (s) => [...String(s)].filter((c) => c.codePointAt(0) >= 0x2e80).length;

// ── 硬禁词：与世界法则冲突，出现即报错
const BANNED = [
  ['拖延症', '把问题拟人成敌人，违反「不设敌人」'],
  ['打败', '战斗隐喻，违反「不做战斗叙事」'],
  ['战胜', '战斗隐喻'],
  ['干掉', '暴力隐喻'],
  ['消灭', '暴力隐喻'],
  ['击杀', '暴力隐喻'],
  ['血量', '生命值隐喻，本产品不折损生存资源'],
  ['满血', '同上'],
  ['惩罚', '违反「中断是中性天气」'],
  ['扣分', '违反「无人给你打分」'],
  ['前功尽弃', '违反「入壁者不还」的情感表达'],
  ['荒废', '羞辱性定性'],
  ['加油', '无信息的空鼓励，守夜人不空鼓励'],
  ['太棒', '过度情绪评价，灰烬书记只陈述'],
  ['真棒', '同上'],
  ['排行榜', '违反「无排行榜」'],
  ['排名', '违反「无排行榜」'],
  ['改变人生', '承诺结果，违反「不承诺结果」'],
  ['逆袭', '承诺结果'],
  ['冲刺', '游戏化空转，无对应现实动作'],
  ['暴击', '同上'],
];

// ── 条件放行：只允许出现在指定的固定搭配里
const CONDITIONAL = [
  { word: '失败', allow: ['失败代价'], why: '作为机制名（代价条）可用；不得用来定性用户' },
];

const errors = [], warnings = [];
const stats = { total: 0, bySlot: {}, maxFill: { ratio: 0 } };

for (const sec of SECTIONS) {
  for (const it of sec.items) {
    stats.total++;
    const slot = SLOTS[it.slot];
    if (!slot) { errors.push(`未知槽位 ${it.slot}：${it.text}`); continue; }
    const w = width(it.text);
    const ratio = w / slot.max;
    if (w > slot.max) errors.push(`超宽 [${sec.key}/${it.slot}] ${w}px > ${slot.max}px　「${it.text}」`);
    if (ratio > stats.maxFill.ratio) stats.maxFill = { ratio, text: it.text, slot: it.slot, w, max: slot.max, sec: sec.key };
    stats.bySlot[it.slot] = stats.bySlot[it.slot] || { n: 0, maxW: 0 };
    stats.bySlot[it.slot].n++;
    stats.bySlot[it.slot].maxW = Math.max(stats.bySlot[it.slot].maxW, w);

    // 禁词（否定式用法降级为待确认：写"不做排名"是在表达相反的意思）
    for (const [word, why] of BANNED) {
      for (const m of it.text.matchAll(new RegExp(word, 'g'))) {
        const prev = it.text[m.index - 1] || '';
        if ('无不没别否未'.includes(prev)) warnings.push(`否定式用法「${prev}${word}」需人工确认：${it.text}`);
        else errors.push(`禁词「${word}」(${why})：${it.text}`);
      }
    }
    for (const { word, allow, why } of CONDITIONAL) {
      const idx = [...it.text.matchAll(new RegExp(word, 'g'))].map((m) => m.index);
      for (const i of idx) {
        const ok = allow.some((a) => it.text.slice(Math.max(0, i - (a.length - word.length)), i + a.length).includes(a));
        if (!ok) warnings.push(`待确认「${word}」(${why})：${it.text}`);
      }
    }
    // 风格
    if (it.text.includes('！')) warnings.push(`叹号（守夜人不用叹号）：${it.text}`);
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(it.text)) errors.push(`禁用 emoji/符号：${it.text}`);
    if (it.slot === 'quote' && cjk(it.text) < 6) warnings.push(`金句过短（<6 汉字）：${it.text}`);
    if (it.slot === 'btn' && cjk(it.text) > 8) errors.push(`按钮超过 8 汉字：${it.text}`);
  }
}

// ── 生成 Markdown
const L = [];
L.push('# LEVEL · 剧情文案库（NES12 网格校验版）');
L.push('');
L.push('> 本文件由 `剧情设定/_copygrid.mjs` 从 `copy-bank.mjs` 生成，**不是手写**。改文案请改数据源再重跑，避免文档与实现漂移。');
L.push('> 度量规则与 `nes12/core.mjs` 的 `textWidth()` 一致：**汉字/全角 = 12px，拉丁/数字/半角 = 6px**。');
L.push('');
L.push('## 槽位与上限（推导自 nes12 的实测布局）');
L.push('');
L.push('| 槽位 | 上限 | 依据 | 条数 | 实测最宽 |');
L.push('|---|---|---|---|---|');
for (const [k, v] of Object.entries(SLOTS)) {
  const s = stats.bySlot[k] || { n: 0, maxW: 0 };
  L.push(`| \`${k}\` | ${v.max} px | ${v.why} | ${s.n} | ${s.maxW} px |`);
}
L.push('');
L.push(`**合计 ${stats.total} 条**；最满的一条：\`${stats.maxFill.slot}\` ${stats.maxFill.w}/${stats.maxFill.max} px（占 ${(stats.maxFill.ratio * 100).toFixed(0)}%）——「${stats.maxFill.text}」`);
L.push('');
L.push('---');
L.push('');
for (const sec of SECTIONS) {
  L.push(`## ${sec.title}`);
  L.push('');
  L.push(`*${sec.note}*`);
  L.push('');
  L.push('| 槽位 | 上限 | 实测 | 余量 | 文案 | 归属 | 备注 |');
  L.push('|---|---|---|---|---|---|---|');
  for (const it of sec.items) {
    const max = SLOTS[it.slot].max, w = width(it.text), rest = max - w;
    const flag = rest < 0 ? ' ❌' : rest < 12 ? ' ⚠' : '';
    L.push(`| \`${it.slot}\` | ${max} | ${w}${flag} | ${rest} | ${it.text} | ${it.say || '—'} | ${it.note || ''} |`);
  }
  L.push('');
}
L.push('---');
L.push('');
L.push('## 违禁词表（写作红线，脚本强制）');
L.push('');
L.push('| 禁词 | 原因 |');
L.push('|---|---|');
for (const [w, why] of BANNED) L.push(`| ${w} | ${why} |`);
L.push('');
L.push('条件放行：');
for (const c of CONDITIONAL) L.push(`- **${c.word}**：只允许出现在 \`${c.allow.join('`, `')}\` 中。${c.why}`);
L.push('');
L.push('## 校验结果');
L.push('');
L.push('```');
L.push(`文案条数：${stats.total}`);
L.push(`超宽：${errors.filter((e) => e.startsWith('超宽')).length}`);
L.push(`禁词/emoji：${errors.filter((e) => !e.startsWith('超宽')).length}`);
L.push(`待确认：${warnings.length}`);
L.push('```');
L.push('');
if (errors.length) {
  L.push('### 错误');
  L.push('');
  for (const e of errors) L.push(`- ${e}`);
  L.push('');
}
if (warnings.length) {
  L.push('### 待确认');
  L.push('');
  for (const w of warnings) L.push(`- ${w}`);
  L.push('');
}

writeFileSync(OUT, L.join('\n'));
console.log(`生成 ${OUT}`);
console.log(`条数 ${stats.total}｜超宽 ${errors.filter((e) => e.startsWith('超宽')).length}｜禁词 ${errors.filter((e) => !e.startsWith('超宽')).length}｜待确认 ${warnings.length}`);
if (errors.length) { console.log('\n--- 错误 ---'); errors.forEach((e) => console.log('  ' + e)); }
if (warnings.length) { console.log('\n--- 待确认 ---'); warnings.forEach((w) => console.log('  ' + w)); }
