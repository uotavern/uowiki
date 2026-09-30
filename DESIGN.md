# UO Tavern — Design System

One product, one tone. The landing **hub** (`www.uotavern.com`, static HTML), the
**wiki** (`/wiki`, Astro + Starlight), the **forum** (`/forum`, Next.js + Tailwind), the
**arena** (`/arena`, static, served from the game host) and the **Anima** pages
(`/anima/*`, hub) must look and feel like a single site. The replay viewer
(`arena.uotavern.com/replay/`) is a full-screen canvas: it keeps its dark stage but must
carry the product name and link back to `https://www.uotavern.com/arena/`. This document is the
**single source of truth** for that consistency.

> **Golden rule:** never hand-pick a colour, font, or spacing value in a component.
> Use a token from `uo-design.css`. If a value is missing, add it to the token file
> (and this doc) first, then use it.

## The canonical token file

`uo-design.css` defines every design token as a CSS custom property, plus the
shared `.uo-globalbar` component. It is **byte-identical** in all three repos:

| Repo | Path |
| --- | --- |
| hub | `uohub/uo-design.css` |
| wiki | `uowiki/src/styles/uo-design.css` |
| forum | `uotavern/src/app/uo-design.css` |
| arena | `uotavern/arena/uo-design.css` |

When you change tokens, change them in **one** repo, then copy the file verbatim to
the others (`cp`), and rebuild them all. `uohub/tools/check-client.py` fails on drift.

## Tokens

### Colour — light parchment by default, dark by choice

| Token | Value | Use |
| --- | --- | --- |
| `--uo-bg` | `#0b0a12` | page background (ink) |
| `--uo-bg-elev` | `#131120` | elevated band / alt section |
| `--uo-panel` | `#16131f` | card / panel surface |
| `--uo-panel-translucent` | `rgba(22,19,34,.72)` | panel over imagery |
| `--uo-line` | `rgba(217,179,92,.22)` | **gold hairline border** (default) |
| `--uo-line-soft` / `--uo-line-strong` | `.12` / `.40` | softer / stronger hairline |
| `--uo-gold` | `#d9b35c` | links, accents |
| `--uo-gold-bright` | `#f0cd7a` | hover / active |
| `--uo-gold-dim` | `#c7a46b` | secondary gold |
| `--uo-ink` | `#ece3cf` | primary text (parchment) |
| `--uo-ink-dim` | `#b9ad92` | muted text |
| `--uo-parch` | `#efe3c4` | warm highlight |
| `--uo-white` | `#f6efdc` | headings / strongest text |
| `--uo-ok` / `--uo-danger` / `--uo-info` | `#2e7d32` / `#b3261e` / `#2f5fa8` (dark `#6fcf6f` / `#e06b6b` / `#6f9fe0`) | status: online/success, offline/error, the other side/notice. `*-rgb` twins hold the channels for tints |

The table above describes the dark palette. The default light palette is defined
in `:root` in `uo-design.css`: parchment `#f7f3e7`, ink `#2c2618`, and deep gold
`#9c7414`. `data-theme="dark"` selects the dark palette. All sites share the
`uo-theme` localStorage preference; the wiki also mirrors `starlight-theme`.
Borders use the shared gold hairline tokens in both themes.

### Type

| Token | Stack | Use |
| --- | --- | --- |
| `--uo-font-display` | `Cinzel, 'EB Garamond', Georgia, serif` | all headings, brand, site title |
| `--uo-font-body` | `'EB Garamond', Georgia, serif` | body copy (all three sites) |
| `--uo-font-rune` | `'Britannian', serif` | runic flourishes ("Britannia", mantras) |
| `--uo-font-mono` | system mono | code, IDs, item numbers |

`Cinzel` + `EB Garamond` load from Google Fonts via the `@import` at the top of
`uo-design.css`. **`Britannian` is a local font** (`/fonts/britannian-runic.ttf`),
so its `@font-face` is declared **per-site** (the URL differs: `/fonts/…` on the hub
and forum, `/wiki/fonts/…` on the wiki).

Headings use `--uo-font-display`; body text uses `--uo-font-body`. Both are serif —
the look is a classical illuminated book, not a modern sans UI.

### Geometry

`--uo-radius` 12px · `--uo-radius-sm` 7px · `--uo-shadow` `0 10px 30px rgba(0,0,0,.4)`
· `--uo-maxw` 1140px · `--uo-gutter` 24px · `--uo-navh` 56px (100px at ≤760px).
`--uo-space-1/2/3/4/6/8/12` = 8/16/24/32/48/64/96px. `--uo-tap` = 44px.

## Names and page titles

