#!/usr/bin/env bash
#
# Seed the wp-env development site with the AWT showcase content.
#
# Run once after `npm run env:start` on a fresh environment:
#
#   npm run env:seed
#
# What it does:
#   1. Activates the AWT theme.
#   2. Imports .wp-env/seed/showcase-content.xml (component showcase, pattern
#      showcase, dogfood + linter-demo pages, header/navigation template parts).
#   3. Registers the media files (already present via the wp-content/uploads
#      mapping in .wp-env.json) in the media library.
#   4. Rewrites URLs from the old dev host to the wp-env host.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ Activating AWT theme…"
npx wp-env run cli wp theme activate awt
npx wp-env run cli wp option update blogname "AWT Stage 1 Dev"

echo "→ Importing showcase content…"
npx wp-env run cli wp plugin install wordpress-importer --activate
npx wp-env run cli wp import wp-content/awt-seed/showcase-content.xml --authors=skip
npx wp-env run cli wp plugin deactivate wordpress-importer

echo "→ Registering media files in the media library…"
npx wp-env run cli -- bash -c '
  shopt -s nullglob
  for f in wp-content/uploads/*/*/*; do
    case "$f" in
      # skip resized variants like image-300x200.jpg — register originals only
      *-[0-9]*x[0-9]*.*) continue ;;
    esac
    rel="${f#wp-content/uploads/}"
    # idempotent: skip files already in the media library
    if [ -n "$(wp post list --post_type=attachment --meta_key=_wp_attached_file --meta_value="$rel" --field=ID)" ]; then
      continue
    fi
    wp media import "$f" --skip-copy --porcelain
  done
'

echo "→ Remapping image IDs to this site's attachments…"
npx wp-env run cli wp eval-file wp-content/awt-seed/fix-image-ids.php

echo "→ Rewriting URLs from the old php -S host to wp-env…"
npx wp-env run cli wp search-replace 'http://localhost:8081' 'http://localhost:8888' --all-tables --report-changed-only

echo "✓ Seed complete. Site: http://localhost:8888 — admin: http://localhost:8888/wp-admin (admin / password)"
