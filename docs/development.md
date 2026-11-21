# jakob.fyi – Development

Technical notes for working on the website. The [README](../README.md) is kept short on purpose.

## Getting started

```bash
npm ci
npm start          # dev server (Parcel)
npm run clean      # delete Parcel cache and dist
npm test           # unit & component tests (Vitest)
npm run ci:build   # production build into ./dist
```

If the dev server shows an outdated state after a branch switch, reset or
rebase, stop it and run `npm run clean && npm start`.

## Structure

- `src/index.html` – all content lives here as `fyi-jakob-*` elements
- `src/components/` – Lit web components
    - `ui/` – building blocks (card, tag, titles)
    - `feature/` – section, project cards, gallery, collapsible area
    - `shared/` – icons and styles shared across shadow roots
- `src/scss/` – global styles and theme variables (`body.dark` = dark mode)

## Content

### Archive & Recommendations

Both areas are `fyi-jakob-collapsible` elements that start collapsed; while
collapsed, a click anywhere on the area opens it. Count and
teaser line are computed from the contained `fyi-jakob-section`s, so adding an
entry is enough. A link to `#archive`, `#recommendations` or any id inside
(e.g. `#kasten`) opens the area automatically.

A recommendation is a `fyi-jakob-project-link` in the section of its medium,
newest first:

```html
<fyi-jakob-project-link
    maintitle="Der Mythos des Sisyphos"
    subtitle="Albert Camus, 1942"
    tags='["Book", "Philosophy"]'
    link="https://…"
    target="_blank"
    added="2026-11-14"
></fyi-jakob-project-link>
```

`added` (ISO date) decides which entry the teaser names as "zuletzt". A new
medium is just another `<fyi-jakob-section maintitle="…">`.
