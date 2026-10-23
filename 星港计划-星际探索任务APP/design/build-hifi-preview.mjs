// 高保真预览 最终版：深色层次 + 实例化真实组件（须传变体 COMPONENT id）
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'hf3', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');
const firstId = (s) => (s.match(/(\d+:\d+)/) || [])[1];
const asId = (s) => { const m = s.match(/ as .*?\((\d+:\d+)\)/); return m ? m[1] : null; };

// 清理旧板与测试实例
for (const id of ['937:861', '937:1664']) await run(['node', 'delete', id]).catch(() => {});

// 每个组件集选哪个变体（正则匹配变体名）
const CMAP = [
  [/^状态栏/, '模板/Bar/Status', /default/],
  [/^导航栏/, '模板/Bar/Nav', /text/],
  [/^分段选择器/, '模板/Seg/Bar', /plan/],
  [/筛选芯片|^周几芯片/, '模板/Chip/Filter', /true/],
  [/^计划卡/, '模板/Card/Program', /active/],
  [/^设施详情卡/, '模板/Card/Facility', /running/],
  [/^输入框/, '模板/Field/Input', /normal/],
  [/^(勾选行|任务行|扩建清单行|频率行|时间行|入口|提醒通知|每日总结|随机扰动|概率表|隐私说明|归属行|汇总条)/, '模板/Row/List', /normal/],
  [/^(主按钮|完成|中止|确认|收下)/, '模板/Btn/Action', /go.*normal|normal/],
  [/^环形进度/, '模板/Block/Ring', /running/],
  [/^滑杆/, '模板/Ctrl/Slider', /normal/],
  [/^头像区/, '模板/Avatar', /square/],
];
const variantOf = {};
for (const [, cn, pref] of CMAP) {
  if (variantOf[cn]) continue;
  const f = await run(['find', cn, '--type', 'COMPONENT_SET', '--limit', '2']);
  const sid = firstId(f);
  if (!sid) { console.log('! 找不到 ' + cn); continue; }
  const t = await run(['node', 'tree', sid, '--depth', '1', '--ids']);
  const vs = [];
  for (const line of t.split('\n')) {
    const m = line.match(/COMPONENT: (.+?) \(.*?\) \[(\d+:\d+)\]/);
    if (m) vs.push({ name: m[1].trim(), id: m[2] });
  }
  const pick = vs.find((v) => pref.test(v.name)) || vs[0];
  if (pick) { variantOf[cn] = pick.id; console.log(`  ${cn.padEnd(22)} → ${pick.name.padEnd(22)} ${pick.id}`); }
}

// 复制并重命名
const NEW = asId(await run(['node', 'duplicate', '842:393']));
await run(['node', 'move', NEW, '10500', '0']);
await run(['node', 'rename', NEW, '高保真预览 v1']);
console.log('\n新板: ' + NEW);

const L1 = /状态栏|导航栏|顶部|主内容区|Home|分段选择器|^title$|^screen$|规格|线框语言|版面清单|^rect$/;
const L3 = /星球模型|标题（可自定义）|^div[12]$/;
const levelOf = (n) => (L3.test(n) ? 3 : (L1.test(n) ? 1 : 2));

const bt = await run(['node', 'tree', NEW, '--depth', '1', '--ids']);
const screens = [];
for (const line of bt.split('\n')) {
  const m = line.match(/FRAME: (.+?) \(.*?\) \[(\d+:\d+)\]/);
  if (m && m[1].includes('屏')) screens.push({ name: m[1].trim(), id: m[2] });
}
await run(['style', 'apply', 'SP/Dark/L0', screens.map((s) => s.id).join(','), '--field', 'fill']);

