#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PY="$ROOT/.brand-venv/bin/python"

if [ ! -x "$PY" ]; then
  PY="python3"
fi

exec "$PY" "$ROOT/scripts/brand/build_brand.py" "$@"
