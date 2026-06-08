# Handoff

更新时间：2026-06-08 16:24:16 +08:00

## 当前状态

- 仓库：`C:\Personal\nice\code\docs`，NICE Robotics 官方产品文档站，Astro + Starlight 静态站。
- 本地分支：`main` 跟踪 `origin/main`。
- Vercel 项目：NI Corporate / `docs`，Project ID `prj_Y5hrSGAEBBI9098IzW2wcVKNsgwD`，production branch 为 `main`。
- 生产域名：`https://doc.nicerobotics.hk`。
- 本轮修正已完成本地实现和验证，等待提交、推送和 Vercel 生产部署确认。

## 本轮完成变更

- 顶部品牌/导航/左目录/footer 的左侧基准改为 GitBook 类似的居中外壳：`--nice-shell-edge: max(1rem, calc((100vw - 86rem) / 2))`。
- 右上角淘宝店铺按钮只显示一个 `淘` icon；正文购买按钮也只保留淘宝 icon，按钮文字通过 CSS 隐藏但保留原始链接文本。
- 顶部导航 active 状态恢复为正常直线下划线，不再出现带弧线的背景；hover 仍保留渐变背景。
- 左目录和右目录 active 状态只显示左侧橙色竖线，背景保持透明；右目录条目左侧内缩，竖线重新出现在组件内。
- 左目录固定层背景改为透明，正文容器取消 `isolation`，footer 提升层级，避免 16:9 视口下白块遮挡 footer box logo。
- footer 保持全宽，box logo 左侧对齐左目录左侧。
- 首页快速索引卡片图片背景改为更淡的 `#fffaf8`，深色模式为 `#252321`；SKU 字色在浅色模式下改为黑色。
- 正文标题锚点从右侧链条 icon 改为标题左侧 `#`，hover 时出现，间距约 14px。

## 验证结果

- `npm run check` 通过：0 errors，0 warnings，0 hints；仍有既有 Astro markdown deprecation 提示。
- `npm run build` 通过：生成 16 个内容页、Pagefind 索引和 sitemap；仍有既有 `Entry docs → 404 was not found.` 提示。
- `git diff --check` 通过；只有 Git 的 LF/CRLF 转换提示。
- Playwright 本地 2048×1152 验证 `/transmission/sprocket_chain/`：
  - logo、首个导航 icon、左目录、footer logo 左侧均为 `336px`。
  - footer logo 位置未被左目录层遮挡。
  - 顶部 active 下划线高度 `2px`、圆角 `0px`。
  - 右 TOC active 竖线宽度 `2px`，位置在条目内。
  - 淘宝店铺按钮无可见文字，购买按钮可见宽度约 `32px`，icon 约 `17.27px`。
  - 正文标题锚点 hover 后显示在标题左侧，内容为 `#`，与标题间距约 `14px`。
  - 浏览器控制台错误数为 0。
- Playwright 本地验证首页 `/`：快速索引图片背景为 `rgb(255, 250, 248)`，SKU 字色为 `rgb(29, 29, 29)`。

## 待处理事项

- 提交并推送本轮改动，然后确认 Vercel production Ready 且 `https://doc.nicerobotics.hk` 可访问。
- 后续可单独处理既有构建提示：Astro markdown deprecation 和 `Entry docs → 404 was not found.`。
- 后续可跟进 `npm audit` 的 moderate vulnerabilities；不要直接 `npm audit fix --force`。

## 关键风险

- 当前视觉参数按本轮用户截图和 2048×1152 本地验证调整；不同浏览器缩放或不同超宽屏下仍建议肉眼复查旧 GitBook 对齐。
- 正文购买按钮只隐藏文字并保留 DOM 文本，利于可访问性和链接语义；如果后续要求完全无文本 DOM，需要再改组件生成逻辑。
