// 生成「同一套 iPhone 390 线框模板」的第二个文件版本：纯 JSON 直写 .figcraft
// 目的：与 MCP 建节点版本对照 —— 同一设计意图，两条生成路径，便于挑更可靠的一条。
import { FigDoc, rgb } from './figdoc.mjs';
import * as W from './wk.mjs';

const OUT = 'F:\\deepseek\\作业\\figcraft_mcp\\out\\iphone390';
const G = W.G, FS = W.FS, R = W.R, PAD_H = W.PAD_H, CONTENT_W = W.CONTENT_W, SW = W.SCREEN_W, SH = W.SCREEN_H;

// 渲染变体：
//   A = plain   基准，与 MCP 版 1:1 同构
//   B = hover   悬停/选中态强化（MCP 版只有「图标变实心 + 描边」，这里加整块底面与 2px 环）
//   C = variant 抽屉式替代布局（列表 → 大卡、柱状 → 圆点刻度、设置 → 分组抽屉）
const MODE = process.argv[2] || 'A';
const FILE = { A: 'iphone390-wireframe-A.figcraft', B: 'iphone390-wireframe-B.figcraft', C: 'iphone390-wireframe-C.figcraft' }[MODE];
const TITLE = {
  A: 'A · 基准（与 MCP 版同构）',
  B: 'B · 悬停与选中态强化',
  C: 'C · 抽屉式替代布局',
}[MODE];
const doc = new FigDoc(`LEVEL · iPhone 390 线框 · ${TITLE}`, MODE);
const page = doc.newPage(TITLE, G.canvas);
const pageY = { A: 0, B: 900, C: 1800 }[MODE];   // 合并进一个文件时三页各占一段高度

function screen(name, x, y, { status = true } = {}) {
  const f = doc._add({ id: doc._id(), name, type: 'frame', parent: page.id, width: SW, height: SH, transform: [1, 0, 0, 1, x, y], fills: [{ type: 'solid', color: rgb(G.surface) }] });
  const c = new W.Canvas(doc, f);
  if (status) W.statusBar(doc, c);
  W.homeBar(doc, c);
  return c;
}
const COLW = SW + 40, ROWH = SH + 40;
const mk = (i) => ({ x: (i % 4) * COLW, y: pageY + Math.floor(i / 4) * ROWH });

/** B：当前项胶囊底（TabBar 用） */
function tabPill(c, active, items = 4) {
  const cw = Math.floor(SW / items);
  c.rect({ name: 'tab pill', x: active * cw + Math.round((cw - 48) / 2), y: SH - 34 - 49 + 3, w: 48, h: 28, r: 14, fill: G.ph2 });
}

