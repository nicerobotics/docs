// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://doc.nicerobotics.hk',
	redirects: {
		'/transmission': '/transmission/gear/',
		'/hardware': '/hardware/tube_plugs/',
		'/structure': '/structure/tube/',
		'/wheels': '/wheels/silicone-wheel/',
	},
	integrations: [
		starlight({
			title: 'NICE Robotics',
			description: 'NICE Robotics 官方产品文档',
			logo: {
				src: './src/assets/logos/nice-text.svg',
				replacesTitle: true,
			},
			customCss: ['./src/styles/global.css'],
			components: {
				Header: './src/components/NiceHeader.astro',
			},
			sidebar: [
				{ label: '首页', slug: '' },
				{
					label: '传动',
					items: [
						{ label: '齿轮', slug: 'transmission/gear' },
						{ label: '链轮 & 链条', slug: 'transmission/sprocket_chain' },
					],
				},
				{
					label: '硬件',
					items: [
						{ label: '方管塞', slug: 'hardware/tube_plugs' },
						{ label: '螺母条', slug: 'hardware/nut_strips' },
						{ label: '轴承 & 轴', slug: 'hardware/bearing_shaft' },
						{ label: '3D 打印嵌入件', slug: 'hardware/insert' },
						{ label: '转换套', slug: 'hardware/adapter' },
						{ label: '六角内孔间隙片', slug: 'hardware/shim' },
					],
				},
				{
					label: '结构',
					items: [
						{ label: '管材', slug: 'structure/tube' },
						{ label: '防撞条', slug: 'structure/bumper' },
					],
				},
				{
					label: '轮子',
					items: [
						{ label: '塑芯硅胶轮', slug: 'wheels/silicone-wheel' },
						{ label: '实心飞轮', slug: 'wheels/flywheel' },
						{ label: '硅胶软管', slug: 'wheels/silicone-tube' },
						{ label: '滚轴系统', slug: 'wheels/roller-system' },
					],
				},
			],
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
