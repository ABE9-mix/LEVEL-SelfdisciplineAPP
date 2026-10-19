// 生成《LEVEL-剧情结构.canvas》：把世界观、三层火、五法则、角色、三层循环、界面落点画成一张 JSON Canvas
// 布局由脚本算（不手写坐标），生成后回读做"不越界 / 不重叠"校验。
import { writeFileSync, readFileSync } from 'node:fs';

const OUT = 'F:\\industryworks\\图形界面设计\\LEVEL-app\\剧情设定\\LEVEL-剧情结构.canvas';
const nodes = [], edges = [];
let seq = 0;
const id = (p) => `${p}${(++seq).toString(16).padStart(6, '0')}`;

function group(label, x, y, w, h, color = null) {
  const n = { id: id('g'), type: 'group', label, x, y, width: w, height: h };
  if (color) n.color = color;
  nodes.push(n);
  return n;
}
function text(t, x, y, w, h, color = null) {
  const n = { id: id('t'), type: 'text', text: t, x, y, width: w, height: h };
  if (color) n.color = color;
  nodes.push(n);
  return n;
}
function edge(from, to, label = '', sides = {}) {
  edges.push({ id: id('e'), fromNode: from.id, fromSide: sides.fs || 'right', fromEnd: 'none', toNode: to.id, toSide: sides.ts || 'left', toEnd: 'arrow', ...(label ? { label } : {}) });
}

// ── 行 1：世界 → 三层火 → 三层循环 → 界面落点
const G_WORLD = group('世界 · 余烬之野', 0, 0, 560, 300, '5');
const worldFacts = [
  '**火即证据**\n烧的是真正做过的事。\n不能买、不能花，只能让它更高。',
  '**夜潮每天回来**\n入夜是天气，不是事件。\n不需要战胜，只需在天黑前添一把。',
  '**石壁只增不减**\n刻上去的谁也拿不走——\n包括你自己。',
];
const worldBoxes = worldFacts.map((t, i) => text(t, 30, 60 + i * 76, 500, 64, '5'));

const G_FIRE = group('三层火 = 三层奖励机制', 600, 0, 540, 300, '3');
const fireBoxes = [
  text('**余光**（即时）\n完成任务当场给。已入账，不会失去。\n→ 即时反馈轻提示', 630, 60, 480, 64, '3'),
  text('**魂火**（暂存）\n挑战模式才产生，挂在这一轮上。\n**会散** → 今日页挑战条 / 篝火结算', 630, 136, 480, 64, '3'),
  text('**铭火**（永久）\n结算后的经验、徽记、称号。\n**永远不会失去** → 成长页 / 石壁', 630, 212, 480, 64, '3'),
];

const G_LOOP = group('三层循环（不是一条故事线）', 1180, 0, 620, 300, '4');
const loopBoxes = [
  text('**日循环**（每天一次，约 10 秒）\n见夜 → 拾柴 → 添火 → 余光\n→ 今日页', 1210, 60, 260, 90, '4'),
  text('**段循环**（一个挑战周期）\n立誓 → 守夜 → 渡夜 / 熄火 → 归火 → 篝火结算\n→ 目标页 · 结算页', 1210, 164, 260, 90, '4'),
  text('**长线循环**（月 / 季）\n余烬成川：火变高、石壁变厚\n→ 成长页 · 记录页', 1490, 60, 280, 90, '4'),
  text('**为什么扛得住重复**\n· 夜潮每天回来 → 每天都有事发生\n· 石壁只增不减 → 进度永不清零\n· 没有大反派、没有结局 → 不会"通关即失去意义"', 1490, 164, 280, 110, '4'),
];

const G_UI = group('界面落点（对照 IA 图与 12 屏线框）', 1840, 0, 640, 300, '6');
const uiBoxes = [
  text('**今日** 见夜 · 拾柴 · 添火 · 余光\n**目标** 立誓（含风险条款）\n**成长** 余烬成川 · 篝火结算 · 熄火归火', 1870, 60, 580, 84, '6'),
  text('**我的** 持火者档案 · 灯的开关（法则四）\n**记录页** 石壁：只增不减\n**每日金句** 法则的日常复述（24 条）', 1870, 152, 580, 84, '6'),
  text('**降级路径**：关掉高风险模式后——\n夜潮 / 守夜人 / 石壁 / 余光 **保留**；魂火 · 长夜 · 熄火归火 **不存在**\n→ 世界观不是"挑战模式的皮肤"，而是默认表达', 1870, 244, 580, 46, '6'),
];

// ── 行 2：五法则 / 角色 / 红线
const G_LAW = group('五条世界法则（= 五条设计原则的世界化）', 0, 380, 1180, 240, '1');
const laws = [
  ['法则一 · 火不替你走路', '真实行动优先', '无跳过、无自动完成、无虚拟任务'],
  ['法则二 · 夜潮不记仇', '失败后可以重新开始', '中断不计负分、不弹羞耻提醒'],
  ['法则三 · 入壁者不还', '永久成长保留（底线）', '熄火只失魂火；等级与历史永不回退'],
  ['法则四 · 灯在你手里', '风险可选择', '高风险默认关闭；随时可暂停退出'],
  ['法则五 · 无人替你打分', '只对自己负责', '无排行榜、无公开对比'],
];
const lawBoxes = laws.map(([a, b, c], i) => text(`**${a}**\n${b}\n${c}`, 30 + i * 232, 440, 212, 156, '1'));

