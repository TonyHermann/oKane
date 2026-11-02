# Third-party notices

Assets and code bundled in this repository that were not written by the project
author. Everything is served from this repository: the app makes no requests to
third-party origins.

## XP.css

- **Version:** 0.2.6
- **Upstream:** https://github.com/botoxparty/XP.css
- **License:** MIT — Copyright 2020 Adam Hammad, Jordan Scales
- **Bundled as:** `src/ui/styles/base/_xp.css` (unmodified) and the webfonts it
  declares in `src/ui/styles/base/`: `ms_sans_serif.woff2`,
  `ms_sans_serif_bold.woff2`, `PerfectDOSVGA437Win.woff2`.
- Do not edit `_xp.css` locally. Keep upstream in sync so the file stays
  replaceable.

## Asar

- **Upstream:** https://fonts.google.com/specimen/Asar
- **License:** SIL Open Font License 1.1
- **Bundled as:** `src/assets/fonts/asar-regular.woff2` (latin subset).

## Images

- `src/assets/images/background.png` and
  `src/assets/images/fondo-a-cuadros-nihongo.png` — project author.
- `public/favicon.svg` — project author.
- The surface texture in `.main-layout` is drawn with CSS gradients, so it is
  not an asset and carries no license.
