// 合并三页到一个文件：A 基准 / B 悬停态 / C 抽屉式（各自 12 屏，横向并排放在同一页的不同行）
import { FigDoc, readFigcraft } from './figdoc.mjs';
import { writeFileSync } from 'node:fs';

const OUT = 'F:\\deepseek\\作业\\figcraft_mcp\\out\\iphone390';
const SRC = {
  A: OUT + '\\iphone390-wireframe-A.figcraft',
  B: OUT + '\\iphone390-wireframe-B.figcraft',
  C: OUT + '\\iphone390-wireframe-C.figcraft',
};
const DST = OUT + '\\iphone390-wireframe.figcraft';

const doc = new FigDoc('LEVEL · iPhone 390 线框模板（A 基准 / B 悬停态 / C 抽屉式）');
const nodes = {};
let nextId = 1;
const pageIds = [];

const NAMES = { A: 'A · 基准（与 MCP 版同构）', B: 'B · 悬停与选中态强化', C: 'C · 抽屉式替代布局' };
const OFFSET_Y = { A: 0, B: 800, C: 1600 };   // 同一页内三段，避免三页之间来回跳

for (const k of ['A', 'B', 'C']) {
  const src = readFigcraft(SRC[k]).json;
  const pageSrc = src.nodes[String(src.pages[0])];
  const pageId = nextId++;
  const map = new Map();
  map.set(pageSrc.id, pageId);
  const assign = (id) => { const n = src.nodes[String(id)]; if (!map.has(id)) map.set(id, nextId++); for (const c of n.children || []) assign(c); };
  assign(pageSrc.id);
  const write = (id, parentId) => {
    const n = src.nodes[String(id)];
    const copy = { ...n, id: map.get(id) };
    if (parentId) copy.parent = parentId;
    if (n.children) copy.children = n.children.map((c) => map.get(c));
    if (n.type === 'frame' && !parentId) {
      const t = n.transform || [1, 0, 0, 1, 0, 0];
      copy.transform = [1, 0, 0, 1, t[4], t[5] + OFFSET_Y[k]];
    }
    nodes[String(copy.id)] = copy;
    for (const c of n.children || []) write(c, copy.id);
  };
  const pageCopy = {
    id: pageId, name: NAMES[k], type: 'page', background: pageSrc.background,
    flows: [], prototype: pageSrc.prototype, guides: [], children: [], width: 0, height: 0,
  };
  nodes[String(pageId)] = pageCopy;
  for (const c of pageSrc.children || []) { write(c, pageId); pageCopy.children.push(map.get(c)); }
  pageIds.push(pageId);
}

doc.nodes = nodes;
doc.pageIds = pageIds;
doc.next = nextId;
const res = doc.save(DST);
const all = Object.values(nodes);
console.log('merged →', DST, JSON.stringify(res));
console.log('pages:', pageIds.map((p) => nodes[String(p)].name + ' (' + nodes[String(p)].children.length + ' frames)').join(' | '));
console.log('totals:', JSON.stringify({
  nodes: all.length,
  frames: all.filter((n) => n.type === 'frame').length,
  rects: all.filter((n) => n.type === 'rectangle').length,
  texts: all.filter((n) => n.type === 'text').length,
  vectors: all.filter((n) => n.type === 'vector').length,
}));
writeFileSync(OUT + '\\merged-stats.json', JSON.stringify({ pages: pageIds.length, totals: { nodes: all.length } }, null, 1));
