# docs

![NICE Robotics](https://img.shields.io/badge/NICE-Robotics-F9612B?labelColor=555555&style=flat)
![Lang zh-CN](https://img.shields.io/badge/Lang-zh--CN-2DBA4E?labelColor=555555&style=flat)

本仓库用于把 NICE Robotics 旧 GitBook 文档站重写为 Astro + Starlight 文档网站，并部署到 NI Corporate Vercel。

## 项目目标

- 旧站曾使用 GitBook；由于 GitBook 原 premium 里的 Add section 功能调整到 ultimate，价格出现不可接受的跃迁，本项目目标是完全脱离付费 GitBook。
- 新站要用 Astro 和 Starlight 复刻 `https://docs.nicerobotics.hk/` 的主要体验：整体配色、Logo 位置、导航布局、按钮布局、按钮功能、黑白模式和主题色。
- 不复刻 GitBook 绑定功能中对本项目无价值的部分，例如 GitBook MCP 接入、GitBook AI 搜索和 GitBook trademark 区块。
- 默认生产域名使用 `doc.nicerobotics.hk`；旧域名 `docs.nicerobotics.hk` 的跳转或兼容策略后续单独确认。

## 推荐技术栈

- 主框架：Astro + Starlight，优先使用 Starlight 官方文档站结构、Markdown/MDX 内容和内建导航/搜索/主题能力。
- 渲染模式：首选静态输出。当前文档内容来自 Git 仓库和静态资源，默认不需要 SSR、数据库或运行时服务。
- 交互：React 19 只用于确实需要客户端状态的局部 island，例如自定义主题切换、复杂筛选或未来交互控件；普通文档内容不要 React 化。
- 构建：Vite 8 作为 Astro 的底层构建工具使用，不单独创建通用 Vite SPA。
- 类型：TypeScript。
- 样式：Tailwind CSS 4，优先使用 Starlight Tailwind 模板或 `astro add tailwind`，走 `@tailwindcss/vite`，不要使用旧的 `@astrojs/tailwind`。
- 搜索：优先使用 Starlight 内建 Pagefind 搜索；不接 GitBook AI 搜索。
- 数据与服务：默认不使用 Supabase。只有在能证明对性能、权限、持久缓存或维护效率有明显收益时，才考虑 NI Corporate Supabase。
- 部署：NI Corporate Vercel，默认域名 `doc.nicerobotics.hk`。静态 Astro 站部署到 Vercel 不需要额外 adapter；只有引入 on-demand rendering、SSR、Edge Middleware 或 ISR 时才添加 `@astrojs/vercel`。

截至 2026-06-07，本地调研到的当前版本为：Node `22.16.0`、npm `11.15.0`、Astro `6.4.4`、Starlight `0.39.3`、Vite `8.0.16`、React `19.2.7`、Tailwind CSS `4.3.0`、TypeScript `6.0.3`、create-astro `5.0.6`、Vercel CLI `54.4.1`。Astro 6 要求 Node `>=22.12.0`，当前本机满足。实际初始化项目时以当时 `npm view` 和官方文档再次校验为准。

## 内容来源

GitBook 已通过 git sync 同步到以下私有仓库，迁移时以这些仓库为事实来源，不从网页手工复制正文：

| 来源仓库 | 内容定位 | 现有页面 |
| --- | --- | --- |
| `nicerobotics/docs-home` | 首页 | 欢迎、快速索引 |
| `nicerobotics/docs-transmission` | 传动 | 齿轮、链轮 & 链条 |
| `nicerobotics/docs-hardware` | 硬件 | 方管塞、螺母条、轴承 & 轴、3D 打印嵌入件、转换套、六角内孔间隙片 |
| `nicerobotics/docs-structure` | 结构 | 管材、防撞条 |
| `nicerobotics/docs-wheel` | 轮子 | 塑芯硅胶轮、实心飞轮、硅胶软管、滚轴系统 |

源仓库中存在 GitBook 专有语法和资源结构，包括 frontmatter layout、`{% hint %}`、`{% tabs %}`、`data-view="cards"`、HTML 表格、内联购买按钮、`.gitbook/assets` 图片、PDF 和 STEP 文件。迁移时需要转换为 Starlight/MDX 组件和本地静态资源。

## 视觉基线

从 `https://docs.nicerobotics.hk/` 采样到的当前基线：

- 顶部品牌栏为橙色，主色接近 `rgb(252, 80, 0)`；NICE 白色文字 Logo 位于左上。
- 桌面端顶部品牌栏下方有横向 section 导航：`首页`、`传动`、`硬件`、`结构`；新站还需要纳入 `docs-wheel` 对应的 `轮子` 内容。
- 首页主体为居中的文档内容列，标题为 `欢迎`，二级标题为 `快速索引`。
- 快速索引是产品卡片网格；桌面约 3 列，移动端单列；卡片包含产品图、名称和 SKU。
- 右上保留 `淘宝店铺` 外链按钮和搜索入口。
- 页面右下有浅色、跟随系统、深色三种主题切换按钮；浅色背景为白色，深色背景接近 `rgb(29, 29, 29)`。
- 项目可使用 `C:\Personal\nice\code\agents\skills\nice-visual-design\assets\logos` 中的 `nice-3d.svg`、`nice-box.svg`、`nice-text.svg` 作为 Logo 来源。

## 目录

- `.agent/skills/nice-github-repo/`：当前仓库内安装的 NICE Robotics GitHub 仓库规范 skill。
- `AGENTS.md`：本仓库生效的 agent 指令。
- `agent-logs/HANDOFF.md`：交接文档，记录当前状态、最近变更、验证结果和风险。
- `README.md`：项目入口说明。

项目尚未 scaffold Astro/Starlight。后续实现时再新增 `package.json`、`src/`、`public/`、`astro.config.*`、`tsconfig.json`、`tailwind` 相关配置和迁移脚本。默认起点应是 Starlight + Tailwind 模板，而不是从通用 Astro 或 Vite 模板再手工拼文档站。

## 给人看的工具

- Git：克隆、查看和同步仓库。
- GitHub：查看主仓库与五个 GitBook sync 源仓库。
- Node.js 与 npm：初始化和运行 Astro/Starlight 项目。
- Vercel：部署到 NI Corporate 组织并绑定 `doc.nicerobotics.hk`。

## 给人看的使用方法

克隆仓库：

```powershell
git clone https://github.com/nicerobotics/docs.git
cd docs
```

开始维护前先阅读：

```text
README.md
AGENTS.md
agent-logs/HANDOFF.md
```

正式搭建前先重新确认技术栈版本：

```powershell
npm view astro version
npm view @astrojs/starlight version
npm view vite version
npm view react version
npm view tailwindcss version
npm view create-astro version
```

## 给 AI 看的工具

- Git：查看状态、提交和同步远端。
- GitHub CLI：读取 `nicerobotics/docs-*` 私有源仓库。
- ripgrep（`rg`）：搜索文档、路由和 GitBook 语法。
- PowerShell：在 Windows 工作区执行验证命令。
- Playwright：对旧站和新站做截图、DOM 与视觉回归检查。
- `.agent/skills/nice-github-repo`：维护 README 和仓库基础文档时使用的本地 skill。
- Astro MCP：当前 Codex 会话已可见 `mcp__astro_mcp.search_astro_docs`，查询 Astro/Starlight 官方文档时优先使用。

## 给 AI 看的使用方法

查看仓库状态：

```powershell
git status --short --branch
```

检查 README 一级标题数量：

```powershell
(Get-Content .\README.md -Encoding UTF8 | Select-String -Pattern '^# ').Count
```

检查 README 必要 badge：

```powershell
Select-String -Path .\README.md -Encoding UTF8 -Pattern 'NICE Robotics|Lang zh-CN'
```

只读检查源内容仓库：

```powershell
gh repo view nicerobotics/docs-home
gh repo view nicerobotics/docs-transmission
gh repo view nicerobotics/docs-hardware
gh repo view nicerobotics/docs-structure
gh repo view nicerobotics/docs-wheel
```

当前仓库尚未创建应用工程，因此没有可运行的构建、测试或部署命令。实现阶段必须补齐 `dev`、`build`、`preview` 和视觉验证命令。

## 维护规则

- README 默认使用 `zh-CN`，文件开头只保留一个一级标题，标题必须是 `docs`。
- 维护 README 和仓库基础文档时遵循 `.agent/skills/nice-github-repo/SKILL.md`。
- 每次完成对话或关键修改后，更新 `agent-logs/HANDOFF.md`，并写入带时区的更新时间。
- 不要编造产品资料、库存、价格、交期、认证、授权、兼容性或不存在的链接。
- 从 GitBook 源仓库迁移内容时，保留可验证的正文、表格、图片、PDF、STEP、Onshape 和淘宝链接；不要手工改写事实数据。
- 保持 diff 小而清晰；不要创建空目录占位。
