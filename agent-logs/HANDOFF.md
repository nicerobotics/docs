# Handoff

更新时间：2026-06-08 22:47:17 +08:00

## 当前状态

- 仓库：`C:\Personal\nice\code\docs`，NICE Robotics 官方产品文档网站，Astro + Starlight 静态站。
- 本仓库已经作为唯一文档事实源维护，后续只通过新增或修改 `src/content/docs/**/*.mdx`、图片和下载资源更新内容。
- 旧外部同步脚本和旧字段残留已经清理；当前文档内容不再依赖外部同步仓库或旧平台语法。
- 现有 UI/UX 视觉经桌面、16:9、深色模式和移动端截图抽查，整体保持上一阶段效果。
- 页面底部横向滚动条问题已修复：页面根节点会裁掉非内容级横向溢出，宽表和公式仍保留组件内部横向滚动。
- 非快速索引的正文图片背景已改为纯白；快速索引卡片图片背景保持原样。

## 本轮完成

- 删除旧同步脚本，移除 `package.json` 中对应命令。
- 新增 `scripts/lint-content.mjs` 和 `npm run lint:content`，用于阻止旧关键词、脚手架 HTML、临时 class 写回文档内容。
- 将 frontmatter 中的旧图标字段统一为 `icon`，并让侧栏图标从内容集合读取，减少新增页面时的隐性代码映射。
- 新增 MDX 组件库：`BuyButton`、`ResourceLink`、`OnshapeLink`、`DocImage`、`SubpageGallery`、`ProductTable`、`SpecList`、`MathBlock`、`Callout`。
- 批量迁移现有 MDX：去掉内容文件中的原始布局 HTML、手写表格、图片 figure、按钮 class 和公式快照，改用封装组件。
- 重写 `README.md` 和 `AGENTS.md`，明确人类维护者和 agent 新增文档的方法、组件用法、验证命令和维护边界。
- 精简全局 CSS 中旧业务组件样式，组件样式优先放到 Astro/Tailwind 组件内；全局 CSS 主要保留布局、Starlight 覆盖和站点级视觉规则。
- 修复页面级横向滚动风险：
  - `--nice-shell-edge` 从 viewport 宽度计算改为百分比计算。
  - 右侧目录 fixed 定位从 viewport 宽度计算改为百分比计算。
  - footer 保留全宽视觉，但 padding 改用 shared shell edge。
  - `html`、`body`、`.page`、`.main-frame` 增加页面级横向裁切，避免 full-bleed 元素在 Windows 经典滚动条环境中撑出页面横向滚动条。
- 将 `DocImage` 和全局 markdown 图片兜底背景改为纯白；未修改 `SubpageGallery` 快速索引卡片背景。
- 修复正文标题后紧跟的 `BuyButton` 被折到下一行的问题：按钮增加稳定类名、不收缩和不换行约束；标题 wrapper 在紧邻购买按钮时改为同排 inline-flex。
- 最后一轮拉取五个历史源内容仓库并补同步新增内容：
  - 新增 `src/content/docs/structure/ban-cai.mdx`，迁移板材 / SRPP 复合板内容。
  - 补充滚轴系统页面中的“硅胶防滑胶带”段落、滚轴系统图纸 PDF 链接和 `NICE-D-07-05-01.pdf` 资源。
  - 将滚轴系统安装步骤中的旧居中段落改为 `DocImage` 的 `caption`，并让内容 lint 阻止后续写回 `<p align>`。
  - 首页快速索引新增 5 个入口：板材、塑芯硅胶轮、实心飞轮、硅胶软管、滚轴系统。
  - 文档 MDX 文件名统一从下划线改为连字符：`bearing-shaft`、`nut-strips`、`tube-plugs`、`sprocket-chain`。
  - 保留旧下划线路径到新连字符路径的 redirects，避免已有外链失效。

## 验证结果

- `npm run lint:content` 通过。
- 旧平台相关关键词扫描无匹配。
- `src/content/docs` 中脚手架 HTML 扫描无匹配。
- `npm run check` 通过，0 errors、0 warnings、0 hints。
- `npm run build` 通过。
- 使用 `astro preview` + Playwright 抽查 `/hardware/bearing_shaft/`，标题和紧随的购买按钮保持同一行，按钮位于标题右侧且垂直居中。
- `npm run lint:content` 通过，确认内容文件没有旧按钮 class、手写表格、手写图片、`<p align>` 等临时写法。
- `npm run check` 通过，0 errors、0 warnings、0 hints。
- `npm run build` 通过，生成 17 个内容页面；新增 `/structure/ban-cai/`，连字符新路由正常生成。
- Playwright 抽查通过：
  - `/transmission/sprocket-chain/` 的 `NICE 链轮` 标题和购买按钮同排，垂直居中误差约 1.8px。
  - `/hardware/bearing-shaft/` 的 `NICE 法兰轴承` 标题和购买按钮同排，垂直居中误差约 1.8px。
  - 首页快速索引包含板材和轮子四篇文档入口。
  - `/structure/ban-cai/` 可访问，并显示 SRPP 内容、购买按钮和产品表。
  - `/wheels/roller-system/` 包含“硅胶防滑胶带”标题、PDF 链接，且没有 `p[align]`。
- `npm run build` 通过，生成 16 个页面，Pagefind 搜索索引构建成功。
- Playwright 计算样式验证：正文图片 light/dark 背景均为 `rgb(255, 255, 255)`；快速索引图片背景仍为原卡片背景。
- 使用 `astro preview` + Playwright 抽查 `/`、`/transmission/gear/`、`/transmission/sprocket_chain/`、`/hardware/tube_plugs/`、`/hardware/bearing_shaft/`、`/structure/tube/`、`/structure/bumper/`、`/wheels/silicone-wheel/`、`/wheels/roller-system/`。
- 桌面、16:9、移动端页面级横向溢出均为 0；宽表在移动端仍能在组件内部横向滚动。
- 移动端目录按钮验证通过：侧栏正常展开，背景正常，页面级横向溢出仍为 0。
- footer 底部截图验证通过：footer 保持全宽，logo 未被遮挡，页面级横向溢出为 0。

## 已知提示

- 构建时仍有 Astro markdown 配置入口弃用提示，来源看起来在 Astro/Starlight 的内部链路或集成层，不影响当前产物。
- 构建末尾仍出现 `Entry docs → 404 was not found.` 提示；源码中未发现自定义错误路由配置，当前产物正常生成。

## 后续建议

- 新增页面时只写标准 MDX 和封装组件，不要写原始布局 HTML、临时 CSS class 或脚本。
- 如新增可下载资源，优先放到 `public/assets/docs/<section>/<page>/`，并通过 `ResourceLink` 或 `ProductTable` 引用。
- 如新增常见内容模式，先封装到 `src/components/mdx/`，再在 MDX 中使用。
- 不要随手新增页面级 `100vw`/负 margin full-bleed 写法；如确实需要全宽视觉，优先复用现有 shell 变量并验证页面级横向溢出。
- 下一轮可单独处理 Astro markdown 弃用提示和 404 构建提示；这不属于当前平台清理的阻塞项。
