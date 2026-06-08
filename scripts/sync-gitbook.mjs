import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import katex from 'katex';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = process.env.NICE_DOCS_SOURCE_ROOT
	? resolve(process.env.NICE_DOCS_SOURCE_ROOT)
	: join(root, '.cache', 'gitbook-sources');
const docsRoot = join(root, 'src', 'content', 'docs');
const assetsRoot = join(root, 'public', 'assets', 'docs');

const repositories = [
	{
		name: 'docs-home',
		url: 'https://github.com/nicerobotics/docs-home.git',
		assets: 'home',
		pages: [{ source: 'README.md', target: 'index.mdx', title: '欢迎', toc: false, template: 'splash' }],
	},
	{
		name: 'docs-transmission',
		url: 'https://github.com/nicerobotics/docs-transmission.git',
		assets: 'transmission',
		pages: [
			{ source: 'README.md', target: 'transmission/gear.mdx', title: '齿轮' },
			{ source: 'sprocket_chain.md', target: 'transmission/sprocket_chain.mdx', title: '链轮 & 链条' },
		],
	},
	{
		name: 'docs-hardware',
		url: 'https://github.com/nicerobotics/docs-hardware.git',
		assets: 'hardware',
		pages: [
			{ source: 'README.md', target: 'hardware/tube_plugs.mdx', title: '方管塞' },
			{ source: 'nut_strips.md', target: 'hardware/nut_strips.mdx', title: '螺母条' },
			{ source: 'bearing_shaft.md', target: 'hardware/bearing_shaft.mdx', title: '轴承 & 轴' },
			{ source: 'insert.md', target: 'hardware/insert.mdx', title: '3D 打印嵌入件' },
			{ source: 'adapter.md', target: 'hardware/adapter.mdx', title: '转换套' },
			{ source: 'shim.md', target: 'hardware/shim.mdx', title: '六角内孔间隙片' },
		],
	},
	{
		name: 'docs-structure',
		url: 'https://github.com/nicerobotics/docs-structure.git',
		assets: 'structure',
		pages: [
			{ source: 'README.md', target: 'structure/tube.mdx', title: '管材' },
			{ source: 'bumper.md', target: 'structure/bumper.mdx', title: '防撞条' },
		],
	},
	{
		name: 'docs-wheel',
		url: 'https://github.com/nicerobotics/docs-wheel.git',
		assets: 'wheels',
		pages: [
			{ source: 'README.md', target: 'wheels/silicone-wheel.mdx', title: '塑芯硅胶轮' },
			{ source: 'shi-xin-fei-lun.md', target: 'wheels/flywheel.mdx', title: '实心飞轮' },
			{ source: 'gui-jiao-ruan-guan.md', target: 'wheels/silicone-tube.mdx', title: '硅胶软管' },
			{ source: 'gun-zhou-xi-tong.md', target: 'wheels/roller-system.mdx', title: '滚轴系统' },
		],
	},
];

const oldPlaceholderFiles = [
	'hardware/adapter.md',
	'hardware/bearing_shaft.md',
	'hardware/insert.md',
	'hardware/nut_strips.md',
	'hardware/shim.md',
	'hardware/tube_plugs.md',
	'structure/bumper.md',
	'structure/tube.md',
	'transmission/gear.md',
	'transmission/sprocket_chain.md',
	'wheels/flywheel.md',
	'wheels/roller-system.md',
	'wheels/silicone-tube.md',
	'wheels/silicone-wheel.md',
];

function run(command, args, cwd = root) {
	const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' });
	if (result.status !== 0) {
		const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
		throw new Error(`${command} ${args.join(' ')} failed${detail ? `\n${detail}` : ''}`);
	}
	return result.stdout.trim();
}

function ensureSources() {
	mkdirSync(sourceRoot, { recursive: true });
	for (const repo of repositories) {
		const target = join(sourceRoot, repo.name);
		if (!existsSync(target)) {
			run('git', ['clone', '--depth=1', repo.url, target], sourceRoot);
			continue;
		}
		if (existsSync(join(target, '.git'))) {
			run('git', ['pull', '--ff-only'], target);
		}
	}
}

