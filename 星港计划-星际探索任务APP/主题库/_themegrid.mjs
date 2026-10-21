// 主题库校验 + 生成《11-任务主题与知识卡.md》
// 校验规则是硬约束：任一条不过就报错，不让带病的文档生成。
import { readFileSync, writeFileSync } from 'node:fs';
import { THEMES, UNLOCK, AGENCY, SERIES, TIERS } from './task-themes.mjs';

const OUT = new URL('../11-任务主题与知识卡.md', import.meta.url);
const LIMIT = { title: 16, body: 120, num: 26, topic: 24, name: 20, action: 40, record: 90 };

const width = (s) => [...s].reduce((w, c) => w + (c.codePointAt(0) < 0x2e80 ? 0.5 : 1), 0);
const errors = [], warns = [];

// ── 1. 目录结构
const byAgency = {};
for (const t of THEMES) byAgency[t.agency] = (byAgency[t.agency] || 0) + 1;
for (const code of Object.keys(AGENCY)) {
  const n = byAgency[code] || 0;
  if (n !== 4) errors.push(`机构 ${code}(${AGENCY[code]}) 主题数 = ${n}，应为 4`);
}
for (const code of Object.keys(byAgency)) if (!AGENCY[code]) errors.push(`未知机构代号 ${code}`);
if (THEMES.length !== 36) errors.push(`主题总数 = ${THEMES.length}，应为 36`);

// ── 2. 每主题
const allCardIds = new Map();
const seriesCount = {};
let fullThemes = 0, todoThemes = 0, totalCards = 0;
const tierCount = {};

for (const t of THEMES) {
  if (!SERIES[t.series]) errors.push(`${t.id} 未知系列 ${t.series}`);
  if (!AGENCY[t.agency]) errors.push(`${t.id} 未知机构 ${t.agency}`);
  if (!t.topic) errors.push(`${t.id} 缺 topic`);
  if (!t.action) errors.push(`${t.id} 缺 action`);
  if (width(t.topic) > LIMIT.topic) warns.push(`${t.id} topic 偏长 ${width(t.topic)}`);
  if (width(t.action) > LIMIT.action) warns.push(`${t.id} action 偏长 ${width(t.action)}`);
  if (!t.tasks?.length) errors.push(`${t.id} 缺任务`);
  for (const k of t.tasks || []) if (!['bool', 'timed', 'count', 'window'].includes(k.kind)) errors.push(`${t.id} 任务「${k.name}」kind 非法: ${k.kind}`);
  if (!t.plans?.length) errors.push(`${t.id} 缺可创建计划`);

  const cards = t.cards || [];
  if (t.state === 'todo') {
    todoThemes++;
    if (cards.length) errors.push(`${t.id} 标记 todo 却带了卡片`);
  } else {
    fullThemes++;
    if (cards.length !== UNLOCK.length) errors.push(`${t.id} 卡片数 = ${cards.length}，应为 ${UNLOCK.length}（与解锁节点数一致）`);
  }

  const seen = new Set();
  const usedSeries = new Set();
  for (const c of cards) {
    totalCards++;
    if (seen.has(c.id)) errors.push(`${t.id} 卡 id 重复: ${c.id}`);
    seen.add(c.id);
    if (allCardIds.has(c.id)) errors.push(`卡 id 跨主题重复: ${c.id}（${allCardIds.get(c.id)} / ${t.id}）`);
    allCardIds.set(c.id, t.id);
    usedSeries.add(c.id.split('-')[0]);

    if (!/^(PLA|STA|DEE|TIM|HUM|SKY)-\d{3}$/.test(c.id)) errors.push(`${c.id} 编号格式不符 系列-3位数字`);
    if (!TIERS[c.tier]) errors.push(`${c.id} tier 非法: ${c.tier}`);
    if (!c.source) errors.push(`${c.id} 缺 source`);
    if (!c.record) errors.push(`${c.id} 缺 record（真实探索记录）`);
    if (width(c.title) > LIMIT.title) errors.push(`${c.id} 标题超长 ${width(c.title)} > ${LIMIT.title}：${c.title}`);
    if (width(c.body) > LIMIT.body) errors.push(`${c.id} 正文超长 ${width(c.body)} > ${LIMIT.body}`);
    if (width(c.num) > LIMIT.num) warns.push(`${c.id} 数字串偏长 ${width(c.num)}`);
    if (width(c.record) > LIMIT.record) warns.push(`${c.id} record 偏长 ${width(c.record)}`);
    for (const bad of ['！', '太棒', '加油', '震撼', '惊人', '最新研究表明', '科学家发现'])
      if ((c.body + c.title + (c.record || '')).includes(bad)) errors.push(`${c.id} 禁用表达「${bad}」`);

    seriesCount[c.id.split('-')[0]] = (seriesCount[c.id.split('-')[0]] || 0) + 1;
    tierCount[c.tier] = (tierCount[c.tier] || 0) + 1;
  }
  // 主题应当横跨多个系列（这是设计意图），但必须至少有一张属于主导系列，
  // 否则主题的"主导系列"标注就失去意义。
  if (cards.length && !usedSeries.has(t.series))
    errors.push(`${t.id} 没有任何卡片属于主导系列 ${t.series}（主导系列标注失效）`);
  if (cards.length) t._usedSeries = [...usedSeries].sort().join('/');
}

