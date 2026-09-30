// Which OTHER languages a wiki page exists in — for the footer's language row
// (DESIGN.md: "language links only where that page exists in that language").
// Starlight serves every English page under /ko/ and /ja/ too, as an English
// FALLBACK; those are not translations, so we look at the docs collection
// itself: a page exists in a language only if a file for it does. When it does
// not, the row points at that language's wiki root instead.
import { getCollection } from 'astro:content';
import type { FooterLang } from './uo-nav';

const SITE = 'https://www.uotavern.com';
const BASE = '/wiki';

// Root locale first (code, label, URL prefix). Labels are the languages' own names.
const LOCALES: { locale: string | undefined; code: string; label: string }[] = [
	{ locale: undefined, code: 'en', label: 'English' },
	{ locale: 'ko', code: 'ko', label: '한국어' },
	{ locale: 'ja', code: 'ja', label: '日本語' },
];

let idsPromise: Promise<Set<string>> | undefined;

/** Every docs entry id (Starlight slugs: '' for the root index, 'ko' for /ko/). */
function docIds(): Promise<Set<string>> {
	idsPromise ??= getCollection('docs').then(
		(docs) => new Set(docs.map((d) => d.id.replace(/(^|\/)index$/, ''))),
	);
	return idsPromise;
}

/** Split a Starlight route id into its locale (undefined for root) and bare slug. */
function splitId(id: string): { locale: string | undefined; slug: string } {
	const m = /^(ko|ja)(?:\/(.*))?$/.exec(id);
	return m ? { locale: m[1], slug: m[2] ?? '' } : { locale: undefined, slug: id };
}

function url(locale: string | undefined, slug: string): string {
	const parts = [BASE, locale, slug].filter((p) => p !== undefined && p !== '');
	return `${SITE}${parts.join('/')}/`;
}

/**
 * The footer's language links for the page with Starlight route id `id`:
 * every language but the page's own, pointing at the same page where it is
 * translated and at that language's wiki root where it is not.
 */
export async function otherLanguages(id: string): Promise<FooterLang[]> {
	const ids = await docIds();
	const { locale, slug } = splitId(id);
	return LOCALES.filter((l) => l.locale !== locale).map((l) => {
		const target = [l.locale, slug].filter((p) => p !== undefined && p !== '').join('/');
		return [l.code, l.label, ids.has(target) ? url(l.locale, slug) : url(l.locale, '')];
	});
}
