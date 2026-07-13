# MarkText modified by Lens

**English** | [简体中文](README.zh-CN.md)

<img src="icon/lens-marktext-icon.png" alt="Lens MarkText icon" width="128" align="right" />

Lens-flavored customization for [MarkText](https://github.com/marktext/marktext) on macOS: two built-in editor themes, matching HTML/PDF export themes, and a replacement app icon built around the calligraphic Chinese radical `攵` on warm paper.

This package targets a locally installed MarkText `0.19.1`. The source tree does not include or redistribute MarkText binaries or `app.asar` — see [Download](#download) for the prebuilt DMG.

## Download

Prebuilt `arm64` macOS DMGs are published on the [Releases page](https://github.com/mjlens-spec/Marktext-modified-by-Lens/releases). Each DMG contains a MarkText `0.19.1` app bundle with the Lens themes and icon already applied, plus license and notice materials.

The app is ad-hoc signed for local use and is **not Apple notarized**. On first launch, macOS Gatekeeper may require opening it from Finder with Control-click → Open.

## Themes

| Theme | Style |
| --- | --- |
| **Lens Design** | Peacock blue / wine / gold accents on a cool paper background, built on the Lens Design typography system. Large titles use Cormorant Garamond with LXGW WenKai as the CJK fallback, smaller headings use Spectral with the same LXGW WenKai fallback, and body copy uses Noto Sans / Noto Sans SC at 17 px with a 1.7 line height. |
| **Claude-like** | Warm cream paper with a terracotta accent, adapted from the Typora [Claude-like theme](https://github.com/Muyiiiii/Typora_Claude-Like_Theme). Headings use Source Serif 4 with LXGW WenKai as the CJK fallback; body text uses Source Han Sans / Noto Sans SC. |

Both themes ship in two forms:

- Built-in editor themes (`themes/lens-design-marktext.css`, `themes/claude-like-marktext.css`), injected into MarkText's theme picker.
- HTML/PDF export themes (`themes/export/lens-design.css`, `themes/export/claude-like.css`).
- Three independent reading font slots (`--reading-font-title`, `--reading-font-heading`, and `--reading-font-body`) let each theme control large titles, smaller headings, and body copy separately.
- The left sidebar opens to the current document's table of contents on startup.

## Repository layout

- `themes/` — editor and export CSS themes.
- `icon/` — app icon sources and outputs: `lens-marktext-pu-v1-source.png` (original generated source), `lens-marktext-pu-v1-alpha.png` (production source with transparent corners), `lens-marktext-icon.png` (1024 px), `lens-marktext-icon.icns`, the 1.0 production spec, and earlier drafts kept for reference.
- `scripts/install-builtin-themes.sh` — backs up `app.asar`, injects the built-in theme entries, repacks, and ad-hoc signs MarkText.
- `scripts/install-theme.sh` — backs up `preferences.json`, installs the export themes, clears Custom CSS, and selects `lens-design`.
- `scripts/build-icon.sh` — builds the `.icns` from a PNG source (requires ImageMagick: `brew install imagemagick`).
- `scripts/install-icon.sh` — backs up the MarkText app icon files, replaces them, ad-hoc signs the app, and refreshes the icon cache.

## Install from source

Install the built-in theme options:

```bash
./scripts/install-builtin-themes.sh
```

Install user preferences and export themes:

```bash
./scripts/install-theme.sh
```

Build and install the icon:

```bash
./scripts/build-icon.sh
./scripts/install-icon.sh
```

The default icon source is the version 1.0 calligraphic `攵` asset. Pass another PNG or SVG path to `build-icon.sh` to build an alternate icon without changing the default.

Restart MarkText after installing themes or the icon. Finder and Dock icon caches can lag; quit and relaunch MarkText once if the old icon is still visible.

## Lens Design palette

- Peacock blue: `#1F566B`
- Wine: `#8E3B46`
- Gold: `#B0883E`
- Paper: `#F4F6F8`
- Text: `#15181C`
- CJK editorial font: `LXGW WenKai` (霞鹜文楷), with `Noto Serif SC` and `Songti SC` fallbacks
- Title font: `Cormorant Garamond`; heading font: `Spectral`; both fall back to LXGW WenKai for CJK glyphs
- Body/UI fonts: `Noto Sans`, `Noto Sans SC`, Apple/PingFang fallback
- Mono: `JetBrains Mono`, `SF Mono`, Menlo fallback
- Reading roles: wordmark for large titles, display for smaller headings, and sans for body copy. The editor defaults are `Cormorant Garamond`, `Spectral`, and `Noto Sans SC`, with the theme's LXGW WenKai CJK fallback chain. Override the three `--reading-font-*` variables to change them independently.
- Lens Design editor H1 uses a 700 weight so Latin and LXGW WenKai CJK titles carry the same visual weight.

## Compatibility

The app patcher targets the MarkText `0.19.1` bundle structure on macOS:

- App path: `/Applications/MarkText.app`
- User data: `~/Library/Application Support/marktext`
- Bundled app archive: `/Applications/MarkText.app/Contents/Resources/app.asar`

If MarkText changes its bundle structure in a future version, inspect the patch script before running it.

## License and notices

This project is MIT licensed. See [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md) for upstream copyright, license, font, and trademark notes.

Sources:

- MarkText: https://github.com/marktext/marktext
- Typora Claude-like theme page: https://theme.typora.io/theme/Claude-Theme/
- Claude-like source theme: https://github.com/Muyiiiii/Typora_Claude-Like_Theme
