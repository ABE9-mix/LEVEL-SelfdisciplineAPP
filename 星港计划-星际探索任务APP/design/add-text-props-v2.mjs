// 按"当前文字内容"匹配，统一命名后加属性并跨变体绑定
// 原则：只给"各变体共用同一文案"的层加属性；文案由变体决定的层跳过
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
await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'props2', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

// [setId, setName, [[propName, 匹配正则, 默认值或null(取首个匹配)] ...]]
const SPEC = [
  ['887:1231', 'Bar/Nav', [['Title', /^任务详情$/, null]]],
  ['887:1234', 'Field/Input', [['Text', /^输入内容$/, null]]],
  ['887:1240', 'Block/Ring', [['Time', /^25:00$/, null]]],
  ['887:1241', 'Card/Event', [['Title', /^事件：/, null], ['Body', /^详细内容：/, null]]],
  ['887:1242', 'Card/Program', [['Title', /^8 周力量$/, null]]],
  ['887:1243', 'Card/Facility', [['Name', /^体能署$/, null]]],
  ['887:1244', 'Panel/Dialog', [['Title', /^标题$/, null], ['Body', /^说明文字/, null]]],
  ['887:1246', 'Toast', [['Text', /^记下了/, null]]],
  ['882:684', 'Card/Task', [['Time', /^\d{1,2}:\d{2}$/, null]]],
];

for (const [setId, setName, props] of SPEC) {
  const tree = await run(['node', 'tree', setId, '--depth', '8', '--ids']);
  const texts = [];
  for (const line of tree.split('\n')) {
    const m = line.match(/TEXT: (.*?) \((\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\) \[(\d+:\d+)\] "(.*)"?$/);
    if (m) texts.push({ id: m[4], content: (m[5] || '').replace(/"$/, '') });
  }
  console.log(`\n【${setName}】${setId}  文字层 ${texts.length}`);
  for (const [pname, re, fixed] of props) {
    const hit = texts.filter((x) => re.test(x.content));
    if (!hit.length) { console.log(`  - ${pname}: 无匹配，跳过`); continue; }
    const def = fixed || hit[0].content;
    const slug = pname.toLowerCase();
    for (const h of hit) await run(['node', 'rename', h.id, slug]);
    const addOut = await run(['component', 'prop', 'add', setId, pname, 'text', def]);
    const pm = addOut.match(/"([^"]+#[\d:]+)"/);
    if (!pm) { console.log(`  ! ${pname}: ${addOut.trim().slice(0, 110)}`); continue; }
    let ok = 0;
    for (const h of hit) {
      const o = await run(['component', 'prop', 'bind', setId, pm[1], h.id]);
      if (/Bound/.test(o)) ok++;
    }
    // 共享属性的值会同步到所有变体——这是预期行为（各变体本就共用同一文案，
    // 差异应由实例覆盖），因此不做"逐个还原"。
    console.log(`  + ${pname} (${pm[1]}) default="${def}"  绑定 ${ok}/${hit.length}`);
  }
}
child.kill(); process.exit(0);
