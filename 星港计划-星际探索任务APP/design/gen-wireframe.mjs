// 星港计划 · 线框稿生成器
// 输出 JSX 给 figma_render。只用矩形，不填充元素。
import { writeFileSync } from 'node:fs';

const W = 390, H = 844;
const COLSTEP = 450, ROWSTEP = 1000;
const colX = (c) => c * COLSTEP;
const rowY = (r) => 60 + r * ROWSTEP;

const L = [];
const push = (s) => L.push(s);

// ── 基础图元
function rect(x, y, w, h, o = {}) {
  const a = [`x={${x}}`, `y={${y}}`, `w={${w}}`, `h={${h}}`];
  if (o.bg !== null) a.push(`bg="${o.bg || '#FFFFFF'}"`);
  if (o.stroke !== null) a.push(`stroke="${o.stroke || '#9A9A9A'}"`, `strokeWidth={${o.sw ?? 1}}`);
  if (o.radius) a.push(`radius={${o.radius}}`);
  if (o.dash) a.push(`strokeDashPattern="${o.dash}"`);
  a.push('flex="none"');
  return `<Frame name="${o.name || 'rect'}" ${a.join(' ')} />`;
}
function txt(s, x, y, w, h, o = {}) {
  const a = [`x={${x}}`, `y={${y}}`, `w={${w}}`, `h={${h}}`, `size={${o.size || 10}}`, `color="${o.color || '#666666'}"`];
  if (o.align) a.push(`align="${o.align}"`);
  return `<Text ${a.join(' ')}>${s}</Text>`;
}
// 带标签的区域
function reg(label, x, y, w, h, o = {}) {
  const out = [rect(x, y, w, h, { ...o, name: label || 'rect' })];
  if (label && o.label !== false) {
    const pad = o.lpad ?? 7;
    const txtW = o.lw ?? Math.max(20, w - pad * 2);
    const tx = o.lalign === 'right' ? x + w - pad - txtW : x + pad;
    out.push(txt(label, tx, y + (o.loff ?? 6), txtW, o.lh ?? 14, {
      size: o.lsize || 10,
      color: o.lcolor || '#777777',
      align: o.lalign,
    }));
  }
  return out.join('\n      ');
}

// ── 通用骨架（主页面三态）
function chromeMain() {
  return [
    rect(0, 0, W, 47, { bg: '#F0F0F0', stroke: null, name: '状态栏' }),
    txt('状态栏 47', 12, 15, 120, 16, { size: 10, color: '#999999' }),
    reg('顶部 · 星球视窗 390×200', 0, 47, W, 200),
    reg('星球模型 + 设施动画', 95, 67, 200, 120),
    reg('标题（可自定义）', 95, 199, 200, 32),
    reg('', 306, 59, 24, 24),
    reg('', 340, 59, 24, 24),
    txt('设置', 302, 87, 32, 14, { size: 9, color: '#999999' }),
    txt('账户', 336, 87, 32, 14, { size: 9, color: '#999999' }),
    reg('分段选择器（横向切换）', 16, 263, 358, 44, { radius: 10, label: false }),
    rect(135, 263, 1, 44, { bg: '#CCCCCC', stroke: null, name: 'div1' }),
    rect(254, 263, 1, 44, { bg: '#CCCCCC', stroke: null, name: 'div2' }),
    txt('计划', 16, 268, 119, 18, { size: 12, align: 'center', color: '#333333' }),
    txt('任务', 135, 268, 119, 18, { size: 12, align: 'center', color: '#999999' }),
    txt('基地', 254, 268, 120, 18, { size: 12, align: 'center', color: '#999999' }),
    txt('分段选择器（横向切换） 358×44', 16, 310, 358, 12, { size: 9, align: 'center', color: '#AAAAAA' }),
    reg('主内容区（可滚动） 358×470', 16, 323, 358, 470, { dash: '6 4', lcolor: '#BBBBBB', lsize: 9, loff: 4, lh: 12 }),
    rect(0, 810, W, 34, { bg: '#F0F0F0', stroke: null, name: 'Home' }),
    txt('Home 指示条 34', 12, 818, 140, 16, { size: 10, color: '#999999' }),
  ].join('\n      ');
}
// 通用：只有导航栏的二级页
function chromeSub(title) {
  return [
    rect(0, 0, W, 47, { bg: '#F0F0F0', stroke: null, name: '状态栏' }),
    txt('状态栏 47', 12, 15, 120, 16, { size: 10, color: '#999999' }),
    reg('导航栏 44（返回 · 标题 · 保存）', 0, 47, W, 44),
    rect(0, 810, W, 34, { bg: '#F0F0F0', stroke: null, name: 'Home' }),
    txt('Home 指示条 34', 12, 818, 140, 16, { size: 10, color: '#999999' }),
  ].join('\n      ');
}
// 节标题
const secLabel = (s, y) => txt(s, 16, y, 300, 16, { size: 11, color: '#888888' });

