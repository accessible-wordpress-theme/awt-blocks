/**
 * Payload budget check (Stage 1 spec, "Performance budgets"):
 *
 *   Total CSS payload ≤ 200 KB gzipped   for the measured page
 *   Total JS payload  ≤  80 KB gzipped   for the same page
 *
 * Measures REAL gzip sizes (the local server may not compress), by
 * downloading every stylesheet/script the page references — including
 * inline <style>/<script> content — and gzipping locally. This is more
 * accurate than Lighthouse transfer sizes on a dev server.
 *
 * Usage: node scripts/perf-payloads.js <url> [--csv]
 */

const { gzipSync } = require( 'zlib' );

const CSS_BUDGET = 200 * 1024;
const JS_BUDGET = 80 * 1024;

async function fetchText( url ) {
	const res = await fetch( url );
	if ( ! res.ok ) {
		throw new Error( `${ res.status } for ${ url }` );
	}
	return res.text();
}

function gz( text ) {
	return gzipSync( Buffer.from( text ) ).length;
}

async function main() {
	const url = process.argv[ 2 ];
	if ( ! url ) {
		console.error( 'Usage: node scripts/perf-payloads.js <url> [--csv]' );
		process.exit( 2 );
	}
	const html = await fetchText( url );

	const cssUrls = [
		...html.matchAll(
			/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']|<link[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["']/g
		),
	].map( ( m ) => ( m[ 1 ] || m[ 2 ] ).replace( /&#0?38;/g, '&' ) );
	const jsUrls = [
		...html.matchAll( /<script[^>]*src=["']([^"']+)["']/g ),
	].map( ( m ) => m[ 1 ].replace( /&#0?38;/g, '&' ) );

	const inlineCss = [ ...html.matchAll( /<style[^>]*>([\s\S]*?)<\/style>/g ) ]
		.map( ( m ) => m[ 1 ] )
		.join( '\n' );
	const inlineJs = [
		...html.matchAll( /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g ),
	]
		.map( ( m ) => m[ 1 ] )
		.join( '\n' );

	let cssTotal = inlineCss ? gz( inlineCss ) : 0;
	for ( const u of cssUrls ) {
		cssTotal += gz( await fetchText( new URL( u, url ).href ) );
	}
	let jsTotal = inlineJs ? gz( inlineJs ) : 0;
	for ( const u of jsUrls ) {
		jsTotal += gz( await fetchText( new URL( u, url ).href ) );
	}
	// ES modules (Interactivity API view modules + importmap entries).
	const moduleUrls = [
		...html.matchAll(
			/<script[^>]*type=["']module["'][^>]*src=["']([^"']+)["']/g
		),
	].map( ( m ) => m[ 1 ] );
	const importmap = html.match(
		/<script[^>]*type=["']importmap["'][^>]*>([\s\S]*?)<\/script>/
	);
	if ( importmap ) {
		try {
			const map = JSON.parse( importmap[ 1 ] );
			for ( const u of Object.values( map.imports || {} ) ) {
				moduleUrls.push( u );
			}
		} catch {
			/* not fatal — importmap already counted as inline JS */
		}
	}
	for ( const u of new Set( moduleUrls ) ) {
		jsTotal += gz( await fetchText( new URL( u, url ).href ) );
	}

	const cssKb = ( cssTotal / 1024 ).toFixed( 1 );
	const jsKb = ( jsTotal / 1024 ).toFixed( 1 );

	if ( process.argv.includes( '--csv' ) ) {
		console.log( `${ cssKb },${ jsKb }` );
		return;
	}

	console.log(
		`CSS payload: ${ cssKb } KB gz (budget ${ CSS_BUDGET / 1024 })`
	);
	console.log(
		`JS payload:  ${ jsKb } KB gz (budget ${ JS_BUDGET / 1024 })`
	);

	let failed = false;
	if ( cssTotal > CSS_BUDGET ) {
		console.error( '✖ CSS payload over budget.' );
		failed = true;
	}
	if ( jsTotal > JS_BUDGET ) {
		console.error( '✖ JS payload over budget.' );
		failed = true;
	}
	if ( failed ) {
		process.exit( 1 );
	}
	console.log( '✓ payload budgets pass.' );
}

main().catch( ( e ) => {
	console.error( e );
	process.exit( 2 );
} );
