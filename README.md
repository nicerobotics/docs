# docs

![NICE Robotics](https://img.shields.io/badge/NICE-Robotics-F9612B?labelColor=555555&style=flat)
![Lang zh-CN](https://img.shields.io/badge/Lang-zh--CN-2DBA4E?labelColor=555555&style=flat)

本仓库是 NICE Robotics 官方产品文档网站，使用 Astro + Starlight 构建并部署到 NI Corporate Vercel。

## 用途

- `src/content/docs` 是唯一文档事实源。
- 后续新增或修改文档时，只修改 MDX、图片和下载资源。
- 文档作者不需要修改导航组件、全局样式、构建脚本或页面框架。
- 常见内容模式必须通过封装组件表达，不在 MDX 中手写脚手架 HTML。
- 默认生产域名为 `docs.nicerobotics.hk`。

## 技术栈

- Astro + Starlight
- TypeScript
- Tailwind CSS 4
- Starlight Pagefind 搜索
- 静态输出
- NI Corporate Vercel

默认不引入 Supabase、SSR、Edge Runtime 或额外 Vercel adapter。只有存在明确性能、权限、缓存或服务端集成收益时，才重新评估。

## 目录

- `src/content/docs/`：所有文档页面。
- `src/components/`：站点布局组件。
- `src/components/mdx/`：给 MDX 作者使用的语义组件。
- `src/styles/`：主题变量、Starlight 覆盖和基础 Markdown 样式。
- `public/assets/`：图片、图标和文档静态资源。
- `public/downloads/`：用户可下载的 PDF、STEP 等资源。
- `agent-logs/HANDOFF.md`：当前状态、最近变更、验证结果和风险。
- `AGENTS.md`：agent 维护规则。

## MDX 写作规则

允许：

- 标准 Markdown。
- 页面 frontmatter。
- `src/components/mdx` 中导出的组件。
- 相对清晰的图片、PDF、STEP、外部链接路径。

禁止：

- 手写 `<div>`、`<table>`、`<figure>`、`<img>`。
- 手写 `className`、`style`、`data-*`。
- 在标题里放按钮或链接。
- 为了视觉效果在 MDX 中写临时 HTML。
- 为了新增页面修改导航组件或全局 CSS。

## 页面 Frontmatter

每个文档页至少包含：

```yaml
---
title: 方管塞
description: NICE 方管塞产品文档
icon: gem
sidebar:
  order: 10
---
```

字段说明：

- `title`：页面标题。
- `description`：搜索和元信息描述。
- `icon`：页面标题和侧栏使用的图标名。
- `sidebar.order`：同一栏目内排序。
- `tableOfContents: false`：仅在页面不需要右侧目录时使用。
- `template: splash`：仅在首页等特殊宽版页面使用。

## MDX 组件

文档作者优先使用：

```mdx
import {
  BuyButton,
  DocImage,
  OnshapeLink,
  ProductTable,
  ResourceLink,
  SpecList,
  SubpageGallery,
} from '~/components/mdx';
```

常用组件：

- `DocImage`：正文图片，自动处理背景、居中、深浅色可读性和 caption。
- `SubpageGallery`：子页面或子产品入口卡片网格。
- `ProductTable`：灵活列定义产品表格，不固定列结构。
- `BuyButton`：淘宝购买按钮。
- `OnshapeLink`：Onshape 图标链接。
- `ResourceLink`：PDF、STEP 或外部资源链接。
- `SpecList`：规格参数列表。

## ProductTable 示例

`ProductTable` 不固定列。不同产品可以定义不同字段：

```mdx
<ProductTable
  columns={[
    { key: 'sku', label: 'SKU' },
    { key: 'weight', label: '重量' },
    { key: 'drawing', label: '图纸', type: 'pdf' },
    { key: 'model', label: '模型', type: 'step' },
    { key: 'onshape', label: 'Onshape', type: 'onshape' },
  ]}
  rows={[
    {
      sku: 'NICE-04-08-001',
      weight: '40g',
      drawing: '/downloads/hardware/tube-plugs/NICE-D-04-08-01.pdf',
      model: '/downloads/hardware/tube-plugs/NICE-04-08-001.step',
      onshape: 'https://cad.onshape.com/...',
    },
  ]}
/>
```

## 新增文档

给人看的最短流程：

1. 在 `src/content/docs/<section>/` 下新增 `.mdx`。
2. 在 frontmatter 中填写 `title`、`description`、`icon`、`sidebar.order`。
3. 把图片放到 `public/assets/docs/<section>/<page>/`。
4. 把 PDF、STEP 等下载资源放到 `public/downloads/<section>/<page>/`。
5. 正文使用 Markdown 和 `src/components/mdx` 组件。
6. 运行检查：

```powershell
npm run lint:content
npm run check
npm run build
```

## 给人看的工具

- Node.js 和 npm
- Git
- Astro/Starlight
- Vercel CLI
- Playwright

## 给人看的使用方法

安装依赖：

```powershell
npm install
```

本地开发：

```powershell
npm run dev
```

构建检查：

```powershell
npm run lint:content
npm run check
npm run build
```

预览构建结果：

```powershell
npm run preview
```

## 给 AI 看的工具

- `rg`：搜索内容、组件、样式和禁用写法。
- PowerShell：执行仓库命令。
- Playwright：视觉回归和交互验证。
- `.agent/skills/nice-github-repo`：维护 README 和仓库基础说明。
- `agent-logs/HANDOFF.md`：交接状态。

## 给 AI 看的新增文档方法

1. 先读 `AGENTS.md` 和 `agent-logs/HANDOFF.md`。
2. 运行 `git status --short --branch`，确认已有改动。
3. 新增内容时只改 MDX 和静态资源。
4. 不要手写脚手架 HTML。
5. 不要新增全局业务 CSS。
6. 优先复用 `src/components/mdx`。
7. 如果现有组件不足，先新增通用组件，再使用它。
8. 新组件样式优先用 Tailwind。
9. 新增页面必须通过 frontmatter 控制标题、图标和侧栏顺序。
10. 完成后运行：

```powershell
npm run lint:content
npm run check
npm run build
```

11. 涉及视觉变化时，用 Playwright 检查桌面、移动端、浅色和深色模式。
12. 更新 `agent-logs/HANDOFF.md`。

## 维护规则

- 保持视觉与当前线上站点一致，重构不等于重设计。
- 保持 MDX 简洁、可读、可复制。
- 所有重复内容模式都应沉淀为组件。
- 不为单个页面写一次性 CSS。
- 不编造 SKU、规格、链接、价格、库存、交期、认证或兼容性。
- README 只能有一个一级标题，标题必须是 `docs`。
