[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/qienzdork/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/qienzdork/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Ledger — GTA VI PS5 Trophy Guide &amp; Tracker

An offline guide and progress tracker for all 55 Grand Theft Auto VI
trophies on PlayStation 5 (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28
hidden; 1,000 Gamerscore on Xbox), with a written guide for every trophy,
a 6-stage roadmap to the Platinum (~200 hours), a Missables page, and a
Sources page. Everything runs locally in the browser — the app makes no
network requests at all.

## Try it

```sh
node serve.ts        # or: node serve.ts --port 8080
# open http://localhost:8080
```

## What it does

- **Checklist** — tick trophies off as you earn them; progress is saved in
  the browser (localStorage) with a live progress bar and Gamerscore total.
- **Search &amp; filters** — by name or guide text, by kind (story, side
  stories, robbery, activities, collectibles, combat, 100% completion),
  by grade, by earned / not earned yet, and by list order, grade or name.
- **Spoiler toggle** — hides the descriptions and guides of the 28 hidden
  trophies until you turn it off.
- **Export / import** — back your progress up as JSON and restore it on
  another machine; reset starts the checklist over.
- **Roadmap** — six stages from the story playthrough to the 100%
  completion cleanup, with hour estimates adding up to about 200 hours.
- **Missables** — the one trophy that can be missed (Positive Mental
  Attitude) and the save strategy for a game with no mission replay.
- **Sources** — where every name, grade and unlock method was verified.

## Layout

- `app/` — the static app: `index.html`, `style.css`, `app.js` (checklist,
  filters, spoiler toggle, export/import), `data/trophies.json` (all 55
  trophies with official descriptions and original guide text).
- `screenshots/` — four rendered views of the app.
- `main.ts` — the entry program (Node 22, standard library only): copies
  `app/` and `screenshots/` into the output dir and writes `dossier.json`
  with the kit's vendored library.
- `serve.ts` — a tiny local static server for trying the app.
- `vendor/makefun-frontend.ts` — the kit's vendored library, unchanged.
- `LICENSE` — MIT.

## Accuracy

The trophy list is the list as reported at launch on 19 November 2026
from the PS5 trophy data via Exophase and the Xbox achievement list,
cross-checked against OutputLag, GTA Vibes and KeenGamer. Rockstar, Sony
and Microsoft have not published an official list, and a few hidden
trophies still have no confirmed unlock method at launch — their guides
say what is known so far. All guide text is original writing for this
entry. No Rockstar artwork, logos or fonts are used.

## Screenshots

The four views in `screenshots/` are rendered with a headless browser
(Playwright's bundled Chromium) against the live app:

- `1-guide.jpg` — the guide checklist.
- `2-detail.jpg` — a trophy card opened to its guide (Maximum Withdrawal).
- `3-roadmap.jpg` — the roadmap page.
- `4-missables.jpg` — the Missables page.

Capture them again with `?view=` and `?open=` on the page URL, for
example `http://localhost:8080/?view=roadmap` or
`http://localhost:8080/?open=t05`.
