#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESTINATION="${1:-$ROOT/outputs/quicklook}"
VERSION="${REVERSION_VERSION:-1.1.0}"
WORK="$(mktemp -d "$ROOT/.tmp/reversion-quicklook.XXXXXX")"
PROJECT="$WORK/ReversionQuickLook.xcodeproj"
DERIVED_DATA="$WORK/DerivedData"
BUILT_EXTENSION="$DERIVED_DATA/Build/Products/Release/ReversionQuickLook.appex"

if ! command -v xcodegen >/dev/null 2>&1; then
  echo "xcodegen is required to build Reversion Quick Look." >&2
  exit 1
fi

mkdir -p "$DESTINATION"
mkdir -p "$WORK/Sources"
cp "$ROOT/quicklook/project.yml" "$ROOT/quicklook/Info.plist" "$ROOT/quicklook/ReversionQuickLook.entitlements" "$WORK/"
ditto "$ROOT/quicklook/Sources" "$WORK/Sources"
xcodegen generate \
  --spec "$WORK/project.yml" \
  --project "$WORK" \
  --cache-path "$WORK/xcodegen-cache.json"
xcodebuild \
  -quiet \
  -project "$PROJECT" \
  -scheme ReversionQuickLook \
  -configuration Release \
  -derivedDataPath "$DERIVED_DATA" \
  MARKETING_VERSION="$VERSION" \
  CURRENT_PROJECT_VERSION="$VERSION" \
  CODE_SIGNING_ALLOWED=NO \
  build

if [[ ! -d "$BUILT_EXTENSION" ]]; then
  echo "Quick Look build did not produce: $BUILT_EXTENSION" >&2
  exit 1
fi

rm -rf "$DESTINATION/ReversionQuickLook.appex"
ditto "$BUILT_EXTENSION" "$DESTINATION/ReversionQuickLook.appex"

echo "Built Reversion Quick Look extension:"
echo "  $DESTINATION/ReversionQuickLook.appex"
echo "Work dir kept for inspection: $WORK"
