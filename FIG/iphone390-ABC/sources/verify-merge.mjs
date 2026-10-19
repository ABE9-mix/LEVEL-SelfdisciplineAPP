// 校验合并文件：36 帧是否全部落在画布、有无 repairs、逐帧截图 & 逐屏尺寸
import { FigcraftMcp } from '../../mcp.mjs';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const OUT = 'F:\\deepseek\\作业\\figcraft_mcp\\out\\iphone390';
const S = OUT + '\\merge-shots';
rmSync(S, { recursive: true, force: true });
mkdirSync(S, { recursive: true });

const mcp = new FigcraftMcp({});
await mcp.initialize();
const ok = (r, w) => { if (!r.ok) throw new Error(w + ': ' + String(r.text || JSON.stringify(r.rpcError)).slice(0, 300)); return r; };
const J = async (id) => JSON.parse(ok(await mcp.call('get_node', { id }), 'g' + id).text);

try {
  const o = await mcp.cmd('file.open', { path: OUT + '\\iphone390-wireframe.figcraft' });
  const oo = JSON.parse(String(o.text));
  console.log('open repairs:', JSON.stringify(oo.repairs), 'summary:', JSON.stringify(oo.summary));
  const pages = ok(await mcp.cmd('page.list'), 'pl').json;
  console.log('pages:', pages.map((p) => `${p.id}:${p.name}(${p.children})`).join(' | '));
  const report = [];
  for (let pi = 0; pi < pages.length; pi++) {
    ok(await mcp.cmd('page.select', { index: pi }), 'sel');
    const pg = await J(pages[pi].id);
    const frames = (pg.children || []).filter((c) => String(c.type).toUpperCase() === 'FRAME');
    for (const fr of frames) {
      const b = fr.absoluteBounds;
      const s = await mcp.call('screenshot', { ids: [fr.id], scale: 1, maxSize: 8000 });
      const meta = s.imageData ? JSON.parse(String(s.text)) : null;
      const name = String(fr.name).replace(/[^\w\u4e00-\u9fa5]+/g, '_');
      if (s.imageData) writeFileSync(`${S}\\${pages[pi].name.slice(0, 1)}_${name}--1x.png`, Buffer.from(s.imageData, 'base64'));
      report.push({ page: pages[pi].name, frame: fr.name, box: `${Math.round(b.width)}×${Math.round(b.height)}`, shot: meta ? `${meta.width}×${meta.height}` : 'FAIL', at: `${Math.round(b.x)},${Math.round(b.y)}` });
    }
  }
  const bad = report.filter((r) => r.box !== '390×844' || r.shot !== '390×844');
  console.log('frames:', report.length, '尺寸不合格:', bad.length);
  if (bad.length) bad.forEach((b) => console.log('  !', b.page, b.frame, b.box, b.shot));
  writeFileSync(OUT + '\\merge-report.json', JSON.stringify(report, null, 1));
} catch (e) {
  console.log('FAILED ' + (e?.message || e));
} finally {
  mcp.close();
}
