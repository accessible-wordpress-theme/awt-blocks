/**
 * Extend @wordpress/scripts' default config to add ONE extra entry: the
 * plugin-wide editor bundle (src/index.js → build/index.js).
 *
 * wp-scripts discovers a bundle per block.json automatically, but those are the
 * only entries it builds — the default `src/index.js` fallback is dropped once
 * block metadata is found. The §4 accessibility linter (and later the
 * Accessibility panel + palette contrast checking) are editor-wide and have no
 * block.json, so we register the entry here. Everything else (loaders, plugins,
 * dependency extraction, externals) is inherited unchanged.
 *
 * With WP_EXPERIMENTAL_MODULES=true the default export is an ARRAY of two
 * configs: [0] classic scripts, [1] ESM view-modules. The editor bundle is a
 * classic script (uses the wp.* externals), so it joins config [0] only.
 */

const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

function withEditorEntry( config ) {
	const blockEntries =
		typeof config.entry === 'function' ? config.entry() : config.entry;
	return {
		...config,
		entry: {
			...blockEntries,
			index: path.resolve( __dirname, 'src', 'index.js' ),
		},
	};
}

module.exports = Array.isArray( defaultConfig )
	? [ withEditorEntry( defaultConfig[ 0 ] ), ...defaultConfig.slice( 1 ) ]
	: withEditorEntry( defaultConfig );