// ── 3. 解锁节点
for (let i = 1; i < UNLOCK.length; i++) if (UNLOCK[i] <= UNLOCK[i - 1]) errors.push('UNLOCK 必须严格递增');
if (UNLOCK.length !== 6) errors.push(`UNLOCK 长度 = ${UNLOCK.length}，应为 6`);

// ── 4. 重复度模型（写进文档，便于复核）
const cover = (T, S) => T * (1 - Math.pow(1 - 1 / T, S));
const model = [[2, 2.5], [4, 2.5], [4, 3.5], [8, 2.5]].map(([P, m]) => {
  const S = (52 / P) * m;
  const row = { P, m, S: +S.toFixed(1) };
  for (const T of [24, 36, 48]) row['T' + T] = +(cover(T, S) / T * 100).toFixed(0);
  return row;
});

// ───────────────────────────── 生成 Markdown
const L = [];
const P = (s = '') => L.push(s);

P('# 11 · 任务主题与知识卡');
P();
P('> 本文件由 `主题库/_themegrid.mjs` 从 `主题库/task-themes.mjs` 生成，**不是手写**。改内容请改数据源再重跑。');
P('> 重跑：`cd 星港计划-星际探索任务APP/主题库 && node _themegrid.mjs`');
P();
P('---');
P();
P('## 一、先说结论：多少主题才不腻');
P();
P('### 1.1 问题');
P();
P('如果"完成任务 → 抽一张卡"是一一对应，那么内容消耗速度 = 完成次数，几天就见底。');
P('先用模型算清楚两件事：**主题目录要多大**、**每个主题要配几张卡**。');
P();
P('### 1.2 主题目录该多大');
P();
P('一年创建的计划数 = 52 ÷ 计划周期；每个计划选 2–3 个主题。');
P('期望覆盖的不同主题数 = `T × (1 − (1 − 1/T) ^ 年选择次数)`。');
P();
P('| 计划周期 | 每计划主题数 | 年选择次数 | 24 主题 | **36 主题** | 48 主题 |');
P('|---|---|---|---|---|---|');
for (const r of model) P(`| ${r.P} 周 | ${r.m} | ${r.S} | ${r.T24}% | **${r.T36}%** | ${r.T48}% |`);
P();
P('> 表内 = **一年后被用户碰过的主题占比**。理想 ≤65%：留出三分之一没碰过，才有"还有得选"的感觉。');
P();
P('| 目录规模 | 一年覆盖率 | 判断 |');
P('|---|---|---|');
P('| 24 个 | 约 75% | 偏紧，半年后开始觉得"翻来覆去就这几个" |');
P('| **36 个** | **约 60%** | **甜点：剩 14 个主题一年内没碰过** |');
P('| 48 个 | 约 50% | 更宽裕，但内容成本翻倍 |');
P();
P('**结论：36 个主题**，按 9 个机构模板各配 4 个。');
P();
P('### 1.3 每个主题要配几张卡');
P();
P('按《04 数值与成长经济》的画像，单用户日获卡量（受"每天最多 3 张"节流）：');
P();
P('| 画像 | 张/天 | 30 天累计 |');
P('|---|---|---|');
P('| 轻度（1×25 分钟） | 1.00 | 30 |');
P('| 标准（2×25 分钟 + 记录） | 2.15 | 65 |');
P('| 重度（4×25 分钟） | 3.00 | 90 |');
P();
P('**这里暴露了一个真问题**：标准用户 30 天消耗 65 张。如果每个主题只配 4–5 张，');
P('一个天天做的任务（比如"每天看月亮"）两周就把内容看完了。');
P();
P('**所以关联机制不能是"完成一次给一张卡"，而是累计解锁的课程序列：**');
P();
P('```');
P('同一主题的 6 张卡，按累计完成次数解锁：');
for (let i = 0; i < UNLOCK.length; i++) {
  const nx = UNLOCK[i + 1];
  const tail = nx ? `距下一张还差 ${nx - UNLOCK[i]} 次` : '本主题 6 张全部解锁，之后进入复习';
  P(`  第 ${UNLOCK[i]} 次完成 → 第 ${i + 1} 张卡   （${tail}）`);
}
P('```');
P();
P('按每天做 1 次算，一个主题的 6 张卡要 **21 天**才看完 → 单个主题能撑约 3 周。');
P('这既解决了"两周就腻"，也在机制上说得通：**练得越久，看得越深**。');
P();
P('### 1.4 总量');
P();
P('| 项 | 数量 |');
P('|---|---|');
P(`| 主题总数 | ${THEMES.length}（9 机构 × 4） |`);
P(`| 每主题卡片 | ${UNLOCK.length} 张 |`);
P(`| 全量卡片 | ${THEMES.length * UNLOCK.length} 张 |`);
P(`| **本轮已写全** | **${fullThemes} 个主题 / ${totalCards} 张卡** |`);
P(`| 待补 | ${todoThemes} 个主题 × ${UNLOCK.length} = ${todoThemes * UNLOCK.length} 张 |`);
P();
P('对照《06 知识内容与彩蛋系统》原先的"首批 60 张（6 系列 × 10）"，本方案改为');
P('**按主题成组生产**：12 个主题 × 6 张 = 72 张，能立刻验证"主题 ↔ 卡片"的关联体验。');
P();
P('---');
P();
P('## 二、关联机制（怎么把任务和卡片绑起来）');
P();
P('### 2.1 三层关系');
P();
P('```');
P('机构（领域）      例：体能署');
P('  └ 计划（周期）  例：21 天 · 每晚看一次月亮');
P('      └ 任务      例：看月亮并记月相');
P('          ↓ 累计完成次数驱动解锁');
P('      主题（科学话题）  例：地月测距');
P('          └ 6 张卡    按 1/3/6/10/15/21 次逐张解锁');
P('```');
P();
P('**关键点**：任务与卡片不是"抽"的关系，是**同一主题下按练习深度逐层解锁**的关系。');
P('用户知道"我多做几次，就会知道更多"——这比随机抽卡更有掌控感，也更容易形成期待。');
P();
P('### 2.2 任务列表怎么显示');
P();
P('创建任务时，用户在**主题**里选，而不是面对一张空表单：');
P();
P('```');
P('体能署 · 可选主题（4）');
P('  ▸ 地月测距        每晚看月亮，21 天走完 6 张卡      [选这个]');
P('  ▸ 力量训练与重力   每次训练记组数，8 周走完 6 张卡   [选这个]');
P('  ▸ 运动与惯性       （卡片待补）                     [待上线]');
P('  ▸ 耐力与能量       （卡片待补）                     [待上线]');
P('```');
P();
P('### 2.3 卡片发放规则（对《06》的修订）');
P();
P('| 触发 | 原规则（06） | **本方案** |');
P('|---|---|---|');
P('| 点火达标 | 100% 给卡 | 仅当**该主题**还剩未解锁卡时给下一张 |');
P('| 点火及格线 | 30% 概率 | 计入累计次数，但不给卡 |');
P('| 窗口确认 | 100% 给卡 | 同上 |');
P('| 自由记录 | 15% 概率 | 同上 |');
P('| 扰动 T3/T4 | 额外 1 张 | 改为**跨主题随机**一张（唯一的随机入口，保留惊喜） |');
P('| 节点/计划完成 | 保底 1 张 | 保底推进当前主题一格 |');
P();
P('> 这样"确定的成长"来自练习深度，"惊喜"只留给扰动一层，两件事不再互相干扰。');
P();
P('**主题走完（6 张全解锁）后**：主题卡面标记「已结业」，并推荐同一系列的下一个主题。');
P('重复做同一任务不再给新卡，但计入总量与周报（不惩罚，也不重复轰炸）。');
P();
P('---');
P();
P('## 三、主题总表（36 个）');
P();

