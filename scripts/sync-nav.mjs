// Refresh the vendored copy of the cross-site menu (src/data/uo-nav.json) from
// the hub's published definition. Header.astro fetches the live file at build
// time and falls back to this copy, so run `npm run sync-nav` after the menu
// changes in uohub/uo-nav.json to keep offline builds current too.
import { writeFileSync, readFileSync } from 'node:fs';

const url = process.env.UO_NAV_URL || 'https://www.uotavern.com/uo-nav.json';
const target = new URL('../src/data/uo-nav.json', import.meta.url);

const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
const text = await res.text(); // kept verbatim, so the copy stays byte-equal to the hub file
const nav = JSON.parse(text);
if (!nav?.brand || !Array.isArray(nav.items) || !nav.items.some((i) => i.id === 'wiki')) {
  throw new Error(`${url}: not a uo-nav definition with a "wiki" item`);
}
const before = readFileSync(target, 'utf8');
writeFileSync(target, text);
console.log(before === text ? 'uo-nav.json already current' : `uo-nav.json updated (${nav.items.length} items)`);