| Concept | Write it as | Not |
| --- | --- | --- |
| the whole product | UO Tavern | Uotavern, UO tavern |
| the sites, as in the menu | Home · Wiki · Forum · Arena · Anima · Client | The Wiki, UO Wiki (except the wiki's own landing headline), the Chronicle (a section inside the forum) |
| the game client | Anima client (menu label "Client") | Anima Client, Anima alone when the client is meant |
| the AI family and its overview page | Anima | Anima AI |
| the two brains | Anima2, Anima3 (no space) | Anima 2 |
| what players do in the arena | a duel; rounds inside it | match, except in ruleset text where the server says "match" |

Page titles follow one template: **`Page — Section | UO Tavern`** (the hub's home is
`UO Tavern — …`). A site that runs its own title template (the forum, the wiki) sets it to
this shape once; a page never repeats the suffix by hand.

## The global bar (`.uo-globalbar`)

Every page on every site starts with the same bar so navigation between the sites
feels like one app. **Its menu is defined once, in `uohub/uo-nav.json`** (published at
`https://www.uotavern.com/uo-nav.json`): the brand and the items in order —
Home · Wiki · Forum · Arena · Anima · Client. Both Anima pages (`/anima3/`, `/anima/`)
sit under the one "Anima" item. Each site renders the bar from that file and marks only
its own item active:

| Site | Renders the bar in |
| --- | --- |
| hub | `tools/uo_nav.py` → `render_globalbar(active)` (used by `build-portal.py`, `build-client.py`) |
| wiki | `src/components/Header.astro` |
| forum | `src/components/layout/GlobalBar.tsx` |
| arena | `uotavern/arena/build-nav.py` (run by `arena/deploy.sh`) |

Markup contract (what every renderer must produce; the styling lives in `uo-design.css`):

```html
<div class="uo-globalbar">
  <div class="uo-globalbar__inner">
    <a class="uo-globalbar__brand" href="https://www.uotavern.com/">
      UO Tavern <span class="uo-globalbar__rune" aria-hidden="true">Britannia</span>
    </a>
    <nav class="uo-globalbar__nav" aria-label="UO Tavern">
      <a href="https://www.uotavern.com/">Home</a>
      <a class="is-active" aria-current="page" href="https://www.uotavern.com/wiki/">Wiki</a>
      …one <a> per item, in uo-nav.json order, absolute hub URLs…
      <button class="uo-theme-toggle" …>🌙 ☀</button>   <!-- the inline toggle from uo_nav.TOGGLE -->
    </nav>
  </div>
</div>
```

Set `is-active` and `aria-current="page"` on the current site's item only. Links are
**absolute** hub URLs (so they work behind the path proxy). The theme toggle is the shared
inline one; a site must not also wire its own click handler to it (it would flip twice).
At ≤760px the brand and toggle occupy the first row and the items the second. The wiki
header offset must consume `--uo-navh`; do not hard-code its height.

**To change the menu:** edit `uo-nav.json`, rebuild and redeploy the four sites, then run
`python3 tools/check-globalbar.py` — it fetches every live page and fails on any bar that
differs from the file. Never edit a copy of the bar by hand.

Site-specific navigation (the forum's board row, the wiki's search row, the arena's
Matches/Rankings row) goes in a **second row under the bar**, never into the bar itself.

## The footer (`.uo-footer`)

Every page ends with the same block, rendered from `uo-nav.json` like the bar
(`uo_nav.render_footer(tagline, extras, langs)` on the hub; each site renders the same markup):

```html
<footer class="uo-footer"><div class="uo-footer__inner">
  <nav class="uo-footer__nav" aria-label="Explore UO Tavern">
    <!-- the six menu items, in menu order, absolute URLs -->
    <!-- then this site's extras, at most three: Forum RSS · Duel results · Releases … -->
    <a href="https://github.com/uotavern">GitHub</a>
  </nav>
  <p class="uo-footer__tagline">UO Tavern · <!-- one line for this site --></p>
  <p class="uo-footer__fine"><!-- the disclaimer, verbatim: uo_nav.DISCLAIMER --></p>
  <p class="uo-footer__langs"><!-- only languages this page exists in --></p>
</div></footer>
```

Rules: menu items first and in menu order; one tagline; the disclaimer word for word
("An independent fan project. Ultima Online belongs to its respective owners. Anima is
open source (MIT / Apache-2.0) and not affiliated with EA or Broadsword."); GitHub last;
no in-jokes; language links only where that page exists in that language. Styling lives in
`uo-design.css`; a site adds no footer CSS of its own.

## Responsive rules

- Mobile-first; the navigation stacks at 760px. Content grids use available width.
- **Never allow horizontal overflow.** Every site sets
  `html, body { overflow-x: hidden; max-width: 100%; }` and wide elements
  (tables, code blocks, image rows) get `overflow-x: auto` on a wrapping container,
  not on the page.
- Content max-width is `--uo-maxw` (1140px), centred, with `--uo-gutter` side
  padding that shrinks to 16px on mobile.
- Navigation tap targets ≥ 44px tall. Keep visible keyboard focus and a skip link.

## Per-stack wiring

### Hub (static HTML) — `uohub/`
`<link rel="stylesheet" href="/uo-design.css">` in `<head>`. Local styles use
`var(--uo-*)` tokens. Declare the `Britannian` / `UOAscii` `@font-face` locally
(`/fonts/…`). Render `.uo-globalbar` markup directly.

### Wiki (Astro + Starlight) — `uowiki/`
Add both stylesheets to `astro.config.mjs` `customCss`:
`['./src/styles/uo-design.css', './src/styles/theme.css', './src/styles/sprites.css']`.
`theme.css` **maps tokens → Starlight variables** (`--sl-color-*` ← `--uo-*`),
supports both themes, applies `--uo-font-display` to headings and `--uo-font-body` to text,
and hides the theme toggle. The global bar lives in the `Header.astro` component
override and uses the shared `.uo-globalbar` classes. `Britannian` `@font-face`
points at `/wiki/fonts/…`.

### Forum (Next.js + Tailwind) — `uotavern/`
`@import './uo-design.css';` at the top of `globals.css`. Tailwind's `uo-*` colour
and font utilities are mapped to the tokens in `tailwind.config` (e.g.
`colors['uo-bg'] = 'var(--uo-bg)'`), so existing `bg-uo-bg` / `text-uo-gold`
utilities resolve to the shared tokens. The `GlobalBar` component emits the shared
`.uo-globalbar` markup. Body font is `--uo-font-body`.

## Checklist when touching design

1. Change values in `uo-design.css` only; copy to all three repos.
2. Update this file if you add/rename a token.
3. Rebuild and screenshot **all three** sites at desktop (1280) **and** mobile (390).
4. Confirm: no horizontal scroll, gold hairlines (not grey), Cinzel headings,
   legible text in light and dark themes, and the same global navigation everywhere.
