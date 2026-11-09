# oKane brand pipeline

This directory builds the published brand assets from the PSD masters.

## Commands

```bash
npm run brand:bootstrap
BRAND_PSD_HORIZONTAL="$HOME/Documentos/oKane_Logo_v9.psd" \
BRAND_PSD_VERTICAL="$HOME/Documentos/oKane_Logo_Vertical_v3.psd" \
npm run brand:build
npm run brand:check
```

`brand:bootstrap` creates `.brand-venv` and installs the Python dependencies. It is a one-time step per machine.

`brand:build` accepts `--target horizontal` or `--target vertical` to rebuild one lockup.

`brand:check` validates the generated files, dimensions, SVG contents and preview references without needing the PSDs.

## Inputs

- Horizontal PSD: `BRAND_PSD_HORIZONTAL`.
- Vertical PSD: `BRAND_PSD_VERTICAL`.
- Japanese font: `BRAND_JP_FONT`, or the `fallbackFont` in `brand.config.json`.
- Layer names are defined in `brand.config.json`.

Horizontal layers:

- `oKane`: wordmark, pixel layer.
- `favicon-star`: star, smart object.
- `おかね`: Japanese, type layer.

Vertical layers:

- `Rectangle 1`: rounded frame, pixel layer. Used only in the exact PNG.
- `oKane`, `favicon-star`, `おかね`: same as horizontal.

If a PSD changes but keeps these names, the build works. If names change, update `brand.config.json`.

## Outputs

The build writes to `public/brand/`:

- `logo-lockup.svg`, `.png`, `-inverse.svg/.png`, `-monochrome.svg`, `-monochrome-white.svg`, and their PNGs.
- `logo-lockup-vertical.svg`, `.png`, and the same variants.
- `logo-mark.svg`, `logo-mark-monochrome.svg`, `logo-mark-monochrome-white.svg`.
- `logo-mark-512.png` through `logo-mark-16.png`.
- `favicon.ico`, `apple-touch-icon.png`, `og-image.png`.

`logo-lockup.png` and `logo-lockup-vertical.png` are the exact transparent composites. The SVGs are hybrid: the wordmark is the original raster from the PSD, while the star and Japanese text are vector.

## Rules

- Do not vectorize the wordmark. The PSD layer was rasterized with filters and effects; the raster is the source of truth.
- Do not add IME text to the SVGs. The Japanese text is converted to paths.
- Do not replace the exact PNGs with SVG renders.
- The vertical frame is drawn as a vector rounded border in the SVGs. The exact frame is in the vertical PNG.
- Inverse and monochrome variants use silhouettes of the wordmark. They intentionally drop the PSD effects.
- The star vector is the same geometry as `public/favicon-star.svg`.
- Do not commit the PSD files or `.brand-venv/`.

## Docs and preview

`public/brand/preview.html`, `BRAND.md` and `public/brand/CREDITS.md` are maintained by hand. The build only regenerates assets. Update the preview when asset names change; `brand:check` verifies that every preview reference exists.

## Adding a PSD

Add a target to `brand.config.json` with:

- `key`
- `psd` (`env:VARIABLE_NAME` is supported)
- `output` basename
- `canvas` size
- `layers`
- `compositeLayers`
- optional `frame`

Run `brand:build` and then `brand:check`.

## Fonts and licenses

- Wordmark: Vahika Regular by Raymond Larabie, CC0 1.0. The font file is not redistributed; only the raster wordmark is used.
- Japanese: Noto Serif CJK JP Black, SIL Open Font License 1.1, converted to paths.
- Star: original oKane work.

See `public/brand/CREDITS.md` and `BRAND.md` for the public references.
