#!/usr/bin/env node
/**
 * Generate build/shared/icon-manifest.json from @carbon/icons/metadata.json.
 *
 * The manifest powers the editor-side IconPicker (src/shared/icon-picker.js):
 * a search box + filterable grid of available Carbon icons. Each entry
 * carries the canonical token, a human label, the available sizes, and the
 * search aliases / category from Carbon's own metadata so search hits feel
 * natural ("trash" finds the trash-can icon, etc.).
 *
 * Filter rules:
 *   - Skip namespaced icons (watson-health, etc.) — not relevant to AWT's
 *     marketing/docs/blog audience and bloats the manifest 10x.
 *   - Skip icons that have no 16 / 20 / 24 asset (they're 32-only and don't
 *     work in our render pipeline today).
 *
 * Output schema:
 *   {
 *     generatedAt: "2026-...",
 *     iconsByName: {
 *       "arrow--right": { label, sizes, category, aliases }
 *     }
 *   }
 *
 * Used at build time only. Re-run via `npm run build:icons` or as part of
 * `npm run build` (added to the script chain).
 */

const fs = require( 'node:fs' );
const path = require( 'node:path' );

const ROOT = path.resolve( __dirname, '..' );
const META = path.join(
	ROOT,
	'node_modules',
	'@carbon',
	'icons',
	'metadata.json'
);
const OUT = path.join( ROOT, 'build', 'shared', 'icon-manifest.json' );

if ( ! fs.existsSync( META ) ) {
	console.error( `[icon-manifest] @carbon/icons not installed at ${ META }` );
	process.exit( 1 );
}

const raw = JSON.parse( fs.readFileSync( META, 'utf8' ) );

const iconsByName = {};
let kept = 0;
let dropped = 0;

for ( const icon of raw.icons ) {
	// Skip namespaced icons (watson-health, etc.) — not in scope for AWT's
	// marketing/docs/blog audience, and including them roughly 10×s the bundle.
	if ( Array.isArray( icon.namespace ) && icon.namespace.length > 0 ) {
		dropped++;
		continue;
	}

	// Every Carbon icon ships at least at 32px and the SVGs are vector, so they
	// render correctly at any size we ask for. Track the declared sizes so the
	// picker UI can prefer the smallest one for rendering and the PHP loader
	// can find the right source file.
	const sizes =
		Array.isArray( icon.sizes ) && icon.sizes.length > 0
			? icon.sizes
			: [ 32 ];

	const token = String( icon.name ).toLowerCase();
	const entry = {
		label: icon.friendlyName || token,
		sizes,
		category: icon.category || '',
		subcategory: icon.subcategory || '',
		aliases: icon.aliases || [],
	};
	// Carbon's SVG filename preserves the original case + dash pattern
	// (`AI-enabled-EDT.svg`, `BPMN-compensation--fill.svg`) which a lowercase
	// + dash-normalize can't reconstruct. Store the exact filename so the
	// picker builds correct preview URLs — otherwise those icons 404 and
	// render as blank tiles. Omitted when it equals the token (common case)
	// to keep the manifest small.
	if ( icon.name !== token ) {
		entry.file = icon.name;
	}
	iconsByName[ token ] = entry;
	kept++;
}

fs.mkdirSync( path.dirname( OUT ), { recursive: true } );
fs.writeFileSync(
	OUT,
	JSON.stringify(
		{
			generatedAt: new Date().toISOString(),
			iconsByName,
		},
		null,
		0
	)
);

const stat = fs.statSync( OUT );
console.log(
	`[icon-manifest] wrote ${ kept } icons (skipped ${ dropped }) → ${ path.relative(
		ROOT,
		OUT
	) } (${ stat.size } bytes)`
);
