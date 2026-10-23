// 把 three 的 ESM 构建（three.module.js + three.core.js）打包成一个经典脚本，
// 生成 window.THREE。
//
// 为什么需要：file:// 下浏览器会以 CORS 为由**拒绝加载任何 ES module**
//（<script type="module"> 和 import() 都不行），跟文件是否在同一目录无关。
// 经典 <script src> 在 file:// 下不受此限，所以双击 html 就能跑。
//
// 关键难点：两个文件各自在模块作用域里有同名顶层变量（如 _m1$1），
// 直接拼接会 "Identifier has already been declared"。
// 所以各自包进独立 IIFE：core 返回导出对象，module 以它作为入参。
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'F:/industryworks/图形界面设计/LEVEL-app/星港计划-星际探索任务APP/demo';
const core = readFileSync(`${DIR}/three.core.js`, 'utf8');
const mod = readFileSync(`${DIR}/three.module.js`, 'utf8');

/* core：export {...} → return {...}（单条聚合导出） */
function coreToFactory(src) {
  let n = 0;
  const out = src.replace(
    /^export\s*\{([\s\S]*?)\}\s*;?\s*$/gm,
    (m, names) => { n++; return `return {${names}};`; }
  );
  if (n !== 1) throw new Error(`core: 期望 1 条聚合 export，实际 ${n} 条`);
  if (/^\s*(?:import|export)\s/m.test(stripComments(out)))
    throw new Error('core: 仍有残留 ESM 语句');
  return out;
}

/* module：import {...} from './three.core.js' → const {...} = __core;
            export {...} from './three.core.js' → 跳过（core 已整体挂载）
            export {...}                        → Object.assign(THREE, {...}) */
function moduleToFactory(src) {
  let imports = 0, reexports = 0, exports_ = 0;
  let out = src;

  // ① 再导出（带 from）必须先处理，否则会被下面的聚合 export 规则吃掉
  out = out.replace(
    /^export\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?\s*$/gm,
    () => { reexports++; return '/* 再导出 core 的内容：已由 Object.assign(THREE, __core) 完成 */'; }
  );
  // ② 命名导入
  out = out.replace(
    /^import\s*\{([\s\S]*?)\}\s*from\s*['"][^'"]+['"]\s*;?\s*$/gm,
    (m, names) => { imports++; return `const {${names}} = __core;`; }
  );
  // ③ 本文件自己的聚合导出
  out = out.replace(
    /^export\s*\{([\s\S]*?)\}\s*;?\s*$/gm,
    (m, names) => { exports_++; return `Object.assign(THREE, {${names}});`; }
  );

  if (/^\s*(?:import|export)\s/m.test(stripComments(out)))
    throw new Error('module: 仍有残留 ESM 语句');
  console.log(`  module: import ${imports} / 再导出 ${reexports} / 导出 ${exports_}`);
  return out;
}

/* 去掉注释后再查顶层 await（大量 await 只出现在 JSDoc 示例里） */
function stripComments(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
}
function assertNoTopAwait(name, src) {
  const m = stripComments(src).match(/^await\s/m);
  if (m) throw new Error(`${name}: 含顶层 await，无法转经典脚本`);
  console.log(`  ${name}: 无顶层 await ✓`);
}

const coreFac = coreToFactory(core);
const modFac = moduleToFactory(mod);
console.log('  core: export 已转为 return ✓');
assertNoTopAwait('core', coreFac);
assertNoTopAwait('module', modFac);

const banner = `/* three.js r180 · MIT · Copyright 2010-2025 Three.js Authors
   由 three.module.js + three.core.js 合并为经典脚本，暴露 window.THREE。
   原因：file:// 协议下浏览器禁止加载 ES module，经典脚本不受此限。
   重新生成：node demo/build-classic.mjs
*/
`;

const bundle = `${banner}(function () {
'use strict';
var THREE = {};
var __core = (function () {
${coreFac}
})();
Object.assign(THREE, __core);
(function (__core) {
${modFac}
})(__core);
window.THREE = THREE;
})();
`;

const OUT = `${DIR}/three.bundle.js`;
writeFileSync(OUT, bundle, 'utf8');
console.log(`\n写出 ${OUT}  ${(bundle.length / 1048576).toFixed(2)} MB`);
