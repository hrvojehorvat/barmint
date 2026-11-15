#!/usr/bin/env bash
# Regenerates the PNG brand assets from the HTML sources in this folder (needs Google Chrome).
set -euo pipefail
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
shot() { "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size="$2" --screenshot="$PWD/../../public/$3" "file://$PWD/$1" 2>/dev/null; }
shot og-image.html 1200,630 og-image.png
shot apple-touch-icon.html 180,180 apple-touch-icon.png
echo "Wrote public/og-image.png and public/apple-touch-icon.png"
