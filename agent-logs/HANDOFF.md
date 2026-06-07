# Handoff

更新时间：2026-06-07 23:37:08 +08:00

## 当前状态

- 当前目录 `C:\Personal\nice\code\docs` 已初始化为 `nicerobotics/docs.git` 的本地仓库。
- 本地分支 `main` 已跟踪 `origin/main`。
- `nice-github-repo` 已安装到本仓库 `.agent/skills/nice-github-repo`。
- 误安装到全局 `C:\Users\Rocky\.codex\skills\nice-github-repo` 的目录已删除。
- README 和 AGENTS 已更新为 Astro + Starlight 重写 GitBook 文档站的项目 brief 与执行约束，当前尚未提交。
- 已根据用户补充要求改为以 Astro/Starlight 官方推荐栈为主，不机械套用 React/Vite/Supabase 组合。
- 当前 Codex 会话已可见 Astro MCP：`mcp__astro_mcp.search_astro_docs`。
- 本轮用户要求查看详细工作计划；尚未开始 scaffold 或迁移实现。

## 刚完成的变更

- 调研旧站 `https://docs.nicerobotics.hk/`：确认橙色品牌栏、白色 NICE Logo、横向 section 导航、淘宝店铺按钮、搜索入口、右下三态主题切换、首页快速索引卡片网格。
- 使用 Playwright 采样视觉基线：主色约 `rgb(252, 80, 0)`，浅色背景白色，深色背景约 `rgb(29, 29, 29)`，桌面首页卡片约 3 列，移动端单列。
- 只读浅克隆并检查五个 GitBook sync 源仓库：`docs-home`、`docs-transmission`、`docs-hardware`、`docs-structure`、`docs-wheel`。
- 确认源仓库包含 GitBook 专有语法和资源：frontmatter layout、`{% hint %}`、`{% tabs %}`、`data-view="cards"`、HTML 表格、内联购买按钮、`.gitbook/assets` 图片/PDF/STEP。
- 更新 `README.md`，写入项目背景、目标技术栈、内容来源、视觉基线、工具和维护规则。
- 更新 `AGENTS.md`，写入未来实现时的技术栈、迁移、视觉、部署、验证和交接约束。
- 再次使用 `tool_search` 检查 Astro MCP：当前 Codex 会话未暴露可调用 Astro MCP namespace；可见相关 MCP 主要是 Vercel。
- 使用 Vercel MCP 查询 Astro on Vercel：静态 Astro 可用静态输出，server/hybrid/ISR 才需要 Vercel adapter/serverless 配置。
- 访问官方文档确认：Astro GitBook migration、Starlight getting started、Starlight Asides/Tabs、Astro Tailwind styling、Astro React integration、Astro Vercel deploy、Vite 8、React 19、Tailwind Vite installation 均可访问。
- 使用 `npx create-astro@latest . --template starlight --no-install --no-git --dry-run --yes` 验证 Starlight starter 可用，dry-run 未写入项目文件。
- 更新 README/AGENTS：推荐静态 Starlight 文档站、MD/MDX、Tailwind CSS 4 + `@tailwindcss/vite`、Pagefind 搜索；React 19 只作为 island；Supabase 默认不用。
- 重新使用 `tool_search` 后 Astro MCP 已暴露；调用 `mcp__astro_mcp.search_astro_docs` 查询了 Starlight GitBook migration/Tailwind/React/Vercel 相关文档。
- 用户指定 `docs-wheel` 的 section 名称为 `轮子`，已更新 README 和 AGENTS。
- 准备向用户输出分阶段实施计划，覆盖 scaffold、主题复刻、内容迁移、资源本地化、验证和 Vercel 部署。

## 验证结果

- 已确认 `C:\Users\Rocky\.codex\skills\nice-github-repo` 不存在。
- 已确认 `.agent/skills/nice-github-repo/SKILL.md` 和 `agents/openai.yaml` 存在。
- 已确认 `README.md` 只有一个一级标题。
- 已确认 `README.md` 包含 `NICE Robotics` 和 `Lang zh-CN` badge。
- 已确认五个源仓库均为私有仓库且 `main` 可访问。
- 通过 `npm view` 调研到当前版本：Astro `6.4.4`、Starlight `0.39.3`、Vite `8.0.16`、React `19.2.7`、Tailwind CSS `4.3.0`、TypeScript `6.0.3`。
- 临时 Playwright 截图和误生成的根目录 `package.json` 已清理，未保留在工作区。
- 当前本机 Node `22.16.0`，满足 Astro 6 的 Node `>=22.12.0` 要求；npm 为 `11.15.0`，npm 最新为 `11.16.0`，本轮未升级，因为项目尚未 scaffold，升级没有实际收益。
- Vercel CLI `54.4.1`、GitHub CLI `2.92.0` 可用。
- `git status --short --branch` 仅显示 `README.md`、`AGENTS.md`、`agent-logs/HANDOFF.md` 已修改。

## 未完成事项

- 尚未 scaffold Astro/Starlight 应用。
- 尚未迁移 GitBook 内容和 `.gitbook/assets` 资源。
- 尚未实现旧站视觉复刻、旧 URL 兼容、主题切换、搜索、购买按钮、资源下载和部署配置。
- 尚未提交本次 README/AGENTS/HANDOFF 修改。
- 尚未执行详细计划中的任何实现步骤。
- 暂无 Astro MCP 阻塞；后续查询 Astro/Starlight 官方文档优先使用 Astro MCP。

## 关键风险

- 当前 README 只描述已确认的基础结构；后续补充产品资料或文档内容时，不要编造未验证信息。
- 本机 Git 提交时提示部分 Markdown 文件后续可能被转换为 CRLF；当前未额外添加行尾策略。
- `docs-wheel` 内容在当前旧站顶部导航中未出现，但用户要求纳入新站；section 名称已确认为 `轮子`。
- `doc.nicerobotics.hk` 是新站默认域名；旧 `docs.nicerobotics.hk` 是否跳转到新域名仍需部署前确认。
- 当前目录非空，实际运行 `create-astro . --template starlight` 不应直接默认接受；建议先 scaffold 到临时目录或子目录，再把文件合并进当前仓库，避免覆盖已有 README/AGENTS/.agent/agent-logs。