function listFiles(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = join(dir, entry.name);
		return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
	});
}

function copyAssets(repo) {
	const sourceAssets = join(sourceRoot, repo.name, '.gitbook', 'assets');
	const targetAssets = join(assetsRoot, repo.assets);
	mkdirSync(targetAssets, { recursive: true });
	const assetMap = new Map();

	for (const file of listFiles(sourceAssets)) {
		const relativePath = relative(sourceAssets, file).split(sep).join('/');
		const target = join(targetAssets, relativePath);
		mkdirSync(dirname(target), { recursive: true });
		copyFileSync(file, target);
		assetMap.set(relativePath, `/assets/docs/${repo.assets}/${encodePath(relativePath)}`);
	}

	return assetMap;
}

function encodePath(value) {
	return value
		.split('/')
		.map((part) => encodeURIComponent(part).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`))
		.join('/');
}

function stripFrontmatter(markdown) {
	if (!markdown.startsWith('---')) return markdown;
	const end = markdown.indexOf('\n---', 3);
	if (end === -1) return markdown;
	const after = markdown.indexOf('\n', end + 4);
	return markdown.slice(after === -1 ? end + 4 : after + 1).trimStart();
}

function getFrontmatterValue(markdown, key) {
	if (!markdown.startsWith('---')) return undefined;
	const end = markdown.indexOf('\n---', 3);
	if (end === -1) return undefined;
	const frontmatter = markdown.slice(3, end);
	const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
	return match?.[1]?.trim().replace(/^["']|["']$/g, '');
}

function htmlDecode(value) {
	return value
		.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
		.replace(/&#([0-9]+);/g, (_, number) => String.fromCodePoint(Number.parseInt(number, 10)))
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

function plainText(value) {
	return htmlDecode(value)
		.replace(/<[^>]+>/g, '')
		.replace(/\*\*/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function escapeYaml(value) {
	return JSON.stringify(value);
}

function firstParagraph(markdown) {
	for (const block of markdown.split(/\n{2,}/)) {
		const text = plainText(block);
		if (
			!text ||
			text.startsWith('#') ||
			text.startsWith(':::') ||
			text.startsWith('<table') ||
			text.startsWith('<figure') ||
			text.startsWith('<div')
		) {
			continue;
		}
		return text.length > 120 ? `${text.slice(0, 117)}...` : text;
	}
	return 'NICE Robotics 官方产品文档';
}

function removeFirstH1(markdown) {
	return markdown.replace(/^#\s+.+?(?:\r?\n){1,2}/, '');
}

function convertHints(markdown) {
	const typeMap = {
		info: 'note',
		success: 'tip',
		warning: 'caution',
		danger: 'danger',
	};

	return markdown
		.replace(/\{% hint style="([^"]+)" %\}/g, (_, style) => `:::${typeMap[style] ?? 'note'}\n`)
		.replace(/\{% endhint %\}/g, '\n:::');
}

function convertTabs(markdown) {
	let converted = markdown.replace(/\{% tabs %\}/g, '<Tabs>\n');
	converted = converted.replace(/\{% tab title="([^"]+)"(?: icon="([^"]+)")? %\}/g, (_, title) => {
		return `<TabItem label=${JSON.stringify(htmlDecode(title))}>\n`;
	});
	converted = converted.replace(/\{% endtab %\}/g, '\n</TabItem>');
	converted = converted.replace(/\{% endtabs %\}/g, '\n</Tabs>');
	return converted;
}

function convertAssetReferences(markdown, assetMap) {
	const mapAsset = (rawPath) => {
		const decodedPath = htmlDecode(decodeURIComponentSafe(rawPath));
		return assetMap.get(decodedPath) ?? `/assets/docs/missing/${encodePath(decodedPath)}`;
	};

	return markdown
		.replace(/(["'])\.gitbook\/assets\/([^"']+)\1/g, (_, quote, rawPath) => {
			return `${quote}${mapAsset(rawPath)}${quote}`;
		})
		.replace(/\(\.gitbook\/assets\/([^)]+)\)/g, (_, rawPath) => {
			return `(${mapAsset(rawPath)})`;
		});
}

function decodeURIComponentSafe(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function convertOldUrls(markdown) {
	return markdown
		.replace(/https:\/\/docs\.nicerobotics\.hk\/transmission\/gear/g, '/transmission/gear/')
		.replace(/https:\/\/docs\.nicerobotics\.hk\/transmission\/sprocket_chain/g, '/transmission/sprocket_chain/')
		.replace(/https:\/\/docs\.nicerobotics\.hk\/hardware\/tube_plugs/g, '/hardware/tube_plugs/')
		.replace(/https:\/\/docs\.nicerobotics\.hk\/hardware\/nut_strips/g, '/hardware/nut_strips/')
		.replace(/https:\/\/docs\.nicerobotics\.hk\/hardware\/bearing_shaft/g, '/hardware/bearing_shaft/')
		.replace(/https:\/\/docs\.nicerobotics\.hk\/hardware\/insert/g, '/hardware/insert/')
		.replace(/https:\/\/docs\.nicerobotics\.hk\/hardware\/adapter/g, '/hardware/adapter/')
		.replace(/https:\/\/docs\.nicerobotics\.hk\/structure\/tube/g, '/structure/tube/')
		.replace(/https:\/\/docs\.nicerobotics\.hk\/structure\/bumper/g, '/structure/bumper/')
		.replace(/https:\/\/docs\.nicerobotics\.hk\/wheels\/silicone-wheel/g, '/wheels/silicone-wheel/')
		.replace(/https:\/\/docs\.nicerobotics\.hk\/wheels\/flywheel/g, '/wheels/flywheel/')
		.replace(/https:\/\/docs\.nicerobotics\.hk\/wheels\/silicone-tube/g, '/wheels/silicone-tube/')
		.replace(/https:\/\/docs\.nicerobotics\.hk\/wheels\/roller-system/g, '/wheels/roller-system/');
}

function convertCards(markdown) {
	return markdown.replace(/<table data-view="cards">[\s\S]*?<\/table>/g, (table) => {
		const rows = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].slice(1);
		const cards = rows
			.map(([, row]) => {
				const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((match) => match[1]);
				if (!cells.length) return '';
				const title = plainText(cells[0]);
				const code = plainText(cells[1] ?? '');
				const href = htmlDecode(cells[2]?.match(/href="([^"]+)"/)?.[1] ?? '#');
				const image = htmlDecode(cells[cells.length - 1]?.match(/href="([^"]+)"/)?.[1] ?? '');
				const fit = cells[cells.length - 1]?.match(/data-object-fit="([^"]+)"/)?.[1] ?? 'contain';
				return [
					`<a className="nice-card" href="${href}">`,
					image ? `  <img src="${image}" alt="" loading="lazy" data-fit="${fit}" />` : '',
					'  <span>',
					`    <strong>${title}</strong>`,
					code ? `    <small>${code}</small>` : '',
					'  </span>',
					'</a>',
				]
					.filter(Boolean)
					.join('\n');
			})
			.filter(Boolean)
			.join('\n');

		return `<div className="nice-card-grid not-content">\n${cards}\n</div>`;
	});
}

function convertHtmlForMdx(markdown) {
	return markdown
		.replace(/\sclass=/g, ' className=')
		.replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />')
		.replace(/<br>/g, '<br />')
		.replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
}

function convertGlobeIcons(markdown) {
	const globeIconPattern = '(?:\\u{1F310}|&#x1F310;|&#127760;)';
	return markdown
		.replace(
			new RegExp(`<a([^>]*)>${globeIconPattern}</a>`, 'gu'),
			'<a$1 className="nice-onshape-link" aria-label="Onshape"><span className="nice-onshape-icon" aria-hidden="true"></span></a>'
		)
		.replace(
			new RegExp(`<td([^>]*)>${globeIconPattern}</td>`, 'gu'),
			'<td$1><span className="nice-onshape-icon" aria-label="Onshape"></span></td>'
		);
}

function wrapHtmlTables(markdown) {
	return markdown.replace(/(^|\n)(<table[\s\S]*?<\/table>)/g, (_, prefix, table) => {
		return `${prefix}<div className="nice-table-scroll">\n${table}\n</div>`;
	});
}

function renderMath(markdown) {
	const render = (source, displayMode) => {
		const expression = htmlDecode(source).trim();
		if (!expression) return '';
		return katex.renderToString(expression, {
			displayMode,
			throwOnError: false,
			strict: 'ignore',
			trust: false,
		});
	};

	return markdown
		.replace(/\$\$([\s\S]*?)\$\$/g, (_, expression) => {
			return `<div className="nice-math-display not-content">${render(expression, true)}</div>`;
		})
		.replace(/(?<!\\)\$([^\n$]+)\$/g, (_, expression) => {
			return `<span className="nice-math-inline">${render(expression, false)}</span>`;
		});
}

function escapeMdxTextExpressions(markdown) {
	const protectedMath = [];
	const protect = (value) => {
		protectedMath.push(value);
		return `@@NICE_MATH_${protectedMath.length - 1}@@`;
	};

	const escaped = markdown
		.replace(/\$\$[\s\S]*?\$\$/g, protect)
		.replace(/(?<!\\)\$[^\n$]+\$/g, protect)
		.replace(/[{}]/g, (char) => (char === '{' ? '&#123;' : '&#125;'));

	return escaped.replace(/@@NICE_MATH_(\d+)@@/g, (_, index) => protectedMath[Number(index)] ?? '');
}

function hasStarlightTabs(markdown) {
	return markdown.includes('<Tabs>') || markdown.includes('<TabItem ');
}

function buildFrontmatter(page, body) {
	const inferredTitle = plainText(body.match(/^#\s+(.+)$/m)?.[1] ?? page.title);
	const title = page.title ?? inferredTitle;
	const lines = [
		'---',
		`title: ${escapeYaml(title)}`,
		`description: ${escapeYaml(firstParagraph(body))}`,
	];
	if (page.gitbookIcon) lines.push(`gitbookIcon: ${escapeYaml(page.gitbookIcon)}`);
	if (page.template) lines.push(`template: ${escapeYaml(page.template)}`);
	if (page.toc === false) lines.push('tableOfContents: false');
	lines.push('---');
	return lines.join('\n');
}

function transformMarkdown(source, page, assetMap) {
	const icon = getFrontmatterValue(source, 'icon');
	const normalizedPage = {
		...page,
		gitbookIcon: page.gitbookIcon ?? icon ?? undefined,
	};
	let body = stripFrontmatter(source);
	body = removeFirstH1(body);
	body = convertHints(body);
	body = convertTabs(body);
	body = convertAssetReferences(body, assetMap);
	body = convertOldUrls(body);
	body = convertCards(body);
	body = convertHtmlForMdx(body);
	body = convertGlobeIcons(body);
	body = wrapHtmlTables(body);
	body = renderMath(body);
	body = escapeMdxTextExpressions(body);
	const imports = hasStarlightTabs(body) ? "import { Tabs, TabItem } from '@astrojs/starlight/components';\n\n" : '';
	return `${buildFrontmatter(normalizedPage, body)}\n\n${imports}${body.trim()}\n`;
}

function removeOldPlaceholders() {
	for (const file of oldPlaceholderFiles) {
		const target = join(docsRoot, file);
		if (existsSync(target) && statSync(target).isFile()) {
			rmSync(target);
		}
	}
}

function sync() {
	ensureSources();
	rmSync(assetsRoot, { recursive: true, force: true });
	removeOldPlaceholders();

	const outputPages = [];
	for (const repo of repositories) {
		const assetMap = copyAssets(repo);
		const repoRoot = join(sourceRoot, repo.name);
		for (const page of repo.pages) {
			const sourcePath = join(repoRoot, page.source);
			const targetPath = join(docsRoot, page.target);
			const source = readFileSync(sourcePath, 'utf8');
			const output = transformMarkdown(source, page, assetMap);
			mkdirSync(dirname(targetPath), { recursive: true });
			writeFileSync(targetPath, output, 'utf8');
			outputPages.push(relative(root, targetPath));
		}
	}

	console.log(`Synced ${outputPages.length} pages from ${repositories.length} GitBook repositories.`);
	for (const page of outputPages) console.log(`- ${page}`);
}

sync();