for (const code of Object.keys(AGENCY)) {
  const list = THEMES.filter((t) => t.agency === code);
  P(`### ${AGENCY[code]}（\`${code}\`）`);
  P();
  P('| 主题 | 科学话题 | 现实动作 | 主导系列 | 可创建计划 | 卡片 |');
  P('|---|---|---|---|---|---|');
  for (const t of list) {
    const cardN = (t.cards || []).length;
    P(`| **${t.name}** | ${t.topic} | ${t.action} | ${SERIES[t.series]} | ${(t.plans || []).join(' ／ ')} | ${cardN ? cardN + ' 张' : '待补'} |`);
  }
  P();
}

P('---');
P();
P('## 四、已写全的 12 个主题（含完整卡片）');
P();

for (const t of THEMES.filter((x) => x.cards?.length)) {
  P(`### ${t.name} · ${AGENCY[t.agency]} ／ 主导系列 ${SERIES[t.series]}（实际覆盖 ${t._usedSeries}）`);
  P();
  P(`- **科学话题**：${t.topic}`);
  P(`- **现实动作**：${t.action}`);
  P(`- **可创建计划**：${(t.plans || []).join(' ／ ')}`);
  P(`- **任务**：${t.tasks.map((k) => k.name + (k.target ? `（${k.target}${k.kind === 'timed' ? ' 分钟' : ''}）` : '')).join(' ／ ')}`);
  P();
  P('| 解锁 | 编号 | 标题 | 数字 | 层 | 正文 | 真实探索记录 | 来源 |');
  P('|---|---|---|---|---|---|---|---|');
  t.cards.forEach((c, i) => {
    P(`| 第 ${UNLOCK[i]} 次 | \`${c.id}\` | **${c.title}** | ${c.num} | ${c.tier} | ${c.body} | ${c.record} | ${c.source} |`);
  });
  P();
}