// ── 01 今日
{
  const { x, y } = mk(0);
  const c = screen('01 · 今日', x, y);
  let cy = W.largeHeader(doc, c, { kicker: '10月19日 周一 · 第 3 周', title: '今日', action: '编辑' });
  cy += 2;
  c.rect({ name: 'Lv card', x: PAD_H, y: cy, w: CONTENT_W, h: 84, r: R.md, stroke: G.line });
  W.levelRing(doc, c, { x: PAD_H + 14, y: cy + 14, s: 56, value: '07', label: 'Lv' });
  c.text({ name: 'lv1', x: PAD_H + 84, y: cy + 16, w: CONTENT_W - 98, text: '距离 Lv.08 还差 180 XP', size: FS.sub, color: G.ink2 });
  W.progress(doc, c, { x: PAD_H + 84, y: cy + 42, w: CONTENT_W - 98, v: 0.64 });
  c.text({ name: 'lv2', x: PAD_H + 84, y: cy + 56, w: CONTENT_W - 98, text: '连续 12 天 · 本周完成 18 次', size: FS.cap, color: G.ink3 });
  cy += 84 + 18;
  W.sectionHead(doc, c, { y: cy, title: '今日任务 · 3 / 5', action: '全部' });
  cy += 26;
  const tasks = [['晨跑 20 分钟', '运动 · 07:30', '+30', false], ['背 30 个单词', '学习 · 已完成 09:12', '+20', true], ['英语听力 15 分钟', '每天 20:00 提醒', '+25', false]];
  for (const [i, [t, s, xp, d]] of tasks.entries()) {
    if (MODE === 'C') {
      // C：大卡 + 左侧时间轴（每卡 96 高，轴上 12px 圆点 + 竖线）
      const hh = 96;
      c.rect({ name: 'tl line', x: PAD_H + 11, y: cy - 4, w: 2, h: hh - 8, fill: G.line });
      c.rect({ name: 'tl dot', x: PAD_H + 6, y: cy + 18, w: 12, h: 12, r: 6, fill: d ? G.ph2 : G.ink1 });
      c.rect({ name: 'big card', x: PAD_H + 28, y: cy, w: CONTENT_W - 28, h: hh - 12, r: R.md, stroke: G.line });
      c.text({ name: 'bc time', x: PAD_H + 42, y: cy + 14, w: 80, text: ['07:30', '09:12', '20:00'][i], size: FS.cap, color: G.ink3 });
      c.text({ name: 'bc title', x: PAD_H + 42, y: cy + 32, w: CONTENT_W - 130, text: t, size: FS.body, color: d ? G.ink3 : G.ink1 });
      c.text({ name: 'bc sub', x: PAD_H + 42, y: cy + 56, w: CONTENT_W - 130, text: s, size: FS.cap, color: G.ink3 });
      c.text({ name: 'bc xp', x: PAD_H + CONTENT_W - 88, y: cy + 32, w: 60, text: xp, size: FS.body, color: G.ink2, align: 'right' });
      if (!d) W.progress(doc, c, { x: PAD_H + 42, y: cy + 74, w: CONTENT_W - 88, v: 0.5, h: 4 });
      cy += hh;
      continue;
    }
    if (MODE === 'B' && i === 0) c.rect({ name: 'hover bg', x: PAD_H - 2, y: cy - 2, w: CONTENT_W + 4, h: 80, r: R.md + 2, fill: G.canvas });
    W.taskCard(doc, c, { y: cy, title: t, sub: s, xp, done: d });
    if (MODE === 'B' && i === 0) c.rect({ name: 'hover ring', x: PAD_H, y: cy, w: CONTENT_W, h: 76, r: R.md, stroke: G.ink2, sw: 2 });
    cy += 84;
  }
  c.rect({ name: 'soul box', x: PAD_H, y: cy, w: CONTENT_W, h: 72, r: R.md, stroke: G.edge, dashes: [5, 4] });
  c.text({ name: 'soul1', x: PAD_H + 14, y: cy + 12, w: 200, text: '魂火挑战 · 进行中', size: FS.body });
  c.text({ name: 'soul2', x: PAD_H + 14, y: cy + 34, w: 200, text: '暂存 120 · 2 / 3 已打卡', size: FS.sub, color: G.ink3 });
  c.text({ name: 'soul3', x: PAD_H + CONTENT_W - 94, y: cy + 22, w: 80, text: '去结算', size: FS.sub, color: G.ink2, align: 'right' });
  W.progress(doc, c, { x: PAD_H + 14, y: cy + 56, w: CONTENT_W - 28, v: 0.66, dashedFill: true });
  cy += 72 + 10;
  W.button(doc, c, { y: cy, label: '快速打卡', sub: '记录一次已完成的行动' });
  if (MODE === 'B') tabPill(c, 0);
  W.tabBar(doc, c, { active: 0 });
}

// ── 02 任务详情
{
  const { x, y } = mk(1);
  const c = screen('02 · 任务详情', x, y);
  let cy = W.navBar(doc, c, { title: '英语听力', y: 59, right: '编辑' });
  cy += 18;
  c.text({ name: 'd0', x: PAD_H, y: cy, w: CONTENT_W, text: '英语听力 · 15 分钟', size: FS.display });
  cy += 40;
  c.rect({ name: 'wk card', x: PAD_H, y: cy, w: CONTENT_W, h: 96, r: R.md, stroke: G.line });
  c.text({ name: 'wk1', x: PAD_H + 14, y: cy + 14, w: 200, text: '本周进度', size: FS.sub, color: G.ink3 });
  c.text({ name: 'wk2', x: PAD_H + CONTENT_W - 110, y: cy + 12, w: 96, text: '4 / 7 天', size: FS.body, align: 'right' });
  W.progress(doc, c, { x: PAD_H + 14, y: cy + 42, w: CONTENT_W - 28, v: 4 / 7 });
  W.dots(doc, c, { x: PAD_H + 14, y: cy + 62, n: 7, filled: 4 });
  cy += 96 + 20;
  const kv = [['执行频率', '每天 1 次'], ['提醒时间', '20:00'], ['关联目标', '四级听力 6.5'], ['累计经验', '1,240 XP']];
  c.rect({ name: 'meta card', x: PAD_H, y: cy, w: CONTENT_W, h: kv.length * 44 + 8, r: R.md, stroke: G.line });
  for (let i = 0; i < kv.length; i++) W.kvRow(doc, c, { x: PAD_H + 14, y: cy + 4 + i * 44, w: CONTENT_W - 28, k: kv[i][0], v: kv[i][1], h: 44, rule: i < kv.length - 1 });
  cy += kv.length * 44 + 8 + 18;
  W.sectionHead(doc, c, { y: cy, title: '最近记录', action: '全部' });
  cy += 28;
  const recs = [['10/18 20:12', '+25 XP'], ['10/17 20:05', '+25 XP']];
  c.rect({ name: 'rec card', x: PAD_H, y: cy, w: CONTENT_W, h: recs.length * 44 + 8, r: R.md, stroke: G.line });
  for (let i = 0; i < recs.length; i++) W.kvRow(doc, c, { x: PAD_H + 14, y: cy + 4 + i * 44, w: CONTENT_W - 28, k: recs[i][0], v: recs[i][1], h: 44, rule: i < recs.length - 1 });
  const by = SH - 34 - 64;
  c.rect({ name: 'bottom rule', x: 0, y: by - 1, w: SW, h: 1, fill: G.line });
  W.button(doc, c, { y: by + 10, label: '标记完成 · +25 XP' });
}