// ══════════════════════════════════════════════ 各屏

// 00 封面
function cover() {
  return [
    rect(0, 0, W, H, { bg: '#FFFFFF', stroke: '#333333', name: 'screen' }),
    txt('星港计划 STARPORT', 32, 60, 326, 30, { size: 20, color: '#111111' }),
    txt('矩形线框图（不填充元素）', 32, 96, 326, 20, { size: 13, color: '#555555' }),
    txt('依据：信息架构 IA v2（三标签版）', 32, 122, 326, 18, { size: 11, color: '#888888' }),
    reg('规格', 32, 160, 326, 150),
    txt('基准屏  390 × 844', 46, 184, 300, 18, { size: 11 }),
    txt('安全边距  16（内容宽 358）', 46, 208, 300, 18, { size: 11 }),
    txt('状态栏 47 / Home 指示条 34', 46, 232, 300, 18, { size: 11 }),
    txt('列距 450 · 行距 1000', 46, 256, 300, 18, { size: 11 }),
    txt('共 12 个版面（10 屏 + 封面）', 46, 280, 300, 18, { size: 11 }),
    reg('线框语言', 32, 330, 326, 200),
    txt('实线矩形 = 确定的布局区块', 46, 354, 300, 18, { size: 11 }),
    txt('虚线矩形 = 可选项 / 待定', 46, 378, 300, 18, { size: 11 }),
    txt('灰底块 = 顶 / 底安全区', 46, 402, 300, 18, { size: 11 }),
    txt('圆角矩形 = 按钮 / 卡片 / 芯片', 46, 426, 300, 18, { size: 11 }),
    txt('文字 = 区块名 + 尺寸，不含真实内容', 46, 450, 300, 18, { size: 11 }),
    reg('版面清单', 32, 550, 326, 250),
    txt('01–03  主页面（计划 / 任务 / 基地）', 46, 574, 306, 18, { size: 11 }),
    txt('04     计划详细设置', 46, 598, 306, 18, { size: 11 }),
    txt('05     任务详细设置', 46, 622, 306, 18, { size: 11 }),
    txt('06A–C  任务进行页面（点火/窗口/记录）', 46, 646, 306, 18, { size: 11 }),
    txt('07     任务结算页面', 46, 670, 306, 18, { size: 11 }),
    txt('08     资源查看页面', 46, 694, 306, 18, { size: 11 }),
    txt('09     账户个性化页', 46, 718, 306, 18, { size: 11 }),
    txt('10     设置页', 46, 742, 306, 18, { size: 11 }),
  ].join('\n      ');
}

