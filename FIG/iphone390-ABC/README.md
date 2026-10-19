# iPhone 390 线框模板 · 三套风格对照（A / B / C）

**一个文件，三种方案，36 屏**：`iphone390-wireframe.figcraft`（3 页 × 12 屏，每屏 390×844）。同一份内容、同一套令牌，只换排法与状态表达，用来比稿 / 比结构。

> 与同目录的 `LEVEL-wireframe-mcp-version/` 对照：那是「调 FigCraft MCP 建节点」的产物；本文件是「直接写 .figcraft」的产物。两条链路产出的 A 套是同一套设计，B/C 是在同一份代码上换渲染分支得到的。

---

## 1. 三套怎么区分

| | **A · 基准** | **B · 悬停与选中态强化** | **C · 抽屉式替代布局** |
|---|---|---|---|
| 定位 | 与 MCP 版 1:1 同构，作为对照锚点 | 只改「状态可读性」，布局不动 | 只改「排版骨架」，内容不动 |
| 任务列表 | 3 张独立卡 76 高 | 首卡加 **2px 描边 + 4px 外扩底** 表示 hover | **左侧时间轴**：12px 节点 + 竖线 + 96 高大卡（含时间、进度条） |
| TabBar | 选中项图标转实心 | 追加 **48×28 胶囊底** | 同 A |
| 近 7 天数据 | 7 根柱 + 周标签 | 同 A | **环形 14 段刻度** + 中心「18 / 本周完成」 + 右侧三日进度条 |
| 明细表 | 三列表格 5 行 | 同 A | **两列小卡（54 高）**，像"记录墙"而不是表格 |
| 适合场景 | 走查信息架构 | 评审交互反馈（点击/悬停是否看得见） | 评审排版骨架（列表 vs 时间轴 vs 卡片墙） |
| 页内位置 | y = 0 段 | y = 800 段 | y = 1600 段 |

三套共用同一套令牌（9 级中性灰 / 字号 28·20·17·15·13·11 / 边距 16 / 按钮 52 / 列表行 60 / 任务卡 76 / TabBar 49+34 / 状态栏 47 / Home 条 y=836），所以对比时差异只来自"排法"，不来自"视觉"。

---

## 2. 文件

| 路径 | 说明 |
|---|---|
| `iphone390-wireframe.figcraft` | **主文件**：3 页（A / B / C），每页 12 个 390×844 顶层 frame，共 2125 节点 |
| `iphone390-wireframe.fig` | .fig 交换格式（导入 Figma / FigCraft） |
| `sheet-compare.png` | **三套并排总览**（3 行 × 12 列，行底色区分 A 灰 / B 蓝灰 / C 暖灰） |
| `A/` `B/` `C/` | 各 12 张 1x 屏图（390×844） |
| `merge-report.json` | 36 帧的逐帧尺寸校验记录 |
| `sources/` | 生成脚本（`figdoc.mjs` 写盘器、`wk.mjs` 控件库、`build-json.mjs` 三套变体、`merge.mjs` 合并、`sheet-compare.mjs` 总览） |

---

## 3. 怎么改

**① 只改文案/局部**：在 FigCraft 里打开，双击任意文字层。所有图层都是原生 frame / rect / vector / text，没有实例，改哪层只动哪层。

**② 换令牌（灰阶、字号、间距）**：改 `sources/wk.mjs` 顶部的 `G / FS / R / PAD_H / CONTENT_W`，然后：

```bash
cd F:/deepseek/作业/figcraft_mcp/pixel/iphone390
node build-json.mjs A     # 生成 A 套（12 屏，单页）
node build-json.mjs B     # 生成 B 套
node build-json.mjs C     # 生成 C 套
node merge.mjs            # 三页合并成一个 .figcraft
node verify-merge.mjs     # 用引擎打开、逐帧截图、校验 390×844
node sheet-compare.mjs    # 重出对照总览
```

**③ 只加一屏**：在 `build-json.mjs` 里照现有 `// ── 0X 屏名` 段落复制一段，`mk(i)` 换下一个序号（每行 4 屏，行距 884）。

---

## 4. 直接写 .figcraft 的硬性约定（都是实测踩出来的）

这套文件不是 MCP 建出来的，是把 `.figcraft` 拆开照结构重写的。写盘格式是 ZIP：

```
document.json   （deflate）   —— 扁平 nodes 表 + parent/children 双向引用
thumbnail.png   （store）     —— 可选，仅用于文件列表预览
```

`document.json` 的关键约定（写错任意一条，引擎会「打开但丢图层」，并在 `repairs` 里报 `not under a page`）：

| 项目 | 正确写法 | 症状 |
|---|---|---|
| 顶层 frame 挂到 page | 必须有 `parent: <pageId>` | 缺了 → `cycle or detached`，整屏不显示 |
| 自己也是 page 层级 | page 节点必须有 `children: [frameId, ...]` | 缺了 → 反向引用丢失 |
| 任何节点（含 frame） | 必须有 `transform` | 缺了 → 不挂树 |
| 图层描边色 | 写在 **`strokes: [{type:'solid',color}]`** | 写进 `stroke.strokes` → 不画 |
| 虚线 | `stroke.dashes: [5,4]` | 写顶层 `dashes` 无效 |
| 圆角 | `corners.radii: [r,r,r,r]`，且 **r ≤ 短边一半** | 超过 → 按镜像半径算，整层外扩（实测头像圆角 999 让截图变 392 宽） |
| 文字水平对齐 | 图层级 **`align_h: 'center'/'right'`** | 写进 `style.text_align` / 顶层 `text_align` → 全部左对齐 |
| 行高 | `line_height: {unit:'pixels', value:22}` | 写 `{unit:'px'}` → **整份文件打不开**（`unknown variant px`） |
| 文字内容 | `characters`（不是 `text`） | 写 `text` → 空文本层 |
| 折线/箭头 | `network.regions: []` + `strokes` | regions 里给闭环 → 变成填充多边形 |
| 挖空图标 | 外圈顺时针 + 内窗 **逆时针**，同放一个 region | 同向 → 内窗被填实 |

---

## 5. 校对结果

```
用 FigCraft 引擎打开：repairs = []，layers = 2122，pages = 3
36 帧：全部 390×844（逐帧截图实测，0 例外）
坐标：全部整数
文字：854 个真 TEXT 层（MiSans 28/20/17/15/13/11）
图形：1113 矩形 + 125 矢量；无组件实例（所以 headless 渲染没有黑底问题）
```

已知限制：

1. **B 套的悬停态是"画上去的静态图"**，不是原型交互；要看真实 hover 得在 FigCraft 里做 prototype 交互。
2. 三套之间没有做成 Figma 变体（没有 Component），是三个独立页面 —— 因为直写文件不支持组件实例，做变体反而会让 headless 渲染出黑块。
3. 文字宽度是按「中文 13px ≈ 13px、半角 6.5px」估的，个别长句会按实际字宽重排 1 行，不影响版面。
