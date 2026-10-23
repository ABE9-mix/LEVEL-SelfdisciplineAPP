// 共享 CDP 会话工具 —— 复用式，绝不杀进程
//
// 为什么要有这个文件：
//   早期脚本用 `Get-Process chrome | Kill` 清场，它会杀掉**用户自己开着的浏览器**。
//   实际上并不需要：只要固定调试端口 + 固定 user-data-dir，就能跨次复用同一个
//   headless 实例；每次跑测试/导出时用 Page.navigate 让页面回到干净状态即可。
//
// 用法：
//   import { connect } from './_cdp.mjs';
//   const cdp = await connect({ url: PAGE });
//   await cdp.js('1+1');
//   cdp.close();          // 只断开 WebSocket，浏览器继续留着给下次复用
//
// 环境变量：
//   XG_CDP_PORT     调试端口（默认 9333）
//   XG_CDP_PROFILE  用户目录（默认 %TEMP%/xinggang-chrome）
//   XG_CHROME       指定浏览器可执行文件

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const DEFAULT_PORT = Number(process.env.XG_CDP_PORT || 9333);
const DEFAULT_PROFILE = process.env.XG_CDP_PROFILE || join(tmpdir(), 'xinggang-chrome');

const EXE_CANDIDATES = [
  process.env.XG_CHROME,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

const LAUNCH_ARGS = [
  '--headless=new',
  '--disable-extensions',
  '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--disable-sync', '--disable-component-update',
  '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
  '--ignore-gpu-blocklist',
  '--hide-scrollbars', '--force-color-profile=srgb',
  '--window-size=520,960',
  '--disable-features=Translate,OptimizationHints',
  'about:blank',
];

async function listTargets(port) {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/json/list`);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

/** 只连页面 target：排除扩展的 background_page / service_worker / browser_ui */
const pickPage = (list, url) => list.find(t =>
  t.type === 'page' && /^file:/.test(t.url) && t.webSocketDebuggerUrl);

/**
 * 复用或启动一个 headless 实例，返回一个已连好的 CDP 会话。
 * 已存在实例 → 直接复用；不存在 → 以 detached 方式启动（不随本脚本退出而死）。
 */
export async function connect({ url, port = DEFAULT_PORT, profile = DEFAULT_PROFILE, reload = true } = {}) {
  let list = await listTargets(port);
  let launched = false;

  if (!list) {
    const exe = EXE_CANDIDATES.find(p => existsSync(p));
    if (!exe) throw new Error('找不到 Chrome / Edge，可用 XG_CHROME 指定路径');
    mkdirSync(profile, { recursive: true });
    const child = spawn(exe, [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      ...LAUNCH_ARGS,
    ], { detached: true, stdio: 'ignore' });
    child.unref();                       // 关键：不随脚本退出而终止
    launched = true;
    for (let i = 0; i < 120 && !list; i++) { await sleep(250); list = await listTargets(port); }
    if (!list) throw new Error(`Chrome 已在 ${exe} 启动，但调试端口 ${port} 连不上`);
  }

  // 找页面；没有就新建一个
  let target = pickPage(list, url);
  if (!target) {
    const created = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url || 'about:blank')}`,
      { method: 'PUT' }).then(r => r.ok ? r.json() : null).catch(() => null);
    if (created?.webSocketDebuggerUrl) {
      target = created;
    } else {
      // 老版本 Chrome 用 GET 建页
      const c2 = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url || 'about:blank')}`)
        .then(r => r.ok ? r.json() : null).catch(() => null);
      if (c2?.webSocketDebuggerUrl) target = c2;
    }
    if (!target) throw new Error('无法创建页面 target');
  }

  // 连 WebSocket（带重试）
  let ws = null;
  for (let i = 0; i < 3 && !ws; i++) {
    try {
      const w = new WebSocket(target.webSocketDebuggerUrl);
      await new Promise((res, rej) => {
        w.onopen = res;
        w.onerror = () => rej(new Error('ws error'));
        setTimeout(() => rej(new Error('ws timeout')), 8000);
      });
      ws = w;
    } catch { await sleep(700); }
  }
  if (!ws || ws.readyState !== 1) throw new Error('WebSocket 连接失败');

  let id = 0; const pend = new Map(); const errors = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) {
      const { res, rej } = pend.get(m.id); pend.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
      return;
    }
    if (m.method === 'Runtime.exceptionThrown') {
      errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || '');
    }
  };

  const send = (method, params = {}) => {
    const mid = ++id;
    ws.send(JSON.stringify({ id: mid, method, params }));
    return new Promise((res, rej) => pend.set(mid, { res, rej }));
  };

  const js = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) {
      throw new Error('页面脚本错误: ' + (r.exceptionDetails.exception?.description || '').split('\n')[0]);
    }
    return r.result.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');

  // 回到干净状态：导航到目标 URL（复用实例时必须做，否则带着上次的状态）
  if (url && reload) {
    await send('Page.navigate', { url });
    await sleep(300);
  }

  return {
    send, js, errors,
    port, launched, profile,
    get wsUrl() { return target.webSocketDebuggerUrl; },
    /** 等页面里的某个条件成立 */
    async waitFor(expr, { tries = 80, every = 250 } = {}) {
      for (let i = 0; i < tries; i++) {
        try { if (await js(expr)) return true; } catch { /* 页面还没就绪 */ }
        await sleep(every);
      }
      return false;
    },
    /** 截图到文件 */
    async shot(path, opts = {}) {
      const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, ...opts });
      writeFileSync(path, Buffer.from(r.data, 'base64'));
      return path;
    },
    /** 只断开连接；浏览器保留，下次继续复用 */
    close() { try { ws.close(); } catch { /* 已关 */ } },
    info() {
      return launched
        ? `已启动新的 headless 实例（端口 ${port}，目录 ${profile}）—— 下次会复用它`
        : `复用已有 headless 实例（端口 ${port}）`;
    },
  };
}