// 01 计划
function s01() {
  return [chromeMain(),
    reg('机构 / 领域筛选芯片', 16, 339, 358, 40, { radius: 20 }),
    reg('计划卡 358×88', 16, 395, 358, 88, { radius: 12 }),
    reg('计划卡 358×88', 16, 499, 358, 88, { radius: 12 }),
    reg('计划卡 358×88', 16, 603, 358, 88, { radius: 12 }),
    reg('新建计划位（可选）', 16, 707, 358, 72, { radius: 12, dash: '6 4', lcolor: '#AAAAAA' }),
  ].join('\n      ');
}
// 02 任务
function s02() {
  return [chromeMain(),
    reg('今日进度 358×56', 16, 339, 358, 56, { radius: 12 }),
    reg('任务行 358×60', 16, 411, 358, 60, { radius: 10 }),
    reg('任务行 358×60', 16, 479, 358, 60, { radius: 10 }),
    reg('任务行 358×60', 16, 547, 358, 60, { radius: 10 }),
    reg('任务行 358×60', 16, 615, 358, 60, { radius: 10 }),
    reg('主按钮「开始专注」358×52', 16, 691, 358, 52, { radius: 12 }),
  ].join('\n      ');
}
// 03 基地
function s03() {
  return [chromeMain(),
    reg('设施阵列缩略 358×104', 16, 339, 358, 104, { radius: 12 }),
    reg('设施详情卡 358×92', 16, 459, 358, 92, { radius: 12 }),
    reg('设施详情卡 358×92', 16, 567, 358, 92, { radius: 12 }),
    reg('扩建清单行 358×52', 16, 675, 358, 52, { radius: 10 }),
    reg('入口「资源查看」358×44', 16, 743, 358, 44, { radius: 12 }),
  ].join('\n      ');
}
// 04 计划详细设置
function s04() {
  return [chromeSub(),
    secLabel('计划名称', 107),
    reg('输入框 358×48', 16, 127, 358, 48, { radius: 8 }),
    secLabel('周期', 191),
    reg('分段：7 / 14 / 21 / 30 天 · 8 周', 16, 211, 358, 44, { radius: 8 }),
    secLabel('频率', 271),
    reg('频率行 358×52', 16, 291, 358, 52, { radius: 8 }),
    reg('每周次数 · 步进器', 16, 351, 358, 52, { radius: 8 }),
    secLabel('休息日', 419),
    reg('周几芯片 ×7', 16, 439, 358, 44, { radius: 22 }),
    secLabel('提醒时间', 499),
    reg('时间行 358×52', 16, 519, 358, 52, { radius: 8 }),
    reg('主按钮「创建计划」358×52', 16, 742, 358, 52, { radius: 12 }),
  ].join('\n      ');
}
// 05 任务详细设置
function s05() {
  return [chromeSub(),
    secLabel('任务名称', 107),
    reg('输入框 358×48', 16, 127, 358, 48, { radius: 8 }),
    secLabel('类型', 191),
    reg('分段：定时 / 计数 / 布尔', 16, 211, 358, 44, { radius: 8 }),
    secLabel('目标量', 271),
    reg('输入框 358×48', 16, 291, 358, 48, { radius: 8 }),
    secLabel('排期', 355),
    reg('周几芯片 + 时段', 16, 375, 358, 44, { radius: 22 }),
    secLabel('执行方式', 435),
    reg('分段：点火 / 窗口 / 记录', 16, 455, 358, 44, { radius: 8 }),
    secLabel('最小完成线', 515),
    reg('滑杆 358×52（默认 60%）', 16, 535, 358, 52, { radius: 8 }),
    reg('主按钮「保存」358×52', 16, 742, 358, 52, { radius: 12 }),
  ].join('\n      ');
}
// 06A 任务进行页面 · 点火
function s06a() {
  return [
    rect(0, 0, W, 47, { bg: '#F0F0F0', stroke: null, name: '状态栏' }),
    txt('状态栏 47', 12, 15, 120, 16, { size: 10, color: '#999999' }),
    reg('变体 A · 点火（计时中）', 16, 67, 358, 56, { dash: '6 4', lcolor: '#AAAAAA' }),
    reg('任务名 280×36', 55, 140, 280, 36),
    reg('环形进度 260×260', 65, 220, 260, 260, { radius: 130 }),
    txt('环形进度 / 剩余时间', 65, 340, 260, 20, { size: 11, align: 'center', color: '#999999' }),
    reg('剩余时间 25:00', 95, 510, 200, 64, { radius: 12 }),
    reg('归属：机构 · 计划', 95, 594, 200, 32, { radius: 8 }),
    reg('中止', 95, 660, 200, 52, { radius: 12 }),
    rect(0, 810, W, 34, { bg: '#F0F0F0', stroke: null, name: 'Home' }),
    txt('Home 指示条 34', 12, 818, 140, 16, { size: 10, color: '#999999' }),
  ].join('\n      ');
}
// 06B 窗口
function s06b() {
  return [
    rect(0, 0, W, 47, { bg: '#F0F0F0', stroke: null, name: '状态栏' }),
    txt('状态栏 47', 12, 15, 120, 16, { size: 10, color: '#999999' }),
    reg('变体 B · 发射窗口（闹钟）', 16, 67, 358, 56, { dash: '6 4', lcolor: '#AAAAAA' }),
    reg('时刻大字 07:00', 45, 160, 300, 110, { radius: 12 }),
    reg('解除区 358×200（拖刻度 / 算术）', 16, 300, 358, 200, { radius: 12, dash: '6 4', lcolor: '#AAAAAA' }),
    reg('确认「我已起床」358×52', 16, 528, 358, 52, { radius: 12 }),
    reg('记录窗提示（30 分钟）', 16, 600, 358, 44, { radius: 8 }),
    reg('跳转：当日第一条任务', 16, 664, 358, 44, { radius: 8 }),
    rect(0, 810, W, 34, { bg: '#F0F0F0', stroke: null, name: 'Home' }),
    txt('Home 指示条 34', 12, 818, 140, 16, { size: 10, color: '#999999' }),
  ].join('\n      ');
}
// 06C 记录
function s06c() {
  const rows = [127, 195, 263, 331, 399].map((y) => reg('勾选行 358×60', 16, y, 358, 60, { radius: 10 }));
  return [
    rect(0, 0, W, 47, { bg: '#F0F0F0', stroke: null, name: '状态栏' }),
    txt('状态栏 47', 12, 15, 120, 16, { size: 10, color: '#999999' }),
    reg('导航栏 44', 0, 47, W, 44),
    txt('变体 C · 自由记录（无计时）', 16, 103, 358, 16, { size: 10, color: '#AAAAAA' }),
    ...rows,
    reg('完成 358×52', 16, 742, 358, 52, { radius: 12 }),
    rect(0, 810, W, 34, { bg: '#F0F0F0', stroke: null, name: 'Home' }),
    txt('Home 指示条 34', 12, 818, 140, 16, { size: 10, color: '#999999' }),
  ].join('\n      ');
}
// 07 结算
function s07() {
  return [
    rect(0, 0, W, 47, { bg: '#F0F0F0', stroke: null, name: '状态栏' }),
    txt('状态栏 47', 12, 15, 120, 16, { size: 10, color: '#999999' }),
    reg('判定区 358×120（入轨 / 中止）', 16, 63, 358, 120, { radius: 12 }),
    reg('归属行 358×40（机构 · 计划 · 第 N 格）', 16, 199, 358, 40, { radius: 8 }),
    reg('收益区 358×100（推进值 / 研究成果）', 16, 255, 358, 100, { radius: 12 }),
    reg('扰动 roll 区（可选）', 16, 371, 358, 120, { radius: 12, dash: '6 4', lcolor: '#AAAAAA' }),
    reg('知识卡区 358×220', 16, 507, 358, 220, { radius: 12 }),
    txt('标题 · 大数字 · 正文 · 来源', 26, 531, 330, 16, { size: 10, color: '#999999' }),
    reg('收下 / 看全文 358×52', 16, 742, 358, 52, { radius: 12 }),
    rect(0, 810, W, 34, { bg: '#F0F0F0', stroke: null, name: 'Home' }),
    txt('Home 指示条 34', 12, 818, 140, 16, { size: 10, color: '#999999' }),
  ].join('\n      ');
}
// 08 资源查看
function s08() {
  const g = [];
  const ys = [279, 405, 531];
  for (const y of ys) {
    g.push(reg('卡片 173×110', 16, y, 173, 110, { radius: 10, lsize: 9 }));
    g.push(reg('卡片 173×110', 201, y, 173, 110, { radius: 10, lsize: 9 }));
  }
  return [chromeSub(),
    reg('汇总条 358×80（累计成果 / 材料 / 航时）', 16, 127, 358, 80, { radius: 12 }),
    reg('系列筛选芯片 ×6', 16, 223, 358, 40, { radius: 20 }),
    ...g,
    reg('集册进度条 358×56', 16, 657, 358, 56, { radius: 12 }),
  ].join('\n      ');
}
// 09 账户个性化
function s09() {
  const sw = [0, 1, 2, 3].map((i) => reg('', 16 + i * 90, 495, 80, 80, { radius: 10 }));
  const bd = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => reg('', 16 + i * 44, 615, 40, 40, { radius: 8 }));
  return [chromeSub(),
    reg('头像区 358×120', 16, 127, 358, 120, { radius: 12 }),
    secLabel('身份与呼号', 263),
    reg('指挥官代号', 16, 283, 358, 56, { radius: 8 }),
    reg('座舱呼号', 16, 347, 358, 56, { radius: 8 }),
    secLabel('星球命名与涂装', 419),
    reg('星球名称 · 输入框', 16, 439, 358, 48, { radius: 8 }),
    ...sw,
    txt('涂装 ×4  80×80', 16, 579, 200, 14, { size: 9, color: '#AAAAAA' }),
    secLabel('徽记与旗帜', 597),
    ...bd,
    txt('徽记 ×8  40×40', 16, 659, 200, 14, { size: 9, color: '#AAAAAA' }),
    secLabel('指挥官档案', 679),
    reg('等级 · 累计航时 · 成就', 16, 699, 358, 44, { radius: 8 }),
  ].join('\n      ');
}
// 10 设置
function s10() {
  return [chromeSub(),
    secLabel('通知与提醒', 111),
    reg('提醒通知 · 开关行', 16, 131, 358, 56, { radius: 8 }),
    reg('每日总结 · 开关行', 16, 195, 358, 56, { radius: 8 }),
    secLabel('反馈偏好（副手语气）', 275),
    reg('分段：简洁 / 有人味 / 纯报数', 16, 295, 358, 44, { radius: 8 }),
    secLabel('随机扰动与概率公开', 363),
    reg('随机扰动 · 开关行', 16, 383, 358, 56, { radius: 8 }),
    reg('概率表与保底计数 · 入口行', 16, 447, 358, 56, { radius: 8 }),
    secLabel('数据与隐私', 527),
    reg('导出 JSON / CSV', 16, 547, 358, 56, { radius: 8 }),
    reg('隐私说明 · 入口行', 16, 611, 358, 56, { radius: 8 }),
    reg('版本号', 16, 715, 358, 32, { radius: 8, dash: '6 4', lcolor: '#AAAAAA' }),
  ].join('\n      ');
}