let stat = { l1: 0, l2: 0, l3: 0, inst: 0, texts: 0, fail: 0 };
for (const sc of screens) {
  let scr; try { scr = JSON.parse(await run(['inspect', sc.id, '--json'])); } catch { }
  const sx = scr?.raw?.x ?? 0, sy = scr?.raw?.y ?? 0;
  const st = await run(['node', 'tree', sc.id, '--depth', '2', '--ids']);
  const kids = [], texts = [];
  for (const line of st.split('\n')) {
    const mf = line.match(/^\s{2,}(FRAME|RECTANGLE): (.+?) \((\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\) \[(\d+:\d+)\]/);
    if (mf) {
      let j; try { j = JSON.parse(await run(['inspect', mf[5], '--json'])); } catch { continue; }
      kids.push({ name: mf[2].trim(), id: mf[5], w: j.raw?.width ?? +mf[3], h: j.raw?.height ?? +mf[4], x: j.raw?.x ?? 0, y: j.raw?.y ?? 0 });
      continue;
    }
    const mt = line.match(/^\s{2,}TEXT: .+? \((\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\) \[(\d+:\d+)\]/);
    if (mt) {
      let j; try { j = JSON.parse(await run(['inspect', mt[3], '--json'])); } catch { continue; }
      texts.push({ id: mt[3], w: j.raw?.width ?? +mt[1], h: j.raw?.height ?? +mt[2], x: j.raw?.x ?? 0, y: j.raw?.y ?? 0 });
    }
  }
  const byLv = { 1: [], 2: [], 3: [] };
  for (const k of kids) byLv[levelOf(k.name)].push(k.id);
  for (const lv of [1, 2, 3]) {
    if (!byLv[lv].length) continue;
    for (let i = 0; i < byLv[lv].length; i += 60)
      await run(['style', 'apply', `SP/Dark/L${lv}`, byLv[lv].slice(i, i + 60).join(','), '--field', 'fill']);
    stat['l' + lv] += byLv[lv].length;
  }
  if (texts.length) {
    for (let i = 0; i < texts.length; i += 60)
      await run(['style', 'apply', 'SP/Dark/t3', texts.slice(i, i + 60).join(','), '--field', 'fill']);
    stat.texts += texts.length;
  }
  // 实例化 + 清理占位框与其标签
  const toDelete = [];
  for (const k of kids) {
    const hit = CMAP.find(([re]) => re.test(k.name));
    if (!hit) continue;
    const cid = variantOf[hit[1]];
    if (!cid) continue;
    // -x/-y 是【相对父级的局部坐标】，直接用 k.x/k.y（实测：传 300,400 → raw=300,400）
    const o = await run(['component', 'instantiate', cid, '-x', String(Math.round(k.x)), '-y', String(Math.round(k.y)), '--parent', sc.id]);
    if (/Created instance/.test(o)) {
      stat.inst++;
      toDelete.push(k.id);
      // 删掉落在这个占位框内的标签文字
      for (const t of texts) {
        if (t.x >= k.x - 2 && t.y >= k.y - 2 && t.x + t.w <= k.x + k.w + 2 && t.y + t.h <= k.y + k.h + 2) toDelete.push(t.id);
      }
    } else if (stat.fail < 3) { stat.fail++; console.log(`  ! ${k.name} → ${hit[1]}: ${o.trim().split('\n')[0].slice(0, 70)}`); }
  }
  if (toDelete.length) await run(['node', 'delete', ...toDelete]).catch(() => {});
}
console.log(`\n上色 L1 ${stat.l1} / L2 ${stat.l2} / L3 ${stat.l3} / 文字 ${stat.texts}`);
console.log(`组件实例 ${stat.inst} 个，失败 ${stat.fail}`);
const scr = await rpc('tools/call', { name: 'figma_screenshot', arguments: { nodeId: NEW, scale: 0.28 } });
const t = (scr.result?.content || []).map((c) => c.text ?? '').join('\n');
console.log('PNG: ' + ((t.match(/"saved"\s*:\s*"([^"]+)"/) || [])[1] || t.slice(0, 150)));
console.log('BOARD=' + NEW);
child.kill(); process.exit(0);
