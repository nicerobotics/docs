# Handoff

更新时间：2026-06-08 01:20:50 +08:00

## 当前状态

- 仓库 `C:\Personal\nice\code\docs` 已从空仓库推进为 Astro + Starlight 静态文档站。
- 本地分支 `main` 跟踪 `origin/main`；当前实现已提交并推送到远端。
- `nice-github-repo` 已安装在仓库内 `.agent/skills/nice-github-repo`，没有安装到全局。
- Vercel 项目已创建并绑定：NI Corporate / `docs`，Project ID `prj_Y5hrSGAEBBI9098IzW2wcVKNsgwD`。
- Vercel 项目已连接 GitHub 仓库 `nicerobotics/docs`，production branch 为 `main`。
- 当前生产部署已 READY：`https://doc.nicerobotics.hk` 和 `https://docs-lyart-iota.vercel.app`，最近一次 deployment ID `dpl_A1orVtUAqTFCj91zX3MCwjFuWaWy`。
- `doc.nicerobotics.hk` 已添加到 Vercel 项目并验证通过，当前通过 CNAME 指向 `1af47c2c9938dd40.vercel-dns-016.com.`。
- 本地 dev/preview 服务已停止，浏览器测试视口已重置。

## 已完成变更

- 本轮完成 GitHub ↔ Vercel 项目连接：`link.type=github`、`org=nicerobotics`、`repo=docs`、`productionBranch=main`。
- 本轮完成视觉还原改造：搜索移到右侧并隐藏快捷键显示、顶部淘宝按钮加入 icon、主题切换改为小灯泡按钮、favicon 改为用户提供的 PNG、首页改为 splash 无侧边栏/TOC。
- 本轮新增 Starlight route middleware，产品页左侧 sidebar 只显示当前栏目，右侧 TOC 删除 Overview，移动端禁用固定 TOC。
- 本轮新增自定义 footer、页面标题 emoji、移动菜单 footer、中文 i18n，禁用 prev/next pagination。
- 本轮更新 `scripts/sync-gitbook.mjs`，从 GitBook frontmatter 的 `icon:` 生成 `emoji:`，并让首页生成 `template: "splash"`。
- 本轮调整全局 CSS：正文宽度接近旧站、深色正文为白色、正文图片居中无外框、首页卡片图片铺满图框、购买按钮加入淘宝 icon、Note/Caution 隐藏标题并重设背景色。
- 使用 Astro 6 + Starlight 0.39 搭建文档站，默认静态输出，不引入 Supabase。
- 使用 Tailwind CSS 4 + `@tailwindcss/vite` 接入样式；未强行使用 standalone Vite 8，避免与 Astro 内部 Vite 版本冲突。
- 自定义 Starlight header，复刻旧站橙色品牌栏、Logo、section nav、搜索入口、淘宝店铺按钮和主题切换入口。
- 复制 NICE Robotics 三个 SVG Logo 到 `src/assets/logos/`。
- 新增 `scripts/sync-gitbook.mjs`，从 5 个 GitBook sync 源仓库同步并转换内容。
- 已迁移 15 个 MDX 页面到 `src/content/docs/`，包含首页、传动、硬件、结构、轮子。
- 已复制 144 个静态资源到 `public/assets/docs/`。
- 转换了 GitBook `hint`、`tabs`、card table、内联购买按钮、旧站链接和 `.gitbook/assets` 引用。
- 修复了带括号文件名资源路径转换问题，例如 `parameter (1).png`。
- 新增 `vercel.json`，让 `/transmission`、`/hardware`、`/structure`、`/wheels` 在 Vercel 层返回 307 redirect。
- Vercel 项目设置已改为 `framework=astro`、`buildCommand=npm run build`、`outputDirectory=dist`、`installCommand=npm install`。

## 验证结果

- 本轮 `vercel git connect https://github.com/nicerobotics/docs.git --scope ni-corporate` 成功；Vercel API 确认项目 `link` 指向 `nicerobotics/docs`。
- 本轮 `npm run sync:content` 通过，生成 15 个页面，并为首页/产品页写入 `emoji` frontmatter。
- 本轮 `npm run check` 通过：0 errors，0 warnings，0 hints。
- 本轮 `npm run build` 通过，生成 16 个内容页面、4 个 section redirect HTML、Pagefind 索引和 sitemap。
- 本轮本地 preview 验证：`/` 无 sidebar/TOC；`/transmission/gear/` 左侧只显示“齿轮 / 链轮 & 链条”；`/wheels/silicone-wheel/` 左侧只显示轮子栏目；右侧标题为“在本页”且无 Overview；footer 无 prev/next。
- 本轮本地 preview 验证：顶部淘宝按钮和购买按钮都有淘宝 icon；正文图片 border 为 0 且背景透明；首页卡片图片 padding 为 0；favicon link 指向 `/favicon.png`；移动端顶部导航不溢出。
- 本轮本地 preview 验证：深色模式正文颜色为 `rgb(255, 255, 255)`，背景为 `rgb(29, 29, 29)`；Note 标题隐藏，深色 Note 背景为 `rgb(43, 43, 43)`。
- `npm run sync:content` 通过，生成 15 个页面。
- `npm run check` 通过：0 errors，0 warnings，0 hints。
- `npm run build` 通过，生成 16 个内容页面、4 个 section redirect HTML、Pagefind 索引和 sitemap。
- 构建有两个非阻塞提示：Astro markdown remark/rehype deprecation；`Entry docs → 404 was not found.` 但构建 exit code 为 0。
- 已扫描 `src/content/docs`，没有 `/assets/docs/missing`、`.gitbook/assets`、`{% ... %}`、`data-view=`、旧 `docs.nicerobotics.hk` 链接残留。
- 已用浏览器检查本地桌面和移动端、浅色和深色模式；移动端淘宝按钮与菜单不再重叠。
- 已在生产域名验证：
  - `https://doc.nicerobotics.hk/` 返回 200。
  - `https://doc.nicerobotics.hk/transmission` 返回 307 到 `/transmission/gear/`。
  - `https://doc.nicerobotics.hk/pagefind/pagefind.js` 返回 200。
  - `https://docs-lyart-iota.vercel.app/`、`/transmission/gear/`、`/hardware/tube_plugs/`、`/structure/tube/`、`/wheels/silicone-wheel/` 返回 200。
  - `/pagefind/pagefind.js` 返回 200。
  - `/transmission`、`/hardware`、`/structure`、`/wheels` 返回 307 到对应首篇页面。
  - `/assets/docs/transmission/parameter%20%281%29.png` 返回 200。
  - `/transmission/sprocket_chain/` 页面内无 `/assets/docs/missing`，购买链接数量为 6。
  - Vercel domain config 显示 `misconfigured: false`。

## 待处理事项

- 本轮视觉还原清单已实现并通过本地验证；后续如用户指出新的旧站差异，再继续按截图/DOM 对齐。
- 推送后需要确认 Vercel Git 集成自动生产部署完成，并更新生产 deployment ID。
- 可后续优化：定位构建中的 `Entry docs → 404 was not found.` 提示来源。
- 可后续优化：跟进 `@astrojs/check` 依赖链的 `npm audit` moderate vulnerabilities，不要直接 `npm audit fix --force`。

## 关键风险

- `npm audit` 报 5 个 moderate vulnerabilities，来源在 `@astrojs/check` 的语言服务/YAML 依赖链；不要盲目执行 `npm audit fix --force`。
- 构建提示 `Entry docs → 404 was not found.` 尚未定位根因，但目前不影响构建、部署或主要路由访问。
