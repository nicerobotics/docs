# AGENTS.md

## 仓库定位

本仓库是 NICE Robotics 官方产品文档网站的 Astro + Starlight 重写工程，用于替代旧 GitBook 文档站并脱离付费 GitBook 功能限制。

## 沟通规则

- 默认用中文沟通，回答简洁、直接、具体。
- 不确定时标明置信度：高 / 中 / 低 / 未知。
- 不编造事实、接口、配置、命令、依赖、路径、日期或数据。
- 如果用户或自己的判断不对，直接指出原因。

## 修改前必须做

- 先查看 `agent-logs/HANDOFF.md`，理解当前状态、最近变更、未完成事项和风险。
- 查看 `git status --short --branch`，区分已有改动和本任务改动。
- 维护 README、仓库说明或 GitHub 仓库基础文档时，使用 `.agent/skills/nice-github-repo/SKILL.md`。
- 不要把本仓库需要的 skill 安装到全局；本仓库使用 `.agent/skills/`。

## 项目目标

- 用 Astro 和 Starlight 复刻 `https://docs.nicerobotics.hk/` 的主要体验。
- 复刻范围包括整体配色、Logo 位置、导航布局、按钮布局、按钮功能、黑白模式和主题色。
- 不复刻 GitBook MCP 接入、GitBook AI 搜索、GitBook trademark 等 GitBook 特有功能。
- 默认部署到 NI Corporate Vercel，默认生产域名为 `doc.nicerobotics.hk`。

## 技术栈约束

- 首选 Astro 推荐栈，不机械套用其他公司 Web app 技术栈。
- 主框架使用 Astro + Starlight；内容优先使用 Markdown/MDX 和 Starlight content collection。
- 默认使用静态输出；当前文档站没有数据库和运行时服务需求。
- React 19 只用于确实需要客户端状态的局部 island；不要把整站做成 React SPA。
- Vite 8 作为 Astro 底层构建工具使用；不要单独创建通用 Vite app。
- TypeScript 必须使用。
- 样式使用 Tailwind CSS 4；优先使用 Starlight Tailwind 模板或 `astro add tailwind`，通过 `@tailwindcss/vite` 接入，不使用旧 `@astrojs/tailwind`。
- 搜索优先使用 Starlight 内建 Pagefind；不要接 GitBook AI 搜索。
- 默认不引入 Supabase。只有能证明对性能、权限、持久缓存或维护效率有明显收益时才引入。
- 如确实引入 Supabase，使用 NI Corporate Supabase，并优先通过 Vercel Supabase Integration 同步环境变量和项目连接。
- 部署目标是 NI Corporate Vercel；不要默认部署到个人 Vercel 账号或其他组织。
- 静态 Astro 站部署到 Vercel 不需要额外 adapter；只有引入 on-demand rendering、SSR、Edge Middleware 或 ISR 时才添加 `@astrojs/vercel`。

## MCP 与工具

- 当前 Codex 会话已可见 Astro MCP：`mcp__astro_mcp.search_astro_docs`。
- 查询 Astro/Starlight 官方文档时优先使用 Astro MCP。
- 当前可用的 Vercel MCP 可用于查询 Vercel 官方文档和后续部署检查。
- 不要为了“看起来完整”安装不需要的 MCP、CLI 或服务；需要时可以安装，安装后要说明用途和是否改变项目文件。

## 内容来源

- `nicerobotics/docs-home`：首页、欢迎、快速索引。
- `nicerobotics/docs-transmission`：齿轮、链轮 & 链条。
- `nicerobotics/docs-hardware`：方管塞、螺母条、轴承 & 轴、3D 打印嵌入件、转换套、六角内孔间隙片。
- `nicerobotics/docs-structure`：管材、防撞条。
- `nicerobotics/docs-wheel`：塑芯硅胶轮、实心飞轮、硅胶软管、滚轴系统。

这些仓库是 GitBook git sync 的事实来源。迁移时不要从网页手工复制正文，不要臆造缺失的 SKU、链接、规格或资源。

## 迁移规则

- 迁移 GitBook frontmatter、`SUMMARY.md`、正文、表格、图片、PDF、STEP、Onshape 和淘宝链接。
- 将 GitBook 专有语法转换为 Starlight/MDX 组件：`hint` 转 Aside/Callout，`tabs` 转 Tabs，`data-view="cards"` 转产品卡片组件，内联 `<a class="button primary">` 转购买按钮组件。
- `.gitbook/assets` 中的资源必须复制到新站静态资源目录并修正引用；不要依赖 GitBook CDN。
- 保留旧站关键 URL 或提供显式 redirect，尤其是 `/`、`/transmission`、`/transmission/gear`、`/transmission/sprocket_chain`、`/hardware`、`/hardware/tube_plugs`、`/hardware/nut_strips`、`/hardware/bearing_shaft`、`/hardware/insert`、`/hardware/adapter`、`/structure`、`/structure/tube`、`/structure/bumper`。
- `docs-wheel` 内容需要纳入新站导航，section 名称为 `轮子`。

## 视觉规则

- 主色使用旧站橙色基线，接近 `rgb(252, 80, 0)`；NICE 品牌 SVG 原始橙色为 `#f9612b` / `#f76531`。
- 复用或转换以下 Logo 来源：`C:\Personal\nice\code\agents\skills\nice-visual-design\assets\logos\nice-3d.svg`、`nice-box.svg`、`nice-text.svg`。
- 顶部品牌栏、二级 section 导航、右上淘宝店铺按钮、搜索入口、右下三态主题切换、首页快速索引卡片网格都属于必须复刻的核心交互。
- 深色模式要实测，旧站深色背景接近 `rgb(29, 29, 29)`。
- 页面不能保留 GitBook trademark 区块。

## 验证规则

- 实现阶段必须能运行 `npm run build`。
- 实现阶段必须用 Playwright 截图对比旧站和新站，至少覆盖桌面与移动视口、浅色与深色模式。
- 实现阶段必须验证主要旧 URL、导航、搜索入口、淘宝按钮、购买按钮、资源下载链接和主题切换。
- 不要只检查首页；至少抽查传动、硬件、结构、轮子各一个页面。

## Git 与交接规则

- 保持 diff 小而清晰，不做与当前任务无关的重构或目录整理。
- 禁止未经授权使用 `git reset --hard`、`git checkout --`、批量删除等破坏性命令。
- 每次完成对话或关键修改后，更新 `agent-logs/HANDOFF.md`。
- handoff 必须包含更新时间，格式包含时区、年、月、日和秒，例如：`2026-06-07 23:10:35 +08:00`。
- handoff 应简洁说明当前状态、刚完成的变更、验证结果、未完成事项和关键风险。

## README 规则

- `README.md` 默认使用 `zh-CN`。
- `README.md` 文件开头只能有一个一级标题，标题必须是 `docs`。
- 一级标题下方必须包含 `NICE Robotics` 和 `Lang zh-CN` badge。
- README 必须区分“给人看的工具/使用方法”和“给 AI 看的工具/使用方法”。
