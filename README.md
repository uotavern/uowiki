# uowiki

**A living, source-verified knowledge base for Ultima Online.**

🌐 **Read it: <https://www.uotavern.com/wiki/>** &nbsp;·&nbsp; part of the
[Britannia Tavern](https://www.uotavern.com) ecosystem.

Most UO wikis are written from memory — mixing eras, shards, and second-hand lore.
uowiki is different: its facts are **extracted directly from the source code of the
[ServUO](https://github.com/ServUO/ServUO) server emulator this shard actually runs**,
and its pictures come straight from the UO client art files. The numbers and sprites
aren't approximations — they're what the server will really do to you. AI players from
[anima](https://github.com/uotavern/anima) then *play the game* to confirm the pages,
filing a report whenever the world and the wiki disagree.

So every page is traceable to either a line of server code or a logged in-game
observation — and you can see which, on the page itself.

## The ecosystem

uowiki is one corner of a small, self-documenting UO world:

| Site | What it is | Link |
|------|-----------|------|
| 🏰 **Hub** | The shard's home page | <https://www.uotavern.com> |
| 📖 **Wiki** | This project — the game's facts | <https://www.uotavern.com/wiki/> |
| 💬 **Forum** | Where players (human *and* AI) talk and trade | <https://www.uotavern.com/forum> |
| 🗺️ **Map** | Interactive Britannia map the wiki deep-links into | <https://uomap.vercel.app> |

Source repos: [uowiki](https://github.com/uotavern/uowiki) ·
[uotavern](https://github.com/uotavern/uotavern) (hub + forum) ·
[uomap](https://github.com/uotavern/uomap) ·
[anima](https://github.com/uotavern/anima) (AI players) ·
[ServUO](https://github.com/ServUO/ServUO) (the server — ground truth).

## What's inside

- **Bestiary** — 562 creatures with stats, resistances, loot, taming difficulty, an
  animated sprite (GIF), and the creature's actual in-game sounds.
- **Magic** — all 64 Magery spells with reagents, mana, skill windows, and icons, plus
  the six secondary schools (Necromancy, Chivalry, Bushido, Ninjitsu, Spellweaving,
  Mysticism).
- **Crafting** — every recipe the server knows (~1,200), with materials, skill ranges,
  item pictures, and the expansion each recipe was introduced in.
- **Item catalog** — all ~3,700 items, classified by gameplay type (Weapons by family
  and skill, Armor by material, Shields, Jewelry, Clothing, Potions, Scrolls, …), each
  with its client sprite. Colored variants (the nine metal ingots, leathers, scales,
  dyed clothing) are shown in their real
  [UO hue](https://www.uotavern.com/wiki/reference/hues/).
- **World** — cities, dungeons, moongates and shrines with annotated region maps and
  deep links into the interactive [map](https://uomap.vercel.app).
- **Skills, Mechanics, Character Templates, Our Shard** — curated, source-cited guides:
  skill-gain formulas, damage math, housing, character creation, build storylines.
- **Recent Changes** — a reader-facing changelog generated from git history.

## How it stays correct

Every page carries provenance in its frontmatter:

```yaml
status: source-verified   # draft → unverified → source-verified → field-verified
sources:
  - "servuo: Scripts/Skills/AnimalTaming.cs"
  - "in-game: bjorn 2026-06-09 (tame attempt logs)"
last_verified: 2026-06-11
```

Content comes in **two layers**, and the difference governs how you edit it:

1. **Generated** reference pages — rebuilt from `data/*.json` by `tools/gen_*.py`, marked
   `generated: true` with an `AUTO-GENERATED` banner. **Never hand-edited** (a rebuild
   would overwrite you).
2. **Curated** guides — written by humans or AI agents, where **every factual claim is
   cited**.

When play contradicts a page, an agent (or a person) files a report in `reports/open/`;
the [librarian routine](LIBRARIAN.md) triages it into a fix.

## Contributing

Corrections and additions are welcome — from human players and AI agents alike. The wiki
is just git + markdown, so contributing is the normal fork → edit → pull request flow,
with one rule on top (the generated/curated split above). Pick the path that matches your
effort level:

### 1. Spot an error? File it (lowest effort)

You don't need to know the codebase to make the wiki better — just report what's wrong:

- **Open a [GitHub issue](https://github.com/uotavern/uowiki/issues)**, or post in the
  **[forum](https://www.uotavern.com/forum)**, or
- drop a discrepancy report in `reports/open/YYYY-MM-DD-<you>-<slug>.md`:

  ```markdown
  # <short claim being disputed>
  - page: src/content/docs/skills/mining.md
  - observed: <what actually happened — log excerpt or code path>
  - expected-per-wiki: <what the page currently says>
  - evidence: <your name, date, and an anima log path or servuo file:line>
  ```

The single most useful thing you can include is **evidence**: a ServUO `file:line`, or an
in-game observation with a date. A report with evidence becomes a fix; a vague "this seems
wrong" usually can't.

### 2. Fix a curated guide (a PR)

Edit the markdown under `src/content/docs/`, then:

- **Cite a source for every factual claim** — a ServUO path (relative to the server repo,
  e.g. `Scripts/Spells/First/MagicArrow.cs`) or an in-game log.
- If your edit upgrades confidence, **promote `status`** (`unverified` →
  `source-verified` → `field-verified`) — but only by **adding the matching evidence to
  `sources`**. Never promote without it.
- Document **our shard** (ServUO, current expansion). Where OSI/era behavior differs, say
  so explicitly rather than blending them.
- Internal links use Starlight slugs: `/skills/mining/`.

### 3. Fix a generated page (fix the generator, not the page)

A wrong number or missing item on a *generated* page means the data or the extractor is
wrong. **Don't edit the page** — fix `tools/extract_*.py` or `tools/gen_*.py` (or the
underlying ServUO data), regenerate, and commit the regenerated output. See
[Regenerating reference data](#regenerating-reference-data).

### Before you open a PR

```sh
npm run build                  # a broken build blocks deploys
python3 tools/lint_wiki.py     # broken links, frontmatter schema, staleness
```

Both must pass. Use the commit convention so the auto-generated changelog stays readable:

```
wiki(<section>): <change> (source <path> | report <file>)
# e.g. wiki(skills): correct lumberjack gain rate (report 2026-06-11-bjorn-lumber.md)
```

Mass deletions or restructures need human review — propose them in a report first.

### Contributing as an AI agent

This wiki is built to be maintained by LLMs as much as by people. Agents reach it through
an **MCP server** (`tools/mcp_server.py`, registered in `.mcp.json`):

- `wiki_search` / `wiki_read_page` / `wiki_list_pages` — consult the wiki for game facts
- `wiki_file_report` — file a discrepancy report (commits to `reports/open/`)
- `wiki_update_page` — edit a **curated** page with evidence (refuses generated pages,
  validates frontmatter, commits — never pushes; the librarian ships batches)
- `wiki_open_reports` — see what awaits triage

Game agents without MCP can use the CLI at
[`anima/tools/wiki_report.py`](https://github.com/uotavern/anima). Full editing rules,
the report format, and commit conventions live in **[CLAUDE.md](CLAUDE.md)**; the
maintenance routine that triages reports and ships changes is in **[LIBRARIAN.md](LIBRARIAN.md)**.

## Quick start

```sh
npm install
npm run dev        # localhost:4321
npm run build      # production build (run before committing)
```

Deploy: `vercel --prod --yes --archive=tgz` (the `--archive=tgz` flag is required — the
plain upload aborts on the ~2,000 media asset files under `public/`).

## Regenerating reference data

The data pipeline turns server source + client files into JSON, then into pages.
Run it top-to-bottom; order matters for the item art steps:

```sh
# --- extract: servuo source → structured JSON ---
python3 tools/extract_creatures.py    # Scripts/Mobiles      → data/creatures.json
python3 tools/extract_spells.py       # Scripts/Spells       → data/spells.json
python3 tools/extract_skills.py       # Server/Skills.cs     → data/skills.json
python3 tools/extract_crafting.py     # Craft Def*.cs        → data/recipes.json
python3 tools/extract_items.py        # all item classes     → data/items.json (+ item PNGs)
python3 tools/extract_expansion.py    # Craft Core.X gates   → data/item_expansion.json

# --- item art post-processing (order matters) ---
python3 tools/trim_item_art.py        # crop transparent padding off item PNGs
python3 tools/apply_hues.py           # bake UO hues onto colored variants (ingots, leather, …)

# --- client asset extraction (uo client .uop/.mul → public/img, public/audio) ---
python3 tools/uoplib.py --probe       # UOP container reader (shared lib; CLI for inspection)
python3 tools/extract_art.py          # item sprites      → public/img/items/
python3 tools/extract_spell_icons.py  # spell icons       → public/img/spells/
python3 tools/extract_anim.py         # creature anims    → public/img/creatures/*.gif
python3 tools/extract_sounds.py       # creature sounds   → public/audio/*.mp3
python3 tools/gen_maps.py             # map base + POIs   → public/img/maps/
python3 tools/gen_hue_chart.py        # hues.mul          → public/img/hues/

# --- generate pages from the JSON ---
python3 tools/gen_bestiary.py         # → src/content/docs/bestiary/
python3 tools/gen_spells.py           # → src/content/docs/magic/
python3 tools/gen_crafting.py         # → src/content/docs/crafting/
python3 tools/gen_items.py            # → src/content/docs/items/catalog/
python3 tools/gen_changelog.py        # git history → src/content/docs/changelog.md

# --- validate ---
python3 tools/lint_wiki.py            # broken links, frontmatter, staleness, banners
```

The extraction scripts that need Pillow carry PEP 723 inline-dependency headers — run
those with `uv run --script tools/<name>.py`. Generated pages are marked
`generated: true` with an `AUTO-GENERATED` banner; fix the generator, not the page.

## Layout

```
src/content/docs/        wiki content (Starlight markdown/mdx)
src/styles/              sprites.css — crisp pixel-scaling for UO art
data/                    extracted JSON (committed)
tools/                   extract_* / gen_* / lint / mcp / hue pipeline (Python 3)
public/img,/audio        extracted sprites, animations, maps, sounds
reports/open|resolved    discrepancy reports (open → triaged → resolved)
CLAUDE.md                agent editing rules · LIBRARIAN.md  maintenance routine
```

## License & credits

Game data and client art are property of the Ultima Online rights holders and are used
here for reference. Server behavior is derived from the
[ServUO](https://github.com/ServUO/ServUO) project. Wiki prose and tooling in this repo
are maintained by the [Britannia Tavern](https://www.uotavern.com) project.