// ── 03 快速打卡
{
  const { x, y } = mk(2);
  const c = screen('03 · 快速打卡', x, y);
  let cy = W.largeHeader(doc, c, { kicker: '10月19日 周一', title: '今日', action: '编辑' });
  cy += 2;
  W.sectionHead(doc, c, { y: cy, title: '今日任务 · 3 / 5', action: '全部' });
  cy += 26;
  for (const [t, s, xp, d] of [['晨跑 20 分钟', '运动 · 07:30', '+30', false], ['背 30 个单词', '学习 · 已完成', '+20', true], ['英语听力 15 分钟', '每天 20:00 提醒', '+25', false]]) {
    W.taskCard(doc, c, { y: cy, title: t, sub: s, xp, done: d });
    cy += 84;
  }
  const sheetY = 466;
  let sy = W.sheet(doc, c, { y: sheetY, h: SH - sheetY });
  c.text({ name: 's1', x: PAD_H, y: sy, w: CONTENT_W, text: '记录行动', size: FS.title });
  sy += 32;
  c.text({ name: 's2', x: PAD_H, y: sy, w: CONTENT_W, text: '完成即入账，不需要二次录入', size: FS.sub, color: G.ink3 });
  sy += 26;
  W.row(doc, c, { x: 0, y: sy, w: SW, label: '晨跑 20 分钟', sub: '运动 · 预计 +30 XP', selected: true, accent: true });
  W.row(doc, c, { x: 0, y: sy + 60, w: SW, label: '英语听力 15 分钟', sub: '学习 · 预计 +25 XP' });
  W.row(doc, c, { x: 0, y: sy + 120, w: SW, label: '自定义记录', sub: '写点什么，自动换算经验', rule: false });
  sy += 196;
  W.button(doc, c, { y: sy, label: '确认完成' });
  c.text({ name: 's3', x: PAD_H, y: sy + 62, w: CONTENT_W, text: '取消', size: FS.sub, color: G.ink3, align: 'center' });
}

// ── 04 目标列表
{
  const { x, y } = mk(3);
  const c = screen('04 · 目标列表', x, y);
  let cy = W.navBar(doc, c, { title: '目标', y: 59, back: false, right: '新建' });
  cy += 14;
  let cxp = PAD_H;
  for (const [i, t] of ['全部', '学习', '运动', '护肤', '早睡'].entries()) {
    const r = W.chip(doc, c, { x: cxp, y: cy, label: t, on: i === 0 });
    cxp += r.w + 8;
  }
  cy += 46;
  const goals = [['四级听力 6.5', '每天 1 次 · 已坚持 12 天', 0.62, '进行中'], ['每周三次力量训练', '每周 3 次 · 休息日可调', 0.34, '进行中'], ['23:30 前睡觉', '每天 · 已暂停', 0.12, '已暂停']];
  for (const [t, s, v, tag] of goals) {
    c.rect({ name: 'goal card', x: PAD_H, y: cy, w: CONTENT_W, h: 116, r: R.md, stroke: G.line });
    c.text({ name: 'g', x: PAD_H + 14, y: cy + 14, w: CONTENT_W - 130, text: t, size: FS.body });
    c.text({ name: 'gs', x: PAD_H + 14, y: cy + 38, w: CONTENT_W - 130, text: s, size: FS.sub, color: G.ink3 });
    const tw = tag.length * 13 + 18;
    c.rect({ name: 'gt bg', x: PAD_H + CONTENT_W - 14 - tw, y: cy + 13, w: tw, h: 24, r: R.sm, stroke: G.line });
    c.text({ name: 'gt', x: PAD_H + CONTENT_W - 14 - tw, y: cy + 18, w: tw, text: tag, size: FS.cap, color: G.ink2, align: 'center' });
    W.progress(doc, c, { x: PAD_H + 14, y: cy + 72, w: CONTENT_W - 28, v });
    c.text({ name: 'gp', x: PAD_H + 14, y: cy + 86, w: CONTENT_W - 28, text: '阶段进度 ' + Math.round(v * 100) + '%', size: FS.cap, color: G.ink3 });
    cy += 128;
  }
  c.rect({ name: 'new slot', x: PAD_H, y: cy + 6, w: CONTENT_W, h: 64, r: R.md, stroke: G.edge, dashes: [5, 4] });
  c.text({ name: 'new', x: PAD_H, y: cy + 28, w: CONTENT_W, text: '+  新建目标', size: FS.body, color: G.ink3, align: 'center' });
  if (MODE === 'B') tabPill(c, 1);
  W.tabBar(doc, c, { active: 1 });
}

