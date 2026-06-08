// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.nicerobotics.hk',
	redirects: {
		'/transmission': '/transmission/gear/',
		'/transmission/sprocket_chain': '/transmission/sprocket-chain/',
		'/hardware': '/hardware/tube-plugs/',
		'/hardware/tube_plugs': '/hardware/tube-plugs/',
		'/hardware/nut_strips': '/hardware/nut-strips/',
		'/hardware/bearing_shaft': '/hardware/bearing-shaft/',
		'/structure': '/structure/tube/',
		'/wheels': '/wheels/silicone-wheel/',
	},
	integrations: [
		starlight({
			title: 'NICE Robotics',
			description: 'NICE Robotics 官方产品文档',
			favicon: '/favicon.png',
			locales: {
				root: {
					label: '简体中文',
					lang: 'zh-CN',
				},
			},
			logo: {
				src: './src/assets/logos/nice-text.svg',
				replacesTitle: true,
			},
			head: [
				{
					tag: 'link',
					attrs: {
						rel: 'icon',
						type: 'image/png',
						href: '/favicon.png',
					},
				},
			],
			pagination: false,
			customCss: ['./src/styles/global.css'],
			routeMiddleware: './src/starlightRouteData.ts',
			components: {
				Header: './src/components/NiceHeader.astro',
				Footer: './src/components/NiceFooter.astro',
				PageTitle: './src/components/NicePageTitle.astro',
				Sidebar: './src/components/NiceSidebar.astro',
				TableOfContents: './src/components/NiceTableOfContents.astro',
				TwoColumnContent: './src/components/NiceTwoColumnContent.astro',
				MobileTableOfContents: './src/components/EmptyMobileTableOfContents.astro',
				MobileMenuFooter: './src/components/NiceMobileMenuFooter.astro',
			},
			sidebar: [
				{ label: '首页', slug: '' },
				{ label: '传动', items: [{ autogenerate: { directory: 'transmission' } }] },
				{ label: '硬件', items: [{ autogenerate: { directory: 'hardware' } }] },
				{ label: '结构', items: [{ autogenerate: { directory: 'structure' } }] },
				{ label: '轮子', items: [{ autogenerate: { directory: 'wheels' } }] },
			],
		}),
	],
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'~': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
	},
});
