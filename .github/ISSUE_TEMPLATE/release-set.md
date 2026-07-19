---
name: Release set
about: Lockstep release coordination checklist (awt-theme + awt-blocks)
title: "Release set YYYY.MM.PATCH"
labels: release
---

## Version

`YYYY.MM.PATCH` — same tag in every repo, published within 30 minutes.

## Pre-tag

- [ ] `CHANGELOG.md` entries reviewed in both repos (severity tags correct)
- [ ] `npm run release:prepare <version> -- --promote` run in **awt-blocks**, staged files reviewed
- [ ] `npm run release:prepare <version> -- --promote` run in **awt-theme**, staged files reviewed
- [ ] `ACCESSIBILITY.md` reviewed if this release bumps `YYYY.MM` (statement review cadence)
- [ ] CI green on `main` in both repos (includes the automated Floor A specs: WooCommerce, Polylang, WP Super Cache)

## Manual compatibility checklist (Floor A)

Run against the wp-env tests site. Acceptance for all: install + activate
without fatals, site's main pages keep rendering, the editor (with the
accessibility linter) doesn't crash. Plugin-specific screens may keep the
plugin's own styling.

- [ ] **SEO** — one of Yoast / Rank Math / AIOSEO: save a page, view source, meta tags emitted, no `<head>` conflicts
- [ ] **Forms** — one of Gravity Forms / WPForms / CF7 / Fluent Forms: create a form, embed, submit
- [ ] **Membership/LMS** — one of MemberPress / LearnDash / LifterLMS: create a course or membership, view a restricted page
- [ ] **Page builder** — one of Elementor / Beaver Builder: build a page with the builder, view it; AWT blocks don't interfere with the builder's editor
- [ ] **WPML** (commercial — needs a license; Polylang is CI-automated): add a language, translate a page, switch on the front end
- [ ] **WP Rocket** (commercial — needs a license; WP Super Cache is CI-automated): enable caching, verify the color-scheme choice still works on cached pages

## Compatibility notes

- [ ] readme.txt "Compatibility notes" section updated with this release's outcomes

## Tag + publish (lockstep, wait-for-both)

- [ ] Commit + tag `v<version>` + push in both repos
- [ ] GitHub Release created in both repos (paste `RELEASE_NOTES.md`)
- [ ] WP.org: both artifacts submitted/updated the same day; neither goes live until both are approved