const G_ROLE = group('角色与语气', 1220, 380, 700, 240, '2');
const roleBoxes = [
  text('**持火者**（用户）\n不设姓名 / 性别 / 外貌 / 过去。**空缺是刻意的**，用户才能把自己放进去。', 1250, 440, 640, 56, '2'),
  text('**守夜人**（引导 · 占 80% 台词）\n三句原则 · 只描述不评价 · 不劝只说 · 不用叹号 · 不承诺结果', 1250, 506, 310, 96, '2'),
  text('**灰烬书记**（数据页）\n只报数字，不下判断：\n"本周 20 次。" 而不是 "你做得不错。"', 1575, 506, 315, 96, '2'),
];

const G_RED = group('写作红线（脚本强制）', 1960, 380, 520, 240, null);
const redBoxes = [
  text('❌ 打败拖延症 → ✅ 把今天这一把放进去\n❌ 连续中断 3 天 → ✅ 今夜还没有柴\n❌ 前功尽弃 → ✅ 只会丢还没刻上的\n❌ 你太棒了 → ✅ 记下了', 1990, 440, 460, 104),
  text('❌ 加油 / 超越 92% 的用户 / 30 天改变人生\n❌ 冲刺 · 暴击 · 满血 · 击杀（无对应现实动作）\n❌ 必须 / 不许 / 一定要\n→ 以上禁词已写进校验器，出现即报错', 1990, 552, 460, 56),
];

// ── 行 3：长夜与失败叙事
const G_BOSS = group('长夜（Boss）· 不给台词', 0, 660, 1180, 220, '4');
const bosses = [
  ['七日听夜', '听力 7 天', '第 5 夜：新鲜感退去'],
  ['静水长夜', '自习 14 天', '第 2 个周末：环境干扰'],
  ['肌肤之冬', '护肤 21 天', '第 8–12 夜：完全看不到变化'],
  ['晨钟', '早起 30 天', '第 3 夜 / 第 18 夜：回调与繁忙周'],
  ['万里', '力量 8 周', '第 4 周：进步变慢'],
  ['百页', '阅读 30 天', '第 10 夜：任务负担叠加'],
];
bosses.forEach(([a, b, c], i) => text(`**${a}**\n${b}\n${c}`, 30 + i * 192, 720, 176, 140, '4'));

const G_FAIL = group('熄火与归火（最需克制处）', 1220, 660, 1260, 220, '3');
const failBoxes = [
  text('**① 熄火**（自动，不打断）\n魂火散了 / 失落 60 · 留在火里 60\n只会丢还没刻上的', 1250, 720, 380, 96, '3'),
  text('**② 归火**（用户主动，可永远不做）\n它落在附近，还能捡回来。\n补做一次，能夺回失落的一半。', 1650, 720, 380, 96, '3'),
  text('**③ 数值规则**\n熄火失 50% → 归火夺回其中 50%\n**净损失上限 = 本轮魂火的 25%**，且只在主动开启高风险时发生', 2050, 720, 400, 96, '3'),
];

// ── 连线
edge(G_WORLD, G_FIRE, '火即证据');
edge(G_FIRE, G_LOOP, '三层火驱动三层循环');
edge(G_LOOP, G_UI, '落点');
edge(G_LAW, G_FIRE, '法则三 → 铭火永不失', { fs: 'top', ts: 'bottom' });
edge(G_ROLE, G_LOOP, '守夜人说日循环', { fs: 'top', ts: 'bottom' });
edge(G_BOSS, G_FAIL, '渡夜 / 熄火', { fs: 'right', ts: 'left' });

const canvas = { nodes, edges };
writeFileSync(OUT, JSON.stringify(canvas, null, 1));

// ── 回读校验：text 节点必须落在某个 group 内，且同组内不重叠
const back = JSON.parse(readFileSync(OUT, 'utf8'));
const groups = back.nodes.filter((n) => n.type === 'group');
const texts = back.nodes.filter((n) => n.type === 'text');
const problems = [];
for (const t of texts) {
  const host = groups.find((g) => t.x >= g.x && t.y >= g.y && t.x + t.width <= g.x + g.width && t.y + t.height <= g.y + g.height);
  if (!host) problems.push(`未落在任何 group 内：${t.text.slice(0, 18).replace(/\n/g, ' ')} @${t.x},${t.y}`);
}
for (const g of groups) {
  const inner = texts.filter((t) => t.x >= g.x && t.y >= g.y && t.x + t.width <= g.x + g.width && t.y + t.height <= g.y + g.height);
  for (let i = 0; i < inner.length; i++) for (let j = i + 1; j < inner.length; j++) {
    const a = inner[i], b = inner[j];
    const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    if (ix > 0 && iy > 0) problems.push(`组内重叠 [${g.label}] ${a.text.slice(0, 12).replace(/\n/g, ' ')} × ${b.text.slice(0, 12).replace(/\n/g, ' ')} ${ix}×${iy}`);
  }
}
// group 之间也不该重叠
for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) {
  const a = groups[i], b = groups[j];
  const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  if (ix > 0 && iy > 0) problems.push(`group 重叠 [${a.label}] × [${b.label}] ${ix}×${iy}`);
}

console.log(`写入 ${OUT}`);
console.log(`节点 ${back.nodes.length}（group ${groups.length} / text ${texts.length}）· 连线 ${back.edges.length}`);
console.log(`问题 ${problems.length}`);
problems.forEach((p) => console.log('  ' + p));