// ── 05 目标创建
{
  const { x, y } = mk(4);
  const c = screen('05 · 目标创建', x, y);
  let cy = W.navBar(doc, c, { title: '新建目标', y: 59, right: '保存' });
  cy += 24;
  W.field(doc, c, { y: cy, label: '目标名称', value: '每周三次力量训练' });
  cy += 52 + 44;
  c.text({ name: 'f1', x: PAD_H, y: cy, w: CONTENT_W, text: '执行频率', size: FS.sub, color: G.ink3 });
  cy += 22;
  W.segmented(doc, c, { y: cy, items: ['每天', '每周', '自定义'], active: 1 });
  cy += 40;
  W.kvRow(doc, c, { y: cy, k: '每周次数', v: '' });
  W.stepper(doc, c, { x: PAD_H + CONTENT_W - 104, y: cy + 9 });
  cy += 52;
  W.kvRow(doc, c, { y: cy, k: '休息日', v: '周日' });
  W.kvRow(doc, c, { y: cy + 52, k: '提醒时间', v: '19:30' });
  cy += 104 + 26;
  c.rect({ name: 'risk box', x: PAD_H, y: cy, w: CONTENT_W, h: 232, r: R.md, stroke: G.edge, dashes: [5, 4] });
  c.text({ name: 'r1', x: PAD_H + 14, y: cy + 14, w: 240, text: '魂火挑战（可选）', size: FS.body });
  c.text({ name: 'r2', x: PAD_H + 14, y: cy + 40, w: CONTENT_W - 28, text: '开启后漏打卡会让尚未结算的魂火失落；真实记录与永久成长不会被抹除。', size: FS.cap, color: G.ink3, lh: 17 });
  W.kvRow(doc, c, { x: PAD_H + 14, y: cy + 84, w: CONTENT_W - 28, k: '开启魂火', v: '' });
  W.toggle(doc, c, { x: PAD_H + CONTENT_W - 14 - 51, y: cy + 89, on: true });
  c.text({ name: 'r3', x: PAD_H + 14, y: cy + 142, w: 200, text: '风险强度', size: FS.body, color: G.ink2 });
  W.slider(doc, c, { x: PAD_H + 14, y: cy + 168, w: CONTENT_W - 28, v: 0.6, left: '低', right: '高' });
  cy += 232 + 22;
  W.button(doc, c, { y: cy, label: '创建目标' });
}

