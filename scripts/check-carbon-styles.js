/**
 * CI check: per-block Carbon CSS declarations stay honest.
 *
 * For every block in src/:
 *   - If block.json declares a non-empty "carbonStyles", the block MUST have
 *     a style.scss whose Carbon @use lines match the declared partials
 *     exactly (same set, no extras, none missing), and block.json MUST wire
 *     "style": "file:./style-index.css".
 *   - If "carbonStyles" is [] (foundation/theme-covered), the block MUST NOT
 *     have a style.scss (its Carbon CSS would silently never load) and MUST
 *     NOT declare a "style" file.
 *   - A missing "carbonStyles" field fails: every block documents its
 *     dependency explicitly (see the spec, "CSS tree-shaking + per-block CSS
 *     architecture").
 *
 * Run: npm run check:carbon-styles
 */

const fs = require( 'fs' );
const path = require( 'path' );

const SRC = path.resolve( __dirname, '..', 'src' );
const USE_RE = /@use\s+'@carbon\/styles\/scss\/components\/([a-z0-9/-]+)'/g;

let failed = false;
const fail = ( msg ) => {
	failed = true;
	console.error( `✖ ${ msg }` );
};

for ( const dir of fs.readdirSync( SRC ).sort() ) {
	const blockJsonPath = path.join( SRC, dir, 'block.json' );
	if ( ! fs.existsSync( blockJsonPath ) ) {
		continue;
	}
	const meta = JSON.parse( fs.readFileSync( blockJsonPath, 'utf8' ) );
	const scssPath = path.join( SRC, dir, 'style.scss' );
	const hasScss = fs.existsSync( scssPath );

	if ( ! Array.isArray( meta.carbonStyles ) ) {
		fail( `${ dir }: block.json is missing the "carbonStyles" array.` );
		continue;
	}

	if ( meta.carbonStyles.length === 0 ) {
		if ( hasScss ) {
			fail(
				`${ dir }: has style.scss but declares no carbonStyles — declare the partials or delete the file.`
			);
		}
		if ( meta.style ) {
			fail(
				`${ dir }: declares "style" in block.json but carbonStyles is empty.`
			);
		}
		continue;
	}

	if ( ! hasScss ) {
		fail(
			`${ dir }: declares carbonStyles ${ JSON.stringify(
				meta.carbonStyles
			) } but has no style.scss.`
		);
		continue;
	}
	if ( meta.style !== 'file:./style-index.css' ) {
		fail(
			`${ dir }: style.scss exists but block.json "style" is ${ JSON.stringify(
				meta.style
			) } (expected "file:./style-index.css").`
		);
	}

	const scss = fs.readFileSync( scssPath, 'utf8' );
	const used = new Set();
	for ( const m of scss.matchAll( USE_RE ) ) {
		used.add( m[ 1 ] );
	}
	const declared = new Set( meta.carbonStyles );
	for ( const p of declared ) {
		if ( ! used.has( p ) ) {
			fail(
				`${ dir }: carbonStyles declares "${ p }" but style.scss does not @use it.`
			);
		}
	}
	for ( const p of used ) {
		if ( ! declared.has( p ) ) {
			fail(
				`${ dir }: style.scss @uses "${ p }" but carbonStyles does not declare it.`
			);
		}
	}
}

if ( failed ) {
	process.exit( 1 );
}
console.log( '✓ carbonStyles declarations match the per-block SCSS.' );