// ══════════════════════════════════════════════ 组装
const screens = [
  { c: 0, r: 0, t: '00 · 封面 / 规格与图例', body: cover() },
  { c: 1, r: 0, t: '01 · 主页面（计划）', body: s01() },
  { c: 2, r: 0, t: '02 · 主页面（任务）', body: s02() },
  { c: 3, r: 0, t: '03 · 主页面（基地）', body: s03() },
  { c: 4, r: 0, t: '04 · 计划详细设置', body: s04() },
  { c: 0, r: 1, t: '05 · 任务详细设置', body: s05() },
  { c: 1, r: 1, t: '06A · 任务进行页面（点火）', body: s06a() },
  { c: 2, r: 1, t: '06B · 任务进行页面（窗口）', body: s06b() },
  { c: 3, r: 1, t: '06C · 任务进行页面（记录）', body: s06c() },
  { c: 4, r: 1, t: '07 · 任务结算页面', body: s07() },
  { c: 0, r: 2, t: '08 · 资源查看页面', body: s08() },
  { c: 1, r: 2, t: '09 · 账户个性化页', body: s09() },
  { c: 2, r: 2, t: '10 · 设置页', body: s10() },
];

const inner = screens.map((s) => {
  const x = colX(s.c), y = rowY(s.r);
  return `  <Frame name="屏 ${s.t}" x={${x}} y={${y}} w={${W}} h={${H}} bg="#FFFFFF" stroke="#333333" strokeWidth={1} flex="none">
      <Frame name="title" x={${x}} y={${y - 36}} w={390} h={26} bg="#EDEDED" stroke={null} flex="none" />
      <Text x={${x + 2}} y={${y - 33}} w={386} h={22} size={14} color="#111111">${s.t}</Text>
      ${s.body}
  </Frame>`;
}).join('\n');

const jsx = `<Frame name="星港计划 · 线框稿 v1" x={0} y={0} w={2350} h={3020} bg="#EDEDED" flex="none">
${inner}
</Frame>`;

const out = process.argv[2] || '_wireframe.jsx';
writeFileSync(out, jsx);
console.log('written ' + out + '  bytes=' + jsx.length + '  screens=' + screens.length);