// ── 06 成长
{
  const { x, y } = mk(5);
  const c = screen('06 · 成长', x, y);
  let cy = W.navBar(doc, c, { title: '成长', y: 59, back: false, right: '分享' });
  cy += 14;
  W.segmented(doc, c, { y: cy, items: ['日', '周', '月'], active: 1 });
  cy += 46;
  c.rect({ name: 'Lv card', x: PAD_H, y: cy, w: CONTENT_W, h: 148, r: R.md, stroke: G.line });
  W.levelRing(doc, c, { x: PAD_H + 16, y: cy + 24, s: 96, value: '07', label: 'Lv' });
  c.text({ name: 'e1', x: PAD_H + 128, y: cy + 32, w: CONTENT_W - 144, text: '2,820 / 4,400 XP', size: FS.body });
  W.progress(doc, c, { x: PAD_H + 128, y: cy + 58, w: CONTENT_W - 144, v: 0.64 });
  c.text({ name: 'e2', x: PAD_H + 128, y: cy + 74, w: CONTENT_W - 144, text: '再完成 4 次打卡即可升级', size: FS.cap, color: G.ink3 });
  c.text({ name: 'e3', x: PAD_H + 128, y: cy + 98, w: CONTENT_W - 144, text: '本周 +640 XP · 上周 +520 XP', size: FS.cap, color: G.ink3 });
  cy += 148 + 24;
  W.sectionHead(doc, c, { y: cy, title: '近 7 天完成次数', action: '详情' });
  cy += 28;
  c.rect({ name: 'bars card', x: PAD_H, y: cy, w: CONTENT_W, h: 136, r: R.md, stroke: G.line });
  if (MODE === 'C') {
    // C：环形刻度（7 段圆弧用 7 个短横条近似）+ 中心本周合计
    for (let i = 0; i < 14; i++) {
      const ang = (Math.PI * 2 * i) / 14 - Math.PI / 2;
      const on = i < 9;
      c.rect({ name: 'ring tick ' + i, x: Math.round(PAD_H + 14 + 46 + Math.cos(ang) * 40) - 2, y: Math.round(cy + 18 + 46 + Math.sin(ang) * 40) - 6, w: 4, h: 12, r: 2, fill: on ? G.ink1 : G.ph2 });
    }
    c.text({ name: 'ring v', x: PAD_H + 14, y: cy + 44, w: 92, text: '18', size: 24, align: 'center' });
    c.text({ name: 'ring l', x: PAD_H + 14, y: cy + 74, w: 92, text: '本周完成', size: FS.cap, color: G.ink3, align: 'center' });
    const rows2 = [['周一', 3], ['周二', 4], ['周三', 2]];
    for (let i = 0; i < rows2.length; i++) {
      const ry = cy + 22 + i * 32;
      c.text({ name: 'rk' + i, x: PAD_H + 124, y: ry, w: 60, text: rows2[i][0], size: FS.cap, color: G.ink3 });
      W.progress(doc, c, { x: PAD_H + 186, y: ry + 6, w: 90, v: rows2[i][1] / 5, h: 6 });
      c.text({ name: 'rv' + i, x: PAD_H + 284, y: ry, w: 40, text: rows2[i][1] + '', size: FS.cap, align: 'right' });
    }
  } else {
    W.bars(doc, c, { x: PAD_H + 14, y: cy + 20, w: CONTENT_W - 28, h: 72 });
    const bw = Math.floor((CONTENT_W - 28 - 48) / 7);
    for (let i = 0; i < 7; i++) c.text({ name: 'dx' + i, x: PAD_H + 14 + i * (bw + 8), y: cy + 100, w: bw, text: ['一', '二', '三', '四', '五', '六', '日'][i], size: FS.cap, color: G.ink3, align: 'center' });
  }
  cy += 136 + 24;
  W.sectionHead(doc, c, { y: cy, title: '阶段成就', action: '全部' });
  cy += 28;
  const medals = [['连续 7 天', 'on'], ['专注 10 小时', 'on'], ['完成 Boss', 'on'], ['连续 30 天', 'locked']];
  for (let i = 0; i < medals.length; i++) {
    const mx = PAD_H + i * 90;
    W.medal(doc, c, { x: mx, y: cy, tone: medals[i][1] });
    c.text({ name: 'mn' + i, x: mx - 7, y: cy + 82, w: 86, text: medals[i][0], size: FS.cap, color: G.ink3, align: 'center' });
  }
  cy += 108;
  c.rect({ name: 'bonfire box', x: PAD_H, y: cy, w: CONTENT_W, h: 76, r: R.md, stroke: G.edge, dashes: [5, 4] });
  c.text({ name: 'b1', x: PAD_H + 14, y: cy + 14, w: 200, text: '篝火结算', size: FS.body });
  c.text({ name: 'b2', x: PAD_H + 14, y: cy + 38, w: 240, text: '本轮暂存 120 魂火 · 距结算 2 天', size: FS.cap, color: G.ink3 });
  c.text({ name: 'b3', x: PAD_H + CONTENT_W - 94, y: cy + 28, w: 80, text: '去结算', size: FS.sub, color: G.ink2, align: 'right' });
  if (MODE === 'B') tabPill(c, 2);
  W.tabBar(doc, c, { active: 2 });
}

// ── 07 篝火结算
{
  const { x, y } = mk(6);
  const c = screen('07 · 篝火结算', x, y);
  let cy = W.navBar(doc, c, { title: '篝火结算', y: 59, right: '规则' });
  cy += 20;
  c.text({ name: 'c1', x: PAD_H, y: cy, w: CONTENT_W, text: '点亮篝火，把暂存变成成长', size: FS.title });
  cy += 32;
  c.text({ name: 'c2', x: PAD_H, y: cy, w: CONTENT_W, text: '结算后魂火转为永久经验，失败风险随之清零。', size: FS.sub, color: G.ink3 });
  cy += 34;
  c.rect({ name: 'soul card', x: PAD_H, y: cy, w: CONTENT_W, h: 156, r: R.md, stroke: G.line });
  W.flame(doc, c, { x: PAD_H + 16, y: cy + 20, s: 28 });
  c.text({ name: 'c3', x: PAD_H + 58, y: cy + 20, w: 200, text: '暂存魂火', size: FS.sub, color: G.ink3 });
  c.text({ name: 'c4', x: PAD_H + 58, y: cy + 40, w: 200, text: '120', size: 30 });
  c.rect({ name: 'c rule', x: PAD_H + 14, y: cy + 96, w: CONTENT_W - 28, h: 1, fill: G.line });
  c.text({ name: 'c5', x: PAD_H + 14, y: cy + 108, w: 200, text: '本周完成 6 / 7 天', size: FS.sub, color: G.ink2 });
  c.text({ name: 'c6', x: PAD_H + CONTENT_W - 130, y: cy + 108, w: 116, text: '可结算 +120 XP', size: FS.sub, align: 'right' });
  W.progress(doc, c, { x: PAD_H + 14, y: cy + 134, w: CONTENT_W - 28, v: 6 / 7, dashedFill: true });
  cy += 156 + 24;
  const opts = [['立即结算', '转为永久经验 · 风险清零', true], ['继续挑战', '保留魂火，风险继续累积', false], ['放弃本轮', '魂火失落，行动记录保留', false]];
  for (const [t, s, on] of opts) {
    c.rect({ name: 'opt card', x: PAD_H, y: cy, w: CONTENT_W, h: 60, r: R.md, fill: on ? G.canvas : G.surface, stroke: on ? null : G.line });
    if (on) c.rect({ name: 'opt accent', x: PAD_H, y: cy + 10, w: 3, h: 40, r: 2, fill: G.ink1 });
    c.text({ name: 'o1', x: PAD_H + 16, y: cy + 12, w: 240, text: t, size: FS.body });
    c.text({ name: 'o2', x: PAD_H + 16, y: cy + 34, w: 280, text: s, size: FS.cap, color: G.ink3 });
    if (on) W.radio(doc, c, { x: PAD_H + CONTENT_W - 36, y: cy + 19, on: true });
    cy += 72;
  }
  cy += 4;
  c.rect({ name: 'base line', x: PAD_H, y: cy, w: CONTENT_W, h: 76, r: R.md, stroke: G.edge, dashes: [5, 4] });
  c.text({ name: 'c7', x: PAD_H + 14, y: cy + 14, w: CONTENT_W - 28, text: '底线：等级与历史记录永不回退', size: FS.sub });
  c.text({ name: 'c8', x: PAD_H + 14, y: cy + 38, w: CONTENT_W - 28, text: '只会失去尚未结算的挑战奖励。', size: FS.cap, color: G.ink3 });
  cy += 76 + 24;
  W.button(doc, c, { y: cy, label: '点亮篝火', sub: '+120 XP' });
}

