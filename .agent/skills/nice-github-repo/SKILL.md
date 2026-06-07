---
name: nice-github-repo
description: NICE Robotics GitHub repository standard for internal repositories, public product repositories, documentation repositories, FRC equipment resources, robot parts documentation, README.md structure, repository metadata, badges, language defaults, required tools, usage instructions, and public-facing repository documentation. Use when creating, reviewing, or updating NICE Robotics repository documentation.
---

# NICE GitHub 仓库规范

## 概览

每一个 NICE Robotics 内部仓库、产品资料仓库和公开文档仓库，都应使用这个 skill。重点是保证 README、徽章、语言、标题、工具说明、使用方法和事实边界在团队内一致。

## README 必须项

- 仓库命名默认使用全小写字母、数字和连字符；既有仓库如果已使用下划线，可保持现状但不要混用多套风格。
- `README.md` 默认使用 `zh-CN`。
- `README.md` 顶部只能有一个一级标题，并且必须放在文件开头。
- 一级标题必须与仓库名保持一致，大小写按仓库名原样书写。
- 一级标题下面必须包含 `NICE Robotics` badge。
- 一级标题下面必须包含语言 badge，默认写作 `Lang zh-CN`，注意大小写必须是 `zh-CN`。
- `README.md` 必须包含所需工具及使用方法。
- 所需工具和使用方法应区分“给人看的”和“给 AI 看的”；人类读者优先看到最少必要入口，AI 读者看到校验、维护和自动化命令。
- 如果仓库有安装、运行、测试、构建、部署或发布流程，必须写出可执行命令。
- 涉及 FRC 器材、机器人零件或商品资料时，必须清楚标明用途、规格、兼容性、安装注意事项和资料来源；不要编造库存、价格、交期、认证、授权或适配关系。
- 不要在 README 中写无法验证的状态、虚构链接、虚构命令或不存在的依赖。

## 推荐 README 结构

使用以下结构，除非仓库类型明确不适合：

```markdown
# repo-name

![NICE Robotics](https://img.shields.io/badge/NICE-Robotics-F9612B?labelColor=555555&style=flat)
![Lang zh-CN](https://img.shields.io/badge/Lang-zh--CN-2DBA4E?labelColor=555555&style=flat)

一句话说明仓库用途。

## 用途

说明这个仓库解决什么问题，服务谁，放什么内容。

## 目录

列出关键目录和文件，不要罗列无意义的内部细节。

## 给人看的工具

列出人类读者开始使用仓库需要的最少工具。

## 给人看的使用方法

给出人类读者的最短开始路径。

## 给 AI 看的工具

列出 AI agent 维护仓库需要调用的工具。

## 给 AI 看的使用方法

给出校验、构建、测试、部署或发布命令。

## 维护规则

写清楚贡献、命名、文档、商品资料或发布约定。
```

## Badge 规则

- 使用 `NICE Robotics` badge 表示团队归属。
- 使用 `Lang zh-CN` badge 表示 README 默认语言。
- badge 应放在一级标题正下方。
- 如果使用 shields.io，推荐：
  - `https://img.shields.io/badge/NICE-Robotics-F9612B?labelColor=555555&style=flat`
  - `https://img.shields.io/badge/Lang-zh--CN-2DBA4E?labelColor=555555&style=flat`

## 验证

- 检查仓库名是否符合当前命名风格。
- 检查 README 是否只有一个 `# ` 一级标题，且位于文件头部。
- 检查一级标题是否与仓库名一致。
- 检查是否包含 `NICE Robotics` 和 `Lang zh-CN` badge。
- 检查是否区分“给人看的工具/使用方法”和“给 AI 看的工具/使用方法”。
- 检查 README 中的命令、路径、依赖和链接是否真实存在或明确标注为待配置。
- 检查 FRC 器材和机器人零件相关信息是否有事实来源，且没有编造库存、价格、交期、授权、认证或兼容性。
