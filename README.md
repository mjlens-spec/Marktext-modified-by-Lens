# MarkText modified by Lens

**English** | [简体中文](README.zh-CN.md)

<img src="icon/lens-marktext-icon.png" alt="Lens MarkText icon" width="128" align="right" />

Lens-flavored customization for [MarkText](https://github.com/marktext/marktext) on macOS: two built-in editor themes, matching HTML/PDF export themes, and a replacement app icon in a light-paper hand-writing style.

This package targets a locally installed MarkText `0.19.1`. The source tree does not include or redistribute MarkText binaries or `app.asar` — see [Download](#download) for the prebuilt DMG.

## Download

Prebuilt `arm64` macOS DMGs are published on the [Releases page](https://github.com/mjlens-spec/Marktext-modified-by-Lens/releases). Each DMG contains a MarkText `0.19.1` app bundle with the Lens themes and icon already applied, plus license and notice materials.

The app is ad-hoc signed for local use and is **not Apple notarized**. On first launch, macOS Gatekeeper may require opening it from Finder with Control-click → Open.

## Themes

| Theme | Style |
| --- | --- |
| **Lens Design** | Peacock blue / wine / gold accents on a cool paper background, built on the Lens Design color and typography system (Noto Sans + Spectral + LXGW WenKai). Tuned for Chinese-first reading: 17 px body at 1.7 line height, deepened body ink, serif reserved for H1/H2 and quotes, WenKai for CJK emphasis. |
| **Claude-like** | Warm cream paper with a terracotta accent, adapted from the Typora [Claude-like theme](https://github.com/Muyiiiii/Typora_Claude-Like_Theme). Headings use LXGW WenKai / Source Serif 4; body text uses Source Han Sans / Noto Sans SC. |

Both themes ship in two forms:

- Built-in editor themes (`themes/lens-design-marktext.css`, `themes/claude-like-marktext.css`), injected into MarkText's theme picker.
- HTML/PDF export themes (`themes/export/lens-design.css`, `themes/export/claude-like.css`).

## Repository layout

- `themes/` — editor and export CSS themes.
- `icon/` — app icon sources and outputs: `lens-marktext-icon.png` (1024 px), `lens-marktext-icon.icns`, the light-paper source PNG, and earlier drafts kept for reference.
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
./scripts/build-icon.sh icon/lens-marktext-light-paper-final-alpha.png
./scripts/install-icon.sh
```

Restart MarkText after installing themes or the icon. Finder and Dock icon caches can lag; quit and relaunch MarkText once if the old icon is still visible.

## Lens Design palette

- Peacock blue: `#1F566B`
- Wine: `#8E3B46`
- Gold: `#B0883E`
- Paper: `#F4F6F8`
- Text: `#15181C`
- Body/UI fonts: `Noto Sans`, `Noto Sans SC`, Apple/PingFang fallback
- Editorial fonts: `Spectral`, `LXGW WenKai`, `Noto Serif SC`, Georgia fallback
- Wordmark font: `Cormorant Garamond`
- Mono: `JetBrains Mono`, `SF Mono`, Menlo fallback

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