// ── 08 我的
{
  const { x, y } = mk(7);
  const c = screen('08 · 我的', x, y);
  let cy = W.navBar(doc, c, { title: '我的', y: 59, back: false, right: '设置' });
  cy += 18;
  c.rect({ name: 'avatar', x: PAD_H, y: cy, w: 64, h: 64, r: R.pill_, fill: G.ph });
  c.text({ name: 'm1', x: PAD_H + 80, y: cy + 10, w: 240, text: '同学 A', size: FS.title });
  c.text({ name: 'm2', x: PAD_H + 80, y: cy + 40, w: 250, text: 'Lv.07 · 累计 68 次真实行动', size: FS.sub, color: G.ink3 });
  cy += 64 + 24;
  c.rect({ name: 'stats card', x: PAD_H, y: cy, w: CONTENT_W, h: 84, r: R.md, stroke: G.line });
  const stats = [['68', '行动'], ['12', '连续天数'], ['6', '徽记']];
  const cw3 = Math.floor(CONTENT_W / 3);
  for (let i = 0; i < 3; i++) {
    c.text({ name: 'st' + i, x: PAD_H + cw3 * i, y: cy + 18, w: cw3, text: stats[i][0], size: 22, align: 'center' });
    c.text({ name: 'sl' + i, x: PAD_H + cw3 * i, y: cy + 50, w: cw3, text: stats[i][1], size: FS.cap, color: G.ink3, align: 'center' });
    if (i) c.rect({ name: 'vd' + i, x: PAD_H + cw3 * i, y: cy + 18, w: 1, h: 48, fill: G.line });
  }
  cy += 84 + 24;
  const items = [['激励强度', '适中'], ['提醒与反馈', ''], ['休息日与暂停', ''], ['数据与隐私', ''], ['关于 LEVEL', 'v1.0']];
  c.rect({ name: 'list card', x: PAD_H, y: cy, w: CONTENT_W, h: items.length * 56, r: R.md, stroke: G.line });
  for (let i = 0; i < items.length; i++) {
    W.row(doc, c, { x: PAD_H, y: cy + i * 56, w: CONTENT_W, h: 56, hasIcon: false, label: items[i][0], trailing: items[i][1] ? 'value' : 'chev', value: items[i][1], rule: i < items.length - 1 });
  }
  cy += items.length * 56 + 22;
  W.button(doc, c, { y: cy, label: '开启高风险模式', state: 'risk' });
  if (MODE === 'B') tabPill(c, 3);
  W.tabBar(doc, c, { active: 3 });
}

