// 给组件补文字属性：先统一文字层名，再加属性并跨变体绑定
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

await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'props', version: '1' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');

// [setId, setName, [ [propName, default, [textLayerIds]] ... ]]
const PLAN = [
  ['882:682', 'Chip/Status', [['Label', '状态', ['881:550', '881:554', '881:558', '881:562']]]],
  ['882:685', 'Card/Knowledge', [
    ['Body', '卡片正文', ['881:640', '881:648']],
    ['Code', 'TIM-006', ['881:641', '881:649']],
    ['ChipLabel', '新获得', ['881:644', '881:652']],
  ]],
  ['882:681', 'Btn/Status', [
    ['LabelEn', 'LAUNCH', ['881:540', '881:544']],
    ['LabelZh', '发射', ['881:541', '881:545']],
  ]],
];

for (const [setId, setName, props] of PLAN) {
  console.log(`\n【${setName}】${setId}`);
  for (const [pname, def, layers] of props) {
    // 1) 统一文字层名（Figma 靠层名跨变体共享属性）
    const slug = pname.toLowerCase();
    for (const lid of layers) await run(['node', 'rename', lid, slug]);
    // 2) 加属性
    const addOut = await run(['component', 'prop', 'add', setId, pname, 'text', def]);
    const pm = addOut.match(/"([^"]+#[\d:]+)"/);
    if (!pm) { console.log(`  ! add ${pname}: ${addOut.trim().slice(0, 120)}`); continue; }
    const full = pm[1];
    // 3) 绑定每个变体的文字层
    let ok = 0;
    for (const lid of layers) {
      const o = await run(['component', 'prop', 'bind', setId, full, lid]);
      if (/Bound/.test(o)) ok++;
      else console.log(`    ! bind ${lid}: ${o.trim().slice(0, 100)}`);
    }
    console.log(`  ${pname} (${full}) default="${def}"  绑定 ${ok}/${layers.length}`);
  }
  const list = await run(['component', 'prop', 'list', setId]);
  list.split('\n').forEach((l) => { if (l.trim() && !/^"ComponentSet"/.test(l.trim())) console.log('   ' + l.trim()); });
}
child.kill(); process.exit(0);
