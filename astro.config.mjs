// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkBaseLinks from './src/plugins/remark-base-links.mjs';

// Sidebar group with per-locale label translations.
const g = (en, ko, ja, dir, opts = {}) => ({
	label: en,
	translations: { ko, ja },
	...opts,
	items: [{ autogenerate: { directory: dir, ...(opts.collapsed ? { collapsed: true } : {}) } }],
});

// https://astro.build/config
export default defineConfig({
	// Canonical site URL — used for sitemap, canonical tags, OG urls and hreflang.
	// The wiki now lives under www.uotavern.com/wiki (unified domain). Combined
	// with base:'/wiki', canonical/sitemap URLs become https://www.uotavern.com/wiki/...
	site: 'https://www.uotavern.com',
	// Serve the whole site under /wiki. Starlight auto-prefixes its own
	// component links via this base; in-content absolute links/assets are
	// handled by the rehype-base-links plugin below.
	base: '/wiki',
	// Make **bold**/*italic*/[links] parse correctly when adjacent to CJK
	// characters (Korean/Japanese) — CommonMark's flanking rules otherwise leave
	// the markers literal next to 한글/日本語. No effect on English.
	// remark-base-links prefixes /wiki onto in-content absolute URLs (markdown
	// links/images AND raw <img>/<audio> HTML) at build time.
	markdown: { remarkPlugins: [remarkCjkFriendly, remarkBaseLinks] },
	integrations: [
		starlight({
			// <title> template. Starlight always emits "<page> <titleDelimiter> <title>",
			// so the cross-site shape "Page — Section | UO Tavern" (DESIGN.md, "Names and
			// page titles") is reached by making the site title "Wiki | UO Tavern" and the
			// delimiter an em dash: "Mining — Wiki | UO Tavern". The header masthead
			// ("UO Wiki" / "UO 위키" / "UO ウィキ") is rendered by SiteTitle.astro instead.
			title: 'Wiki | UO Tavern',
			titleDelimiter: '—',
			description:
				'Knowledge base for Ultima Online — generated from server source code and verified in-game by AI agents. Companion to the UO Tavern forum.',
			customCss: ['./src/styles/uo-design.css', './src/styles/theme.css', './src/styles/sprites.css'],
			components: {
				Header: './src/components/Header.astro',
				SiteTitle: './src/components/SiteTitle.astro',
				Footer: './src/components/Footer.astro',
			},
			// Auto-route by browser language: a Korean browser lands on /ko/, a
			// Japanese browser on /ja/, everyone else on English. Runs once (a flag
			// in localStorage), so a manual language switch is respected afterward.
			// Missing translations fall back to English via Starlight's i18n fallback.
			head: [
				{
					// FOUC guard: honor the shared `uo-theme` key (default light) and set
					// <html data-theme> BEFORE paint, mirroring into Starlight's own
					// `starlight-theme` key so its runtime ThemeProvider agrees. Must run
					// EARLY (first head entry). Shared across hub/forum/wiki.
					tag: 'script',
					content:
						"(function(){try{var t=localStorage.getItem('uo-theme')||'light';document.documentElement.setAttribute('data-theme',t);localStorage.setItem('starlight-theme',t);}catch(e){}})();",
				},
				{
					tag: 'script',
					content:
						"(function(){try{var b='/wiki';var p=location.pathname;var r=p.indexOf(b)===0?(p.slice(b.length)||'/'):p;if(/^\\/(ko|ja)(\\/|$)/.test(r))return;if(localStorage.getItem('uo-lang'))return;var l=(navigator.language||'').toLowerCase();var t=l.indexOf('ko')===0?'ko':(l.indexOf('ja')===0?'ja':null);if(!t)return;localStorage.setItem('uo-lang',t);location.replace(b+'/'+t+(r==='/'?'/':r)+location.search+location.hash);}catch(e){}})();",
				},
					{ tag: 'meta', attrs: { property: 'og:site_name', content: 'UO Tavern' } },
					{ tag: 'meta', attrs: { property: 'og:image', content: 'https://www.uotavern.com/wiki/og.png' } },
					{ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
					{ tag: 'meta', attrs: { name: 'twitter:image', content: 'https://www.uotavern.com/wiki/og.png' } },
					{ tag: 'meta', attrs: { name: 'keywords', content: 'Ultima Online, UO, ServUO, wiki, bestiary, skills, spells, crafting, treasure hunting, 울티마 온라인, ウルティマオンライン' } },
			],
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
				ko: { label: '한국어', lang: 'ko' },
				ja: { label: '日本語', lang: 'ja' },
			},
			sidebar: [
				g('Getting Started', '시작하기', 'はじめに', 'guides'),
				g('How to Play', '플레이 방법', '遊び方', 'playing', { collapsed: true }),
				g('Professions', '직업', '職業', 'professions', { collapsed: true }),
				g('Character Templates', '캐릭터 템플릿', 'キャラクターテンプレート', 'templates'),
				g('Skills', '스킬', 'スキル', 'skills', { collapsed: true }),
				g('Magic', '마법', '魔法', 'magic', { collapsed: true }),
				g('Bestiary', '몬스터 도감', 'モンスター図鑑', 'bestiary', { collapsed: true }),
				g('Items', '아이템', 'アイテム', 'items', { collapsed: true }),
				g('Crafting', '제작', '生産', 'crafting', { collapsed: true }),
				g('World', '세계', 'ワールド', 'world', { collapsed: true }),
				g('Mechanics', '메커니즘', 'メカニクス', 'mechanics', { collapsed: true }),
				g('Our Shard', '우리 서버', 'このシャード', 'shard'),
				g('Essays & Tales', '에세이와 이야기', 'エッセイと物語', 'essays', { collapsed: true }),
				g('Reference', '참고자료', 'リファレンス', 'reference'),
				{
					label: 'Recent Changes',
					translations: { ko: '최근 변경', ja: '最近の変更' },
					link: '/changelog/',
				},
			],
		}),
	],
});
