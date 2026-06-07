# docs

![NICE Robotics](https://img.shields.io/badge/NICE-Robotics-F9612B?labelColor=555555&style=flat)
![Lang zh-CN](https://img.shields.io/badge/Lang-zh--CN-2DBA4E?labelColor=555555&style=flat)

本仓库用于维护 NICE Robotics 文档资料、仓库规范和 AI 协作所需的基础说明。

## 用途

- 维护 NICE Robotics 文档仓库的基础结构和协作规范。
- 存放与文档维护相关的 README、AGENTS 指令和交接记录。
- 在仓库内安装并使用 NICE Robotics GitHub 仓库规范 skill。
- 后续按实际需要补充产品资料、团队文档或发布说明；未确认的内容不要提前占位。

## 目录

- `.agent/skills/nice-github-repo/`：当前仓库内安装的 NICE Robotics GitHub 仓库规范 skill。
- `AGENTS.md`：本仓库生效的 agent 指令。
- `agent-logs/HANDOFF.md`：交接文档，记录当前状态、最近变更、验证结果和风险。
- `README.md`：仓库入口说明。

## 给人看的工具

- Git：克隆、查看和同步仓库。
- GitHub：查看远端仓库、提交记录和后续协作。
- Markdown 编辑器或 Codex：阅读和维护文档。

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

## 给 AI 看的工具

- Git：查看状态、提交和同步远端。
- ripgrep（`rg`）：搜索文档和配置。
- PowerShell：在 Windows 工作区执行验证命令。
- `.agent/skills/nice-github-repo`：维护 README 和仓库基础文档时使用的本地 skill。

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

检查远端配置：

```powershell
git remote -v
```

当前仓库没有构建、测试、部署或发布流程；不要补写不存在的命令。

## 维护规则

- README 默认使用 `zh-CN`，文件开头只保留一个一级标题，标题必须是 `docs`。
- 维护 README 和仓库基础文档时遵循 `.agent/skills/nice-github-repo/SKILL.md`。
- 每次完成对话或关键修改后，更新 `agent-logs/HANDOFF.md`，并写入带时区的更新时间。
- 不要编造产品资料、库存、价格、交期、认证、授权、兼容性或不存在的链接。
- 保持 diff 小而清晰；不要创建空目录占位。
