# AGENTS.md

## 仓库定位

本仓库用于维护 NICE Robotics 文档资料、仓库规范和 AI 协作所需的基础说明。

## 使用规则

- 默认用中文沟通，回答简洁、直接、具体。
- 修改前先查看 `agent-logs/HANDOFF.md`，理解当前状态、最近变更、未完成事项和风险。
- 维护 README、仓库说明或 GitHub 仓库基础文档时，使用 `.agent/skills/nice-github-repo/SKILL.md`。
- 不要把本仓库需要的 skill 安装到全局；本仓库使用 `.agent/skills/`。
- 不要编造事实、接口、配置、命令、依赖、路径、日期或数据。
- 保持 diff 小而清晰，不做与当前任务无关的重构或目录整理。
- 禁止未经授权使用 `git reset --hard`、`git checkout --`、批量删除等破坏性命令。

## 交接规则

- 每次完成对话或关键修改后，更新 `agent-logs/HANDOFF.md`。
- handoff 必须包含更新时间，格式包含时区、年、月、日和秒，例如：`2026-06-07 22:40:00 +08:00`。
- handoff 应简洁说明当前状态、刚完成的变更、验证结果、未完成事项和关键风险。

## README 规则

- `README.md` 默认使用 `zh-CN`。
- `README.md` 文件开头只能有一个一级标题，标题必须是 `docs`。
- 一级标题下方必须包含 `NICE Robotics` 和 `Lang zh-CN` badge。
- README 必须区分“给人看的工具/使用方法”和“给 AI 看的工具/使用方法”。
- 当前仓库没有构建、测试、部署或发布流程；不要补写不存在的命令。
