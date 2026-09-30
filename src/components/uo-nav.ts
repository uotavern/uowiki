// The shared cross-site navigation definition (uohub/uo-nav.json, published at
// https://www.uotavern.com/uo-nav.json) and the renderers that turn it into the
// two contract blocks every UO Tavern site carries: the global bar (top) and the
// footer (bottom). They mirror uohub/tools/uo_nav.py — render_globalbar() and
// render_footer() — character for character, so the hub's check can compare
// the wiki's pages against the file. See DESIGN.md ("The global bar", "The
// footer"). The styling is the shared .uo-globalbar* / .uo-footer* in
// uo-design.css; no per-site CSS.
//
// The definition is loaded once per build: the live hub file first (short
// timeout, so an offline build still works), else the vendored copy in
// src/data/uo-nav.json (`npm run sync-nav` refreshes it from the hub).
import vendored from '../data/uo-nav.json';

const NAV_URL = 'https://www.uotavern.com/uo-nav.json';

export type NavItem = { id: string; label: string; href: string };
export type Nav = { version: number; brand: { label: string; rune: string; href: string }; items: NavItem[] };

function isNav(x: unknown): x is Nav {
	const n = x as Nav;
	return !!n && typeof n === 'object' && !!n.brand && Array.isArray(n.items) && n.items.length > 0;
}

let navPromise: Promise<Nav> | undefined;

/** The nav definition, fetched once and shared by every page of the build. */
export function loadNav(): Promise<Nav> {
	navPromise ??= (async () => {
		try {
			const res = await fetch(NAV_URL, { signal: AbortSignal.timeout(3000) });
			if (res.ok) {
				const live = await res.json();
				if (isNav(live)) return live;
			}
		} catch {
			// offline, or the hub has not published the file yet — use the vendored copy
		}
		return vendored as Nav;
	})();
	return navPromise;
}

/** Same escaping as Python's html.escape(quote=True). */
export const esc = (s: string) =>
	s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;');

// One toggle for all sites (uo_nav.TOGGLE): self-contained, so the page needs
// no extra script for it. Kept character-for-character equal to the hub's.
export const TOGGLE =
	'<button class="uo-theme-toggle" type="button" aria-label="Toggle light/dark theme" ' +
	"onclick=\"(function(d){var n=d.getAttribute('data-theme')==='dark'?'light':'dark';" +
	"d.setAttribute('data-theme',n);try{localStorage.setItem('uo-theme',n);" +
	"localStorage.setItem('starlight-theme',n);}catch(e){}})(document.documentElement)\">" +
	'<span class="uo-theme-toggle__moon" aria-hidden="true">🌙</span>' +
	'<span class="uo-theme-toggle__sun" aria-hidden="true">☀</span></button>';

/** uo_nav.render_globalbar(active): the bar with only `active` marked current. */
export function renderGlobalbar(nav: Nav, active: string): string {
	if (!nav.items.some((i) => i.id === active)) {
		throw new Error(`uo-nav.json has no "${active}" item; known: ${nav.items.map((i) => i.id).join(', ')}`);
	}
	const links = nav.items
		.map(
			(item) =>
				`<a${item.id === active ? ' class="is-active" aria-current="page"' : ''} ` +
				`href="${esc(item.href)}">${esc(item.label)}</a>`,
		)
		.join('');
	return (
		'<div class="uo-globalbar"><div class="uo-globalbar__inner">' +
		`<a class="uo-globalbar__brand" href="${esc(nav.brand.href)}">${esc(nav.brand.label)} ` +
		`<span class="uo-globalbar__rune" aria-hidden="true">${esc(nav.brand.rune)}</span></a>` +
		`<nav class="uo-globalbar__nav" aria-label="UO Tavern">${links}${TOGGLE}</nav></div></div>`
	);
}

// The disclaimer, verbatim (uo_nav.DISCLAIMER).
export const DISCLAIMER =
	'An independent fan project. Ultima Online belongs to its respective owners. ' +
	'Anima is open source (MIT / Apache-2.0) and not affiliated with EA or Broadsword.';

export type FooterExtra = [label: string, href: string];
export type FooterLang = [code: string, label: string, href: string];

/**
 * uo_nav.render_footer(tagline, extras, langs): the six menu items in menu
 * order, then up to three site extras, then GitHub; one tagline after
 * "UO Tavern ·"; the disclaimer verbatim; language links only for pages that
 * exist in that language.
 */
export function renderFooter(nav: Nav, tagline: string, extras: FooterExtra[] = [], langs: FooterLang[] = []): string {
	if (extras.length > 3) throw new Error('a footer carries at most three site extras');
	let links = nav.items.map((i) => `<a href="${esc(i.href)}">${esc(i.label)}</a>`).join('');
	links += extras.map(([l, h]) => `<a href="${esc(h)}">${esc(l)}</a>`).join('');
	links += '<a href="https://github.com/uotavern">GitHub</a>';
	const langRow = langs.map(([code, l, h]) => `<a href="${esc(h)}" lang="${code}">${esc(l)}</a>`).join('');
	return (
		'<footer class="uo-footer"><div class="uo-footer__inner">' +
		`<nav class="uo-footer__nav" aria-label="Explore UO Tavern">${links}</nav>` +
		`<p class="uo-footer__tagline">UO Tavern · ${esc(tagline)}</p>` +
		`<p class="uo-footer__fine">${DISCLAIMER}</p>` +
		(langRow ? `<p class="uo-footer__langs">${langRow}</p>` : '') +
		'</div></footer>'
	);
}
