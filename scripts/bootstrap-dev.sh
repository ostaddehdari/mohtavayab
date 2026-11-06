#!/usr/bin/env bash
set -Eeuo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

command -v node >/dev/null || { echo 'Node.js 24.15+ is required.' >&2; exit 1; }
command -v corepack >/dev/null || { echo 'Corepack is required.' >&2; exit 1; }
command -v uv >/dev/null || { echo 'uv 0.13.5+ is required.' >&2; exit 1; }

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo 'Created .env from safe local placeholders; change passwords before shared use.'
fi

corepack enable
corepack prepare pnpm@12.18.0 --activate
pnpm install --frozen-lockfile
uv sync --all-packages --frozen

echo 'Development dependencies are ready.'
echo 'Run: pnpm quality'
echo 'Optional infrastructure: docker compose --env-file .env -f infra/compose/compose.dev.yml up -d'

