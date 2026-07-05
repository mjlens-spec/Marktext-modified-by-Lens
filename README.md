# Marktext modified by Lens

Lens-flavored local customization for MarkText on macOS. This repository adds two built-in MarkText theme options, export CSS themes, and a replacement macOS app icon.

The package is designed for a local installed copy of MarkText `0.19.1`. It does not include or redistribute MarkText binaries or `app.asar`.

## Included

- `themes/lens-design-marktext.css`: Lens Design editor theme based on the Lens Design color and typography system.
- `themes/claude-like-marktext.css`: MarkText adaptation of the Typora Claude-like theme.
- `themes/export/lens-design.css`: HTML/PDF export theme for Lens Design.
- `themes/export/claude-like.css`: HTML/PDF export theme for Claude-like.
- `icon/lens-marktext-icon-peacock-source.png`: Raw image-generation render with bold peacock-blue `M`.
- `icon/lens-marktext-icon-peacock-alpha.png`: Transparent PNG source used to build the app icon.
- `icon/lens-marktext-icon-peacock-preview.png`: Grey-background preview for checking alpha edges.
- `icon/lens-marktext-icon.png`: 1024px PNG app icon.
- `icon/lens-marktext-icon.icns`: macOS ICNS app icon.
- `scripts/install-builtin-themes.sh`: Backs up `app.asar`, injects the built-in theme entries, repacks, and ad-hoc signs MarkText.
- `scripts/install-theme.sh`: Backs up `preferences.json`, installs export themes, clears Custom CSS, and selects `lens-design`.
- `scripts/install-icon.sh`: Backs up MarkText app icon files, replaces them, ad-hoc signs the app, and refreshes Quick Look cache.

## Install

Install built-in theme options:

```bash
./scripts/install-builtin-themes.sh
```

Install user preferences and export themes:

```bash
./scripts/install-theme.sh
```

Build and install the icon:

```bash
./scripts/build-icon.sh icon/lens-marktext-icon-peacock-alpha.png
./scripts/install-icon.sh
```

Restart MarkText after installing themes or icon. Finder and Dock icon caches can lag; quit and relaunch MarkText once if the old icon is still visible.

## Lens Design Mapping

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

## License and Notices

This project is MIT licensed. See `LICENSE` and `NOTICE.md` for upstream copyright, license, font, and trademark notes.

Sources:

- MarkText: https://github.com/marktext/marktext
- Typora Claude-like theme page: https://theme.typora.io/theme/Claude-Theme/
- Claude-like source theme: https://github.com/Muyiiiii/Typora_Claude-Like_Theme
