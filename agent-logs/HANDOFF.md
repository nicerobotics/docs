# Handoff

更新时间：2026-06-08 00:33:59 +08:00

## 当前状态

- 仓库 `C:\Personal\nice\code\docs` 已从空仓库推进为 Astro + Starlight 静态文档站。
- 本地分支 `main` 跟踪 `origin/main`；当前实现已提交并推送到远端。
- `nice-github-repo` 已安装在仓库内 `.agent/skills/nice-github-repo`，没有安装到全局。
- Vercel 项目已创建并绑定：NI Corporate / `docs`，Project ID `prj_Y5hrSGAEBBI9098IzW2wcVKNsgwD`。
- 当前生产部署已 READY：`https://docs-lyart-iota.vercel.app`，最近一次 deployment ID `dpl_A1orVtUAqTFCj91zX3MCwjFuWaWy`。
- `doc.nicerobotics.hk` 已添加到 Vercel 项目，但尚未验证，等待阿里云 DNS 记录生效。
- 本地 dev/preview 服务已停止，浏览器测试视口已重置。

## 已完成变更

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

- `npm run sync:content` 通过，生成 15 个页面。
- `npm run check` 通过：0 errors，0 warnings，0 hints。
- `npm run build` 通过，生成 16 个内容页面、4 个 section redirect HTML、Pagefind 索引和 sitemap。
- 构建有两个非阻塞提示：Astro markdown remark/rehype deprecation；`Entry docs → 404 was not found.` 但构建 exit code 为 0。
- 已扫描 `src/content/docs`，没有 `/assets/docs/missing`、`.gitbook/assets`、`{% ... %}`、`data-view=`、旧 `docs.nicerobotics.hk` 链接残留。
- 已用浏览器检查本地桌面和移动端、浅色和深色模式；移动端淘宝按钮与菜单不再重叠。
- 已在生产域名验证：
  - `/`、`/transmission/gear/`、`/hardware/tube_plugs/`、`/structure/tube/`、`/wheels/silicone-wheel/` 返回 200。
  - `/pagefind/pagefind.js` 返回 200。
  - `/transmission`、`/hardware`、`/structure`、`/wheels` 返回 307 到对应首篇页面。
  - `/assets/docs/transmission/parameter%20%281%29.png` 返回 200。
  - `/transmission/sprocket_chain/` 页面内无 `/assets/docs/missing`，购买链接数量为 6。

## 待处理事项

- 用户需要在阿里云 DNS 为 `nicerobotics.hk` 添加 Vercel 验证记录：
  - 类型：TXT
  - 主机记录：`_vercel`
  - 记录值：`vc-domain-verify=doc.nicerobotics.hk,e10e5bd8cc4e8bfa7182`
- 验证 TXT 生效后，为访问域名添加 CNAME：
  - 类型：CNAME
  - 主机记录：`doc`
  - 记录值：`1af47c2c9938dd40.vercel-dns-016.com.`
  - 备选记录值：`cname.vercel-dns.com.`
- DNS 生效后执行 `vercel api /v9/projects/docs/domains/doc.nicerobotics.hk/verify --scope ni-corporate -X POST` 或在 Vercel Dashboard 点击 verify。

## 关键风险

- 当前 `doc.nicerobotics.hk` 未验证，所以生产访问暂时使用 `https://docs-lyart-iota.vercel.app`。
- `npm audit` 报 5 个 moderate vulnerabilities，来源在 `@astrojs/check` 的语言服务/YAML 依赖链；不要盲目执行 `npm audit fix --force`。
- 构建提示 `Entry docs → 404 was not found.` 尚未定位根因，但目前不影响构建、部署或主要路由访问。
