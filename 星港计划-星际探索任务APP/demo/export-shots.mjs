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
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const ROOT = 'F:/industryworks/图形界面设计/LEVEL-app/星港计划-星际探索任务APP';
const OUT = join(ROOT, 'design/三维截图');
const PAGE = 'file:///F:/industryworks/' + encodeURIComponent('图形界面设计') + '/LEVEL-app/'
  + encodeURIComponent('星港计划-星际探索任务APP') + '/demo/'
  + encodeURIComponent('主页面三维演示.html');
const PORT = 9413;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PROFILE = join(process.env.TEMP, 'pxexport_' + Date.now());

const sleep = ms => new Promise(r => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

/* ── 启动 Chrome：直接带目标 URL，确保 page target 就是我们的页面 ── */
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  '--disable-extensions',
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-sync', '--disable-component-update',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--ignore-gpu-blocklist',
  '--hide-scrollbars', '--force-color-profile=srgb',
  '--window-size=520,960',
  PAGE,
], { stdio: 'ignore' });

/* ── 连 CDP：等出现 url 匹配目标页的 page target，再连 ── */
async function findTarget() {
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (r.ok) {
        const l = await r.json();
        // 只认 page，且 url 是 file: 开头（排除扩展的 background_page / service_worker）
        const t = l.find(t => t.type === 'page' && /^file:/.test(t.url) && t.webSocketDebuggerUrl);
        if (t) return t;
      }
    } catch { /* 未就绪 */ }
    await sleep(250);
  }
  throw new Error('未找到目标页面 target');
}

const target = await findTarget();
console.log('已连上页面');

let ws;
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = () => rej(new Error('ws error'));
      setTimeout(() => rej(new Error('ws timeout')), 8000);
    });
    break;
  } catch (e) {
    console.log(`  连接重试 ${attempt + 1}: ${e.message}`);
    await sleep(700);
  }
}
if (!ws || ws.readyState !== 1) throw new Error('WebSocket 连接失败');

let id = 0; const pend = new Map();
ws.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) {
    const { res, rej } = pend.get(m.id); pend.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
};
const send = (method, params = {}) => {
  const mid = ++id;
  ws.send(JSON.stringify({ id: mid, method, params }));
  return new Promise((res, rej) => pend.set(mid, { res, rej }));
};
const js = async e => {
  const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('页面脚本错误: ' + (r.exceptionDetails.exception?.description || ''));
  return r.result.value;
};
const shot = async (path, opts = {}) => {
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, ...opts });
  writeFileSync(path, Buffer.from(r.data, 'base64'));
  console.log('  ✓', path.slice(OUT.length + 1));
};

await send('Runtime.enable');
await send('Page.enable');

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
}

/* ── 3. 透明底整屏 ── */
{
  const g = await prepare(2);
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

/* ── 收尾 ── */
console.log('\n导出完成 →', OUT);
ws.close();
try { chrome.kill(); } catch {}
await sleep(400);
try { rmSync(PROFILE, { recursive: true, force: true }); } catch {}
process.exit(0);