// ── 09 设置
{
  const { x, y } = mk(8);
  const c = screen('09 · 设置', x, y);
  let cy = W.navBar(doc, c, { title: '设置', y: 59, right: '完成' });
  cy += 18;
  const g1 = [['提醒通知', true], ['每日总结', false]];
  c.rect({ name: 'g1 card', x: PAD_H, y: cy, w: CONTENT_W, h: g1.length * 56 + 30, r: R.md, stroke: G.line });
  c.text({ name: 't1', x: PAD_H + 14, y: cy + 12, w: CONTENT_W - 28, text: '反馈', size: FS.cap, color: G.ink3 });
  for (let i = 0; i < g1.length; i++) {
    W.kvRow(doc, c, { x: PAD_H + 14, y: cy + 34 + i * 56, w: CONTENT_W - 28, k: g1[i][0], v: '', h: 56, rule: i < g1.length - 1 });
    W.toggle(doc, c, { x: PAD_H + CONTENT_W - 14 - 51, y: cy + 34 + i * 56 + 12, on: g1[i][1] });
  }
  cy += g1.length * 56 + 30 + 16;
  c.rect({ name: 'g2 card', x: PAD_H, y: cy, w: CONTENT_W, h: 152, r: R.md, stroke: G.line });
  c.text({ name: 't2', x: PAD_H + 14, y: cy + 12, w: CONTENT_W - 28, text: '激励强度', size: FS.cap, color: G.ink3 });
  c.text({ name: 't3', x: PAD_H + 14, y: cy + 36, w: CONTENT_W - 28, text: '温和 ←→ 强反馈', size: FS.body });
  W.slider(doc, c, { x: PAD_H + 14, y: cy + 62, w: CONTENT_W - 28, v: 0.45, left: '温和', right: '强反馈' });
  c.text({ name: 't4', x: PAD_H + 14, y: cy + 122, w: CONTENT_W - 28, text: '强反馈会加入更多阶段挑战与风险提示', size: FS.cap, color: G.ink3 });
  cy += 152 + 16;
  const g3 = [['休息日与暂停', '周日'], ['数据与隐私', ''], ['账号与同步', ''], ['清除本地缓存', '12.4 MB']];
  c.rect({ name: 'g3 card', x: PAD_H, y: cy, w: CONTENT_W, h: g3.length * 52, r: R.md, stroke: G.line });
  for (let i = 0; i < g3.length; i++) W.kvRow(doc, c, { x: PAD_H + 14, y: cy + i * 52, w: CONTENT_W - 28, k: g3[i][0], v: g3[i][1], rule: i < g3.length - 1 });
  cy += g3.length * 52 + 22;
  c.text({ name: 't5', x: PAD_H, y: cy, w: CONTENT_W, text: 'LEVEL v1.0 · 本机离线可用', size: FS.cap, color: G.ink3, align: 'center' });
}

// ── 10 成长记录
{
  const { x, y } = mk(9);
  const c = screen('10 · 成长记录', x, y);
  let cy = W.navBar(doc, c, { title: '成长记录', y: 59, right: '导出' });
  cy += 14;
  W.segmented(doc, c, { y: cy, items: ['周', '月', '季'], active: 1 });
  cy += 46;
  c.rect({ name: 'trend card', x: PAD_H, y: cy, w: CONTENT_W, h: 152, r: R.md, stroke: G.line });
  c.text({ name: 'h1', x: PAD_H + 14, y: cy + 14, w: 200, text: '本月趋势', size: FS.sub, color: G.ink3 });
  c.text({ name: 'h2', x: PAD_H + CONTENT_W - 140, y: cy + 12, w: 126, text: '+18% vs 上月', size: FS.sub, color: G.ink2, align: 'right' });
  W.bars(doc, c, { x: PAD_H + 14, y: cy + 42, w: CONTENT_W - 28, h: 72, vals: [0.4, 0.55, 0.5, 0.7, 0.62, 0.85, 0.95] });
  c.text({ name: 'h3', x: PAD_H + 14, y: cy + 122, w: CONTENT_W - 28, text: '实心柱 = 本周 · 其余为历史周', size: FS.cap, color: G.ink3 });
  cy += 152 + 24;
  W.sectionHead(doc, c, { y: cy, title: '明细', action: '筛选' });
  cy += 30;
  W.tableRow(doc, c, { x: PAD_H, y: cy, w: CONTENT_W, cells: ['日期', '完成', '经验'], head: true });
  const rows = [['10/19', '3 / 5', '+85'], ['10/18', '5 / 5', '+120'], ['10/17', '4 / 5', '+95'], ['10/16', '2 / 5', '+40'], ['10/15', '5 / 5', '+125']];
  if (MODE === 'C') {
    // C：两列小卡（每卡 54 高），比三列表格更像"记录墙"
    const cw2 = Math.floor((CONTENT_W - 10) / 2);
    for (let i = 0; i < rows.length; i++) {
      const col = i % 2, row2 = Math.floor(i / 2);
      const gx = PAD_H + col * (cw2 + 10), gy = cy + 44 + row2 * 62;
      c.rect({ name: 'rec cell', x: gx, y: gy, w: cw2, h: 54, r: R.sm, stroke: G.line });
      c.text({ name: 'rc d' + i, x: gx + 10, y: gy + 8, w: cw2 - 20, text: rows[i][0], size: FS.cap, color: G.ink3 });
      c.text({ name: 'rc v' + i, x: gx + 10, y: gy + 26, w: cw2 - 20, text: rows[i][1] + '  ' + rows[i][2], size: FS.sub });
    }
    cy += 44 + Math.ceil(rows.length / 2) * 62 + 4;
  } else {
    for (let i = 0; i < rows.length; i++) W.tableRow(doc, c, { x: PAD_H, y: cy + 44 + i * 44, w: CONTENT_W, cells: rows[i] });
    cy += 44 + rows.length * 44 + 22;
  }
  c.rect({ name: 'cmp box', x: PAD_H, y: cy, w: CONTENT_W, h: 72, r: R.md, stroke: G.edge, dashes: [5, 4] });
  c.text({ name: 'h4', x: PAD_H + 14, y: cy + 14, w: CONTENT_W - 28, text: '前后对比', size: FS.sub });
  c.text({ name: 'h5', x: PAD_H + 14, y: cy + 38, w: CONTENT_W - 28, text: '4 周前每周 8 次 → 现在每周 18 次', size: FS.cap, color: G.ink3 });
  if (MODE === 'B') tabPill(c, 2);
  W.tabBar(doc, c, { active: 2 });
}

