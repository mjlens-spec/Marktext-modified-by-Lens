# Lens MarkText calligraphic icon 1.0

## Concept

The 1.0 icon uses the calligraphic Chinese radical `攵` as the only central mark. The brush color moves through the Lens Design palette on a warm off-white paper tile:

- Peacock blue: `#1F566B`
- Wine: `#8E3B46`
- Gold: `#B0883E`

## Assets

- `lens-marktext-pu-v1-source.png`: original 1254 × 1254 RGB image-generation output.
- `lens-marktext-pu-v1-alpha.png`: 1024 × 1024 RGBA production source.
- `lens-marktext-icon.png`: canonical 1024 × 1024 app PNG built from the production source.
- `lens-marktext-icon.icns`: macOS icon container with 16–1024 px representations.

The production tile occupies 960 × 960 px, centered on the 1024 px canvas. Its transparent rounded mask uses a 146 px corner radius. This 93.75% scale keeps the mark visually strong while leaving enough Dock breathing room.

## Build and install

```bash
./scripts/build-icon.sh
./scripts/install-icon.sh
```

`build-icon.sh` defaults to `lens-marktext-pu-v1-alpha.png`. Pass another PNG or SVG path to build an alternate icon without changing the 1.0 source.

## Acceptance checks

- Transparent corners remain clean on light and dark backgrounds.
- The `攵` silhouette remains identifiable at 32 px and usable at 16 px.
- The generated PNG and ICNS include every required macOS icon size.
- The installed app resources match the repository artifacts byte-for-byte.
