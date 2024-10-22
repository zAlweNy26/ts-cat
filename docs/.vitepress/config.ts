import { defineConfig } from 'vitepress'
import typedocSidebar from '../api/typedoc-sidebar.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: 'Home',
	titleTemplate: 'Cheshire Cat - :title',
	description: 'Hackable and production-ready framework for developing AI agents on top of LLMs',
	head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
	lastUpdated: true,
	cleanUrls: true,
	base: '/ts-cat/',
	themeConfig: {
		logo: {
			dark: '/logo-dark.svg',
			light: '/logo-light.svg',
			alt: 'Cheshire Cat Logo',
		},
		footer: {
			message: 'Released under the GPL-3.0 License.',
			copyright: 'Copyright © 2024-present Daniele Nicosia & Contributors',
		},
		search: {
			provider: 'local',
		},
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Docs', link: '/introduction' },
			{ text: 'API', link: '/api/' },
			{ text: 'Contributors', link: '/contributors' },
		],
		sidebar: [
			{
				text: 'Documentation',
				items: [
					{
						text: 'Introduction',
						link: '/introduction',
					},
					{
						text: 'Getting Started',
						link: '/getting-started',
					},
				],
			},
			{
				text: 'API Reference',
				items: [
					{
						text: 'Overview',
						link: '/api/',
					},
					...typedocSidebar,
				],
			},
			{
				text: 'Contributors',
				link: '/contributors',
			},
		],
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/zAlweNy26/ts-cat' },
			{ icon: 'discord', link: 'https://discord.gg/bHX5sNFCYU' },
			{ icon: 'linkedin', link: 'https://www.linkedin.com/company/cheshire-cat-ai' },
		],
	},
})