// ── 11 空与加载
{
  const { x, y } = mk(10);
  const c = screen('11 · 空与加载', x, y);
  let cy = W.navBar(doc, c, { title: '成长', y: 59, right: '筛选' });
  cy += 22;
  c.text({ name: 'x1', x: PAD_H, y: cy, w: CONTENT_W, text: '空状态', size: FS.cap, color: G.ink3 });
  cy += 20;
  W.emptyState(doc, c, { y: cy, title: '这一周还没有记录', sub: '今天完成一次，趋势就会长出来', cta: '去打卡' });
  cy += 170 + 30;
  c.text({ name: 'x2', x: PAD_H, y: cy, w: CONTENT_W, text: '加载态（骨架）', size: FS.cap, color: G.ink3 });
  cy += 20;
  c.rect({ name: 'sk card', x: PAD_H, y: cy, w: CONTENT_W, h: 130, r: R.md, stroke: G.line });
  W.skeleton(doc, c, { x: PAD_H + 14, y: cy + 16, w: CONTENT_W - 28, rows: 3 });
  cy += 130 + 30;
  c.text({ name: 'x3', x: PAD_H, y: cy, w: CONTENT_W, text: '错误态', size: FS.cap, color: G.ink3 });
  cy += 20;
  c.rect({ name: 'err box', x: PAD_H, y: cy, w: CONTENT_W, h: 100, r: R.md, stroke: G.edge, dashes: [5, 4] });
  c.text({ name: 'x4', x: PAD_H + 14, y: cy + 16, w: CONTENT_W - 28, text: '数据没同步上', size: FS.body });
  c.text({ name: 'x5', x: PAD_H + 14, y: cy + 42, w: CONTENT_W - 28, text: '本地记录已保存，恢复网络后会自动补传。', size: FS.cap, color: G.ink3 });
  c.rect({ name: 'retry', x: PAD_H + 14, y: cy + 62, w: 88, h: 28, r: R.sm, stroke: G.edge });
  c.text({ name: 'x6', x: PAD_H + 14, y: cy + 68, w: 88, text: '重试', size: FS.cap, align: 'center' });
  if (MODE === 'B') tabPill(c, 2);
  W.tabBar(doc, c, { active: 2 });
}

// ── 12 弹窗
{
  const { x, y } = mk(11);
  const c = screen('12 · 弹窗', x, y);
  let cy = W.largeHeader(doc, c, { kicker: '10月19日 周一', title: '今日', action: '编辑' });
  cy += 2;
  W.sectionHead(doc, c, { y: cy, title: '今日任务 · 2 / 5', action: '全部' });
  cy += 26;
  for (const [t, s, xp, d] of [['晨跑 20 分钟', '运动 · 07:30', '+30', true], ['背 30 个单词', '学习 · 已完成', '+20', true], ['英语听力 15 分钟', '每天 20:00', '+25', false]]) {
    W.taskCard(doc, c, { y: cy, title: t, sub: s, xp, done: d });
    cy += 84;
  }
  const my = 292;
  c.rect({ name: 'scrim', x: 0, y: 0, w: SW, h: SH, fill: G.ink1, opacity: 0.28 });
  c.rect({ name: 'modal', x: 44, y: my, w: SW - 88, h: 322, r: R.lg, stroke: G.line });
  W.medal(doc, c, { x: Math.round(SW / 2) - 36, y: my + 30, tone: 'locked' });
  c.text({ name: 'md1', x: 44, y: my + 112, w: SW - 88, text: 'Boss · 一周听力挑战', size: FS.title, align: 'center' });
  c.text({ name: 'md2', x: 76, y: my + 146, w: SW - 152, text: '7 天内完成 5 次英语听力，可获得徽记与额外经验。', size: FS.sub, color: G.ink3, align: 'center', lh: 20 });
  c.rect({ name: 'md3 box', x: 64, y: my + 202, w: SW - 128, h: 44, r: R.sm, stroke: G.edge, dashes: [5, 4] });
  c.text({ name: 'md3', x: 64, y: my + 216, w: SW - 128, text: '失败代价：暂存魂火失落', size: FS.cap, color: G.ink2, align: 'center' });
  W.button(doc, c, { x: 64, y: my + 262, w: SW - 128, h: 44, label: '接受挑战' });
}

const stats = doc.stats();
const res = doc.save(OUT + '\\' + FILE);
console.log(`[${MODE}] saved ${FILE}`, JSON.stringify(res), JSON.stringify(stats));
