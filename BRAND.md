# oKane brand

Source masters: `oKane_Logo_v9.psd` (horizontal) and `oKane_Logo_Vertical_v3.psd` (vertical), both kept outside the repository.
Preview: `npm run dev` → `/brand/preview.html`.
Automated build: `scripts/brand/AGENTS.md` (`npm run brand:bootstrap`, `npm run brand:build`, `npm run brand:check`).

## Assets

| File | Use |
| --- | --- |
| `public/brand/logo-lockup.svg` | Primary lockup on light backgrounds. Star and Japanese are vector; the wordmark is the original raster from the PSD, so its filters and effects are preserved. |
| `public/brand/logo-lockup.png` | Exact transparent raster at 1050×375. Use when a PNG is required. |
| `public/brand/logo-lockup-inverse.svg` | Lockup for dark or saturated backgrounds. Uses a white silhouette of the original wordmark. |
| `public/brand/logo-lockup-monochrome.svg` | One-color black lockup. Uses a black silhouette of the original wordmark. |
| `public/brand/logo-lockup-monochrome-white.svg` | One-color white lockup. Uses a white silhouette of the original wordmark. |
| `public/brand/logo-lockup-vertical.svg` | Vertical badge. Star and Japanese vector; wordmark raster from the vertical PSD. Transparent interior with a black rounded frame. |
| `public/brand/logo-lockup-vertical.png` | Exact transparent raster at 716×933. |
| `public/brand/logo-lockup-vertical-inverse.svg` | Vertical badge for dark backgrounds. White frame and white wordmark silhouette. |
| `public/brand/logo-lockup-vertical-monochrome.svg` | One-color black vertical badge. |
| `public/brand/logo-lockup-vertical-monochrome-white.svg` | One-color white vertical badge. |
| `public/brand/logo-mark.svg` | Star mark, fully vector. Favicon and app icon. |
| `public/brand/logo-mark-monochrome.svg` | Black star mark. |
| `public/brand/logo-mark-monochrome-white.svg` | White star mark. |
| `public/brand/logo-mark-512.png` … `logo-mark-16.png` | Raster mark sizes. |
| `public/brand/favicon.ico` | 16/32/48 favicon. |
| `public/brand/apple-touch-icon.png` | 180×180 touch icon. |
| `public/brand/og-image.png` | 1200×630 social preview. |
| `public/brand/CREDITS.md` | Font and license references. |

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#000000` | Wordmark and Japanese on light backgrounds. |
| Paper | `#ffffff` | Wordmark outline and light surfaces. |
| Inverse text | `#f5f5f5` | Wordmark and Japanese on dark backgrounds. |
| Star outline | `#5c5c5c` | Star edge. |
| Star dark | `#909090` | Gradient end. |
| Star mid | `#c9c9c9` | Gradient middle. |
| Star light | `#ededed` | Gradient highlight. |

## Typography

- **Wordmark:** Vahika Regular (CC0). The PSD layer was rasterized with filters and effects, so the lockups embed the original raster instead of a vector reconstruction.
- **Japanese:** Noto Serif CJK JP Black (SIL OFL 1.1), converted to vector paths.
- **Star:** custom SVG, same geometry as the existing favicon.

The vector wordmark was rejected: it lost the PSD filters and effects. The exact raster master is `logo-lockup.png`; the SVGs keep the original wordmark raster.

## Clear space

Keep at least **half the star height** free around the lockup. At native size that is about 116 px on each side.

## Minimum sizes

- Full horizontal lockup: **320 px wide**. Below that, use the mark.
- Full vertical lockup: **240 px wide**.
- Mark: **16 px** minimum.

## Usage

- Use the primary horizontal lockup for headers, README and wide spaces.
- Use the vertical lockup for square or narrow spaces, mobile and badges.
- Use the inverse lockup on dark or saturated backgrounds.
- Use the monochrome versions when color is not available.
- Do not stretch, rotate or recolor the logo.
- Do not recolor the star gradient.
- Do not add shadows, glows, strokes or other effects.
- Do not place the light lockup on a busy or dark background.
- The vertical frame has a transparent interior; it takes the color of the surface behind it.

## Licenses and publication

- The star is original work.
- The Japanese text uses Noto Serif CJK JP Black, SIL OFL 1.1.
- The wordmark uses Vahika Regular, CC0 1.0 (no rights reserved). The font file is not redistributed.
- Vahika license: https://creativecommons.org/publicdomain/zero/1.0/
- See `public/brand/CREDITS.md` for the full references.

## Regeneration

```bash
npm run brand:bootstrap
BRAND_PSD_HORIZONTAL="$HOME/Documentos/oKane_Logo_v9.psd" \
BRAND_PSD_VERTICAL="$HOME/Documentos/oKane_Logo_Vertical_v3.psd" \
npm run brand:build
npm run brand:check
```

The contract is in `scripts/brand/AGENTS.md`. The pipeline does:

1. Extract the PSD layers from both masters (`oKane_Logo_v9.psd` and `oKane_Logo_Vertical_v3.psd`).
2. Rebuild each transparent lockup from its non-background layers.
3. Recreate the Japanese text as SVG paths with Noto Serif CJK JP Black.
4. Keep each original wordmark as a transparent PNG/silhouette inside its SVG. Do not vectorize it: the PSD filters and effects are part of the design.
5. Render the mark from `public/favicon-star.svg` geometry.
6. Draw the vertical rounded frame as a vector border.
7. Export the raster sizes, favicon, touch icon and OG image.

The exact PNG masters are `logo-lockup.png` (horizontal) and `logo-lockup-vertical.png` (vertical). The SVGs are hybrid: star and Japanese vector, original wordmark raster.
