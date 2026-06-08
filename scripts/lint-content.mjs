import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const contentRoot = join(root, 'src', 'content', 'docs');
const ignoredDirs = new Set(['.git', '.astro', '.vercel', 'dist', 'node_modules']);
const textExtensions = new Set(['.astro', '.css', '.js', '.json', '.md', '.mdx', '.mjs', '.ts', '.yaml', '.yml']);

const retiredTerms = [
	['git', 'book'].join(''),
	['git', ' book'].join(''),
	['git', '-', 'book'].join(''),
	['git', '_', 'sync'].join(''),
	['sync', '-', 'git', 'book'].join(''),
	['git', 'book', 'Icon'].join(''),
];

const mdxRules = [
	{ label: '不要在 MDX 中手写 className', pattern: /className\s*=/ },
	{ label: '不要在 MDX 中手写 div', pattern: /<div\b/ },
	{ label: '不要在 MDX 中手写 table', pattern: /<table\b/ },
	{ label: '不要在 MDX 中手写 figure', pattern: /<figure\b/ },
	{ label: '不要在 MDX 中手写 img', pattern: /<img\b/ },
	{ label: '不要在 MDX 中手写 p align', pattern: /<p\s+align\s*=/ },
	{ label: '不要在 MDX 中手写 style', pattern: /style\s*=/ },
	{ label: '不要在 MDX 中手写 data-*', pattern: /\sdata-[\w-]+\s*=/ },
	{ label: '不要使用旧购买按钮 class', pattern: /button primary/ },
	{ label: '不要使用旧表格 wrapper', pattern: /nice-table-scroll/ },
	{ label: '不要使用旧卡片 class', pattern: /nice-card-grid|nice-card/ },
	{ label: '不要使用旧 Onshape class', pattern: /nice-onshape/ },
	{ label: '不要把链接放进标题', pattern: /^#{1,6}\s+.*<a\b/m },
];

function walk(dir) {
	const files = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory() && ignoredDirs.has(entry.name)) continue;
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) files.push(...walk(fullPath));
		else files.push(fullPath);
	}
	return files;
}

function lineNumber(content, index) {
	return content.slice(0, index).split(/\r?\n/).length;
}

const failures = [];

for (const file of walk(contentRoot)) {
	if (extname(file) !== '.mdx') continue;
	const content = readFileSync(file, 'utf8');
	for (const rule of mdxRules) {
		const match = rule.pattern.exec(content);
		if (match) {
			failures.push(`${relative(root, file)}:${lineNumber(content, match.index)} ${rule.label}`);
		}
	}
}

for (const file of walk(root)) {
	if (!textExtensions.has(extname(file))) continue;
	const content = readFileSync(file, 'utf8').toLowerCase();
	for (const term of retiredTerms) {
		const index = content.indexOf(term.toLowerCase());
		if (index !== -1) {
			failures.push(`${relative(root, file)}:${lineNumber(content, index)} 出现已退役的外部文档系统关键词`);
		}
	}
}

if (failures.length) {
	console.error(failures.join('\n'));
	process.exit(1);
}

console.log('Content lint passed.');
