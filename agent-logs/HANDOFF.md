# Handoff

更新时间：2026-06-08 17:14:09 +08:00

## 当前状态

- 仓库：`C:\Personal\nice\code\docs`，NICE Robotics 官方产品文档站，Astro + Starlight 静态站。
- 本地分支：`main` 跟踪 `origin/main`。
- Vercel 项目：NI Corporate / `docs`，Project ID `prj_Y5hrSGAEBBI9098IzW2wcVKNsgwD`，production branch 为 `main`。
- 生产域名：`https://doc.nicerobotics.hk`。
- 本轮追加修正已完成本地实现、提交、推送和 Vercel production 验证。

## 本轮完成变更

- 顶部品牌/导航/左目录/footer 的左侧基准改为 GitBook 类似的居中外壳：`--nice-shell-edge: max(1rem, calc((100vw - 86rem) / 2))`。
- 右上角淘宝店铺按钮只显示一个 `淘` icon；正文购买按钮也只保留淘宝 icon。
- 顶部导航 active 状态恢复为正常直线下划线；左目录和右目录 active 状态只显示左侧橙色竖线。
- 左目录固定层背景改为透明，正文容器取消 `isolation`，footer 提升层级，避免 16:9 视口下白块遮挡 footer box logo。
- 首页快速索引卡片图片背景改为更淡的 `#fffaf8`，SKU 字色在浅色模式下改为黑色。
- 正文标题锚点从右侧链条 icon 改为标题左侧 `#`，并改为绝对定位，不再推动标题文字右移。
- Hint/aside 图标颜色与背景对应：灰色 note/tip 使用灰色 icon，浅黄色 caution/danger 使用黄色 icon；图标与正文第一行保持同一行对齐。
- Starlight Tabs 选中态取消橙色背景，只保留下划线。
- 右侧“在本页”目录显示文本会过滤 `购买` 和 `购买链接`，但不改变 heading slug 和链接目标。

## 验证结果

- `npm run check` 通过：0 errors，0 warnings，0 hints；仍有既有 Astro markdown deprecation 提示。
- `npm run build` 通过：生成 16 个内容页、Pagefind 索引和 sitemap；仍有既有 `Entry docs → 404 was not found.` 提示。
- `git diff --check` 通过；只有 Git 的 LF/CRLF 转换提示。
- Playwright 本地 2048×1152 验证：
  - `/transmission/gear/`：第一个正文标题 left=`644px`，后续正文 left=`644px`，`#` 锚点在标题左侧且未推动标题；note 背景 `rgb(247,247,247)`，icon `rgb(111,106,103)`。
  - `/transmission/sprocket_chain/`：caution 背景 `rgb(255,245,236)`，icon `rgb(240,138,0)`，icon 与首行中心差约 `-2.3px`。
  - `/hardware/tube_plugs/`：选中 tab 背景透明，只有 `rgb(252,80,0)` 的 inset 下划线。
  - `/wheels/silicone-wheel/`：右目录为 `2” 塑芯硅胶轮`、`3” 塑芯硅胶轮`、`4” 塑芯硅胶轮`，无 `购买` 字样。
  - 浏览器控制台错误数为 0。
- Vercel production 验证：
  - 最新 production deployment Ready，alias 包含 `https://doc.nicerobotics.hk`。
  - `https://doc.nicerobotics.hk/transmission/gear/`、`/hardware/tube_plugs/`、`/wheels/silicone-wheel/` 均返回 200。
  - Playwright 线上复测结果与本地一致：标题锚点不推动标题、hint icon 配色正确、选中 tab 背景透明、右目录无 `购买` 字样，控制台错误数为 0。

## 待处理事项

- 后续可单独处理既有构建提示：Astro markdown deprecation 和 `Entry docs → 404 was not found.`。
- 后续可跟进 `npm audit` 的 moderate vulnerabilities；不要直接 `npm audit fix --force`。

## 关键风险

- 当前视觉参数按用户截图和本地 Playwright 指标调整；不同浏览器缩放或不同超宽屏下仍建议肉眼复查旧 GitBook 对齐。
- 右目录只清洗显示文本，不改真实 heading slug；这样能避免破坏已有锚点 URL。
