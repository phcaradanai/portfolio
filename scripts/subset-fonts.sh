#!/bin/sh
# Subsets the self-hosted fonts to the glyphs the site uses. Sources are the @fontsource packages; output replaces src/app/fonts/*.woff2.
# Needs fonttools + brotli (python3 -m venv .tmp/venv && .tmp/venv/bin/pip install fonttools brotli).
set -e
PY=${PY:-.tmp/venv/bin/pyftsubset}
SRC=node_modules/@fontsource-variable
PUNCT="U+00A0-00BF,U+00D7,U+2013-2014,U+2018-201D,U+2022,U+2026,U+2192,U+2212"
# Archivo is only ever set in uppercase (vinyl lettering), so lowercase letters are dropped.
$PY $SRC/archivo/files/archivo-latin-wdth-normal.woff2 --unicodes="U+0020-0060,U+007B-007E,U+00C0-00DE,$PUNCT" \
  --layout-features="kern,case" --flavor=woff2 --output-file=src/app/fonts/Archivo-wdth.woff2
$PY $SRC/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2 --unicodes="U+0020-007E,U+00C0-00FF,$PUNCT" \
  --layout-features="kern,liga,tnum,case" --flavor=woff2 --output-file=src/app/fonts/HankenGrotesk.woff2
$PY $SRC/martian-mono/files/martian-mono-latin-wght-normal.woff2 --unicodes="U+0020-007E,$PUNCT" \
  --layout-features="kern" --flavor=woff2 --output-file=src/app/fonts/MartianMono.woff2
ls -la src/app/fonts/*.woff2
