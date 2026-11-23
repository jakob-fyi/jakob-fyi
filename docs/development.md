# jakob.fyi – Development

Technical notes for working on the website. The [README](../README.md) is kept short on purpose.

## Getting started

```bash
npm ci
npm start          # dev server (Parcel) + regenerates index.html on content changes
npm run generate   # build src/index.html from content/*.json once
npm run clean      # delete Parcel cache and dist
npm test           # unit & component tests (Vitest)
npm run ci:build   # production build into ./dist
```

If the dev server shows an outdated state after a branch switch, reset or
rebase, stop it and run `npm run clean && npm start`.

## Structure

- `content/*.json` – all entries (projects, events, stories, recommendations, jobs, links)
- `content/schema.json` – JSON Schema for the content files (autocomplete in VS Code)
- `src/index.template.html` – page skeleton with `<!-- @content name -->` placeholders
- `src/index.html` – **generated** by `scripts/build-html.mjs`, not in git; do not edit
- `scripts/` – generator (`build-html.mjs`, `content/`) and the one-off migration
  helper `extract-content.mjs`
- `src/components/` – Lit web components
    - `ui/` – building blocks (card, tag, titles)
    - `feature/` – section, project cards, gallery, collapsible area
    - `shared/` – icons and styles shared across shadow roots
- `src/scss/` – global styles and theme variables (`body.dark` = dark mode)

## Content

Entries live in `content/*.json`, one file per block of the page. The file
name matches a `<!-- @content name -->` placeholder in
`src/index.template.html`. `npm start`, `npm test` and `npm run ci:build`
generate `src/index.html` first; the build stops with a message such as
`archive.json › sections[3] › entries[1] "DDFIY": missing "link"` when the
data is invalid (unknown or missing fields, duplicate ids, missing images).

A block is either a section or a collapsible area:

```json
{ "$schema": "./schema.json", "type": "section", "id": "featured", "title": "Current & Featured", "entries": [] }
```

```json
{
    "$schema": "./schema.json",
    "type": "collapsible",
    "id": "archive",
    "heading": "Archive",
    "summary": "years",
    "summaryLabel": "Vorträge, Projekte und Texte",
    "sections": [{ "title": "2025", "entries": [] }]
}
```

An entry's `type` names the component (`project-link`, `project-text`,
`project-event`, `project-story`, `job`, `link`); `title` becomes `maintitle`,
the other fields keep their attribute names. `"hidden": true` leaves an entry
out without deleting it; on a whole block (e.g. `recommendations.json`) it
hides the entire area. Event details go into `body` as HTML, one string per
paragraph; story images into `images` as `{ "src", "alt", "width", "height" }`
(paths relative to `src/`, sizes in px to avoid layout shift).

### Archive, Stories & Recommendations

All three areas are `fyi-jakob-collapsible` elements that start collapsed; while
collapsed, a click anywhere on the area opens it. Count and teaser line are
computed from the contained sections, so adding an entry is enough. A link to
`#archive`, `#stories`, `#recommendations` or any id inside (e.g.
`#buecherregal`) opens the
area automatically.

A recommendation is a `project-link` in the section of its medium
(`content/recommendations.json`), newest first:

```json
{
    "type": "project-link",
    "title": "Der Mythos des Sisyphos",
    "subtitle": "Albert Camus, 1942",
    "tags": ["Book", "Philosophy"],
    "link": "https://…",
    "target": "_blank",
    "added": "2026-11-14"
}
```

`added` (ISO date) decides which entry the teaser names as "zuletzt". A new
medium is just another `{ "title": "…", "entries": [] }` in `sections`.

### Merging a branch that still edits index.html by hand

Take that branch's `src/index.html` and run
`node scripts/extract-content.mjs path/to/index.html`. It rewrites
`content/*.json` and `src/index.template.html` from it; review the diff, then
`npm run generate`.
