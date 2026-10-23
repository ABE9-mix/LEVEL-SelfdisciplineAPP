// 导出三维演示页的截图，供设计稿使用。
//
// 产出（design/三维截图/）：
//   01-03  整屏（含手机框）@2x / @3x，计划 / 任务 / 基地 三个标签
//   04-05  三维视窗原生裁切 780×454（390×227 @2x），像素化开 / 关
//   06     像素化各档位（×3 / ×4 / ×6；默认档已在 04）
//   07     透明底整屏 @2x（便于合成进设计稿）
//   08     总览拼图
//
// 用法：node demo/export-shots.mjs
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { connect } from './_cdp.mjs';

const ROOT = 'F:/industryworks/图形界面设计/LEVEL-app/星港计划-星际探索任务APP';
const OUT = join(ROOT, 'design/三维截图');
const PAGE = 'file:///F:/industryworks/' + encodeURIComponent('图形界面设计') + '/LEVEL-app/'
  + encodeURIComponent('星港计划-星际探索任务APP') + '/demo/'
  + encodeURIComponent('主页面三维演示.html');

const sleep = ms => new Promise(r => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

/* ── 连接（复用式，不杀任何进程）─────────────────────────────────
   早期版本在这里 spawn 一个 Chrome、脚本结束就 kill 掉；
   调试时还常用 `Get-Process chrome | Kill` 清场 —— 那会连用户自己的
   浏览器一起杀掉。现在统一交给 _cdp.mjs：
     · 固定端口 + 固定 user-data-dir，跨次复用同一个 headless 实例
     · 不存在才启动，且 detached，不随本脚本退出而终止
     · 每次跑都用 Page.navigate 回到干净状态
   ──────────────────────────────────────────────────────────────── */
const cdp = await connect({ url: PAGE });
console.log(cdp.info());
const { send, js } = cdp;
const shot = (path, opts = {}) => cdp.shot(path, opts).then(() => {
  console.log('  ✓', path.slice(OUT.length + 1));
});

/* ── 设定视口 + 等渲染就绪 ── */
async function prepare(dpr) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: 520, height: 960, deviceScaleFactor: dpr, mobile: false,
  });
  await send('Page.reload', { ignoreCache: false });
  // 等 canvas 出现且首帧完成
  for (let i = 0; i < 60; i++) {
    const ok = await js(`!!(window.THREE && document.querySelector('#stage canvas') &&
      document.getElementById('d-first') && document.getElementById('d-first').textContent !== '—')`);
    if (ok) break;
    await sleep(250);
  }
  await js(`document.getElementById('phone').style.transform='none'; 1`);
  await sleep(400);
  return JSON.parse(await js(`(function(){
    var p=document.getElementById('phone').getBoundingClientRect();
    var s=document.getElementById('stage').getBoundingClientRect();
    return JSON.stringify({phone:{x:p.x,y:p.y,w:p.width,h:p.height},
                           stage:{x:s.x,y:s.y,w:s.width,h:s.height}, dpr:devicePixelRatio});
  })()`));
}

/* ── 1. 整屏 @2x / @3x ── */
const TABS = [['plan', '01-主界面-计划'], ['task', '02-主界面-任务'], ['base', '03-主界面-基地']];
for (const dpr of [2, 3]) {
  const g = await prepare(dpr);
  // 冻结待机自转 + 固定转角，保证每次导出的构图一致
  await js(`window.__cam.freeze(); window.__cam.setSpin(2.4); window.__cam.setDist(3.6); 1`);
  await sleep(900);
  console.log(`\n整屏 @${dpr}x (phone ${g.phone.w}×${g.phone.h})`);
  for (const [key, name] of TABS) {
    await js(`document.querySelector('[data-k="${key}"]').click(); 1`);
    await sleep(650);
    await shot(join(OUT, `${name}@${dpr}x.png`), {
      clip: { x: g.phone.x, y: g.phone.y, width: g.phone.w, height: g.phone.h, scale: 1 },
    });
  }
}

/* ── 2. 三维视窗裁切 ── */
{
  const g = await prepare(2);
  console.log('\n三维视窗裁切');
  const clip = { x: g.stage.x, y: g.stage.y, width: g.stage.w, height: g.stage.h, scale: 1 };

  await js(`document.querySelector('[data-k="plan"]').click(); 1`);
  await js(`window.__cam.freeze(); window.__cam.setSpin(2.4); window.__cam.globe(); window.__cam.setDist(3.6); 1`);
  await sleep(1200);
  await js(`window.__px.setPixel(true, 2); 1`);
  await sleep(1000);
  await shot(join(OUT, '04-三维视窗-像素化开-780x454.png'), { clip });

  await js(`window.__px.setPixel(false); 1`);
  await sleep(1000);
  await shot(join(OUT, '05-三维视窗-像素化关-780x454.png'), { clip });

  for (const [k, n] of [[3, 'x3'], [4, 'x4'], [6, 'x6']]) {
    await js(`window.__px.setPixel(true, ${k}); 1`);
    await sleep(800);
    await shot(join(OUT, `06-三维视窗-像素化档位${n}.png`), { clip });
  }
  await js(`window.__px.setPixel(true, 2); 1`);

  /* 聚焦视角：点 4 号建筑 → 切地平线视角 */
  await js(`window.__cam.focus(3); window.__cam.orbit(0, 0); 1`);
  await sleep(1600);
  await shot(join(OUT, '08-三维视窗-聚焦地平线-780x454.png'), { clip });

  /* 聚焦后绕建筑环绕（把拖动的结果定格下来） */
  await js(`window.__cam.orbit(1.12, 0); 1`);
  await sleep(1400);
  await shot(join(OUT, '09-三维视窗-聚焦环绕-780x454.png'), { clip });

  /* 抬高到俯视（极角往下压，θ ≈ 37°） */
  await js(`window.__cam.orbit(0, -0.55); 1`);
  await sleep(1400);
  await shot(join(OUT, '10-三维视窗-聚焦俯视-780x454.png'), { clip });

  await js(`window.__cam.orbit(0, 0); window.__cam.globe(); 1`);
  await sleep(1200);
}

/* ── 3. 透明底整屏 ── */
{
  const g = await prepare(2);
  await js(`window.__cam.freeze(); window.__cam.setSpin(2.4); window.__cam.setDist(3.6); 1`);
  await sleep(900);
  console.log('\n透明底整屏 @2x');
  // 仅改 CSS 不够：headless 的页面底仍是白的，必须用 CDP 覆写默认背景为透明
  await send('Emulation.setDefaultBackgroundColorOverride', {
    color: { r: 0, g: 0, b: 0, a: 0 },
  });
  await js(`
    document.body.style.background='none';
    document.documentElement.style.background='none';
    document.getElementById('phone').style.boxShadow='none';
    document.querySelector('[data-k="plan"]').click();
    1`);
  await sleep(800);
  await shot(join(OUT, '07-主界面-计划@2x-透明底.png'), {
    clip: { x: g.phone.x, y: g.phone.y, width: g.phone.w, height: g.phone.h, scale: 1 },
    omitBackground: true,
  });
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 1 } });
}

/* ── 收尾 ──
   只断开 WebSocket；headless 实例保留，下次复用（不再杀进程、不再删 profile）。
   要彻底清掉它，自己按需处理：
     Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
       Where-Object { $_.CommandLine -match '--headless' -and $_.CommandLine -match 'xinggang-chrome' } |
       ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
   —— 注意匹配 user-data-dir，别误杀自己开着的浏览器。 */
console.log('\n导出完成 →', OUT);
cdp.close();
process.exit(0);

