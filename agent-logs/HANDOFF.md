# Handoff

更新时间：2026-06-08 10:25:26 +08:00

## 当前状态

- 仓库：`C:\Personal\nice\code\docs`，NICE Robotics 官方产品文档站，Astro + Starlight 静态站。
- 本地分支：`main` 跟踪 `origin/main`。
- `nice-github-repo` 安装在仓库内 `.agent/skills/nice-github-repo`，不要安装到全局。
- Vercel 项目：NI Corporate / `docs`，Project ID `prj_Y5hrSGAEBBI9098IzW2wcVKNsgwD`，GitHub 仓库连接为 `nicerobotics/docs`，production branch 为 `main`。
- 生产域名：`https://doc.nicerobotics.hk`，Vercel DNS CNAME 为 `1af47c2c9938dd40.vercel-dns-016.com.`。
- 本轮第三轮视觉调整已完成并通过本地验证；当前临时 preview 服务已停止。

## 本轮完成变更

- 新增依赖 `@lucide/astro`，将 `NiceIcon` 从手写 SVG path 改为 Lucide Astro 组件映射。
- 新增 `NiceTableOfContents` / `NiceTableOfContentsList`，右侧“在本页”目录使用库图标并保留滚动高亮逻辑。
- 顶部二级导航移除左侧 box logo，仅保留分类入口。
- Footer 左侧只保留 box logo，版权文字改为居中布局，联系方式保留在右侧。
- `NiceTwoColumnContent` 区分有无 TOC：首页无侧边目录时不再预留右侧空列，内容居中；正文页右侧目录在宽屏固定悬浮。
- 正文内容宽度从 `42.5rem` 增加到 `47.5rem`，右侧目录宽度收窄到 `13.25rem`。
- 宽屏左侧目录从窗口边缘向内收，右侧目录去掉左侧竖线。
- 首页快速索引卡片文字逐行居中。
- Starlight aside/hint 保留开头小图标，但将 `Note` / `Caution` 这类标题文字视觉隐藏。
- Onshape 地球图标从手写 data URI mask 改为引用 Lucide 来源的 `public/assets/ui/lucide-globe.svg`。

## 验证结果

- `npm run sync:content` 通过，同步 15 个 GitBook 来源页面；本轮没有产生内容页 diff。
- `npm run check` 通过：0 errors，0 warnings，0 hints。
- `npm run build` 通过：生成 16 个内容页、4 个 section redirect HTML、Pagefind 索引和 sitemap。
- 构建仍有既有非阻断提示：Astro markdown remark/rehype deprecation，以及 `Entry docs → 404 was not found.`。
- 浏览器本地 preview 验证：
  - 桌面 2048px 首页：无 sidebar/TOC，主内容中心偏差约 7px，顶部 `.nice-section-mark` 数量为 0。
  - 桌面 2048px `/hardware/tube_plugs/`：正文宽度 token 为 `47.5rem`，正文实际宽度 760px；左目录 x=152px；右目录 `position: fixed`、宽 212px、左竖线 0px，滚动后仍可见。
  - 移动 390px 首页：无 sidebar/TOC，内容中心偏差约 7px，快速索引文字居中。
  - `/transmission/sprocket_chain/` aside：标题容器 `display:flex`，标题字号 0px，小图标约 17.6px，未移除图标。
  - 浏览器控制台错误数 0。
- 临时 preview 进程和日志已清理，浏览器视口已重置。

## 待处理事项

- 推送后需要等待 Vercel 自动部署，并复查 `https://doc.nicerobotics.hk`。
- 可后续定位构建中的 `Entry docs → 404 was not found.` 提示来源。
- 可后续跟进 `npm audit` 的 5 个 moderate vulnerabilities；不要直接 `npm audit fix --force`。

## 关键风险

- `@lucide/astro` 是新依赖，已通过本地 check/build/browser 验证，但生产部署后仍需确认 Vercel 构建环境安装正常。
- 右侧目录在 `>=88rem` 使用 fixed 定位；已验证 2048px 宽屏，后续如继续微调超宽屏布局，需要复查该定位公式。