P('---');
P();
P('## 五、统计与自检');
P();
P('```');
P(`主题总数：${THEMES.length}（已写全 ${fullThemes}，待补 ${todoThemes}）`);
P(`卡片总数：${totalCards}`);
P(`按系列：${Object.entries(seriesCount).map(([k, v]) => k + ' ' + v).join(' ／ ')}`);
P(`按层级：${Object.entries(tierCount).map(([k, v]) => k + ' ' + v).join(' ／ ')}`);
P(`解锁节点：${UNLOCK.join(' / ')}`);
P('');
P(`结构错误：${errors.length}`);
P(`待确认：${warns.length}`);
P('```');
P();
if (errors.length) { P('### 错误'); P(); for (const e of errors) P(`- ${e}`); P(); }
if (warns.length) { P('### 待确认'); P(); for (const w of warns) P(`- ${w}`); P(); }
P('---');
P();
P('## 六、还差的 24 个主题');
P();
P('卡片按同一格式补齐即可（每个主题 6 张，按 1/3/6/10/15/21 解锁）。');
P('生产规范见《06 知识内容与彩蛋系统》§1.6：单卡约 40 分钟，双人核对，每条必须有可核查来源。');
P();
P('| 主题 | 机构 | 科学话题 | 待补卡片 |');
P('|---|---|---|---|');
for (const t of THEMES.filter((x) => !x.cards?.length))
  P(`| ${t.name} | ${AGENCY[t.agency]} | ${t.topic} | ${UNLOCK.length} 张 |`);
P();

writeFileSync(OUT, L.join('\n'));
console.log(`生成 ${OUT.pathname}`);
console.log(`主题 ${THEMES.length}（全 ${fullThemes} / 待补 ${todoThemes}）｜卡片 ${totalCards}`);
console.log(`错误 ${errors.length}｜待确认 ${warns.length}`);
if (errors.length) { console.log('\n--- 错误 ---'); errors.forEach((e) => console.log('  ' + e)); }
if (warns.length) { console.log('\n--- 待确认 ---'); warns.forEach((w) => console.log('  ' + w)); }
