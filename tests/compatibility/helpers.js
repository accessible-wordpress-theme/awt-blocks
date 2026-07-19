/**
 * Shared helpers for the plugin-compatibility (Floor A) specs.
 *
 * Each spec installs its plugin against the wp-env TESTS site, creates its
 * own minimal dataset, and removes the plugin afterwards — self-contained
 * per the spec ("no shared compatibility test site").
 */

const { execSync } = require( 'child_process' );

/**
 * Run a wp-cli command on the wp-env tests site.
 *
 * @param {string} command Full wp-cli command (without the leading "wp").
 * @return {string} Trimmed stdout.
 */
function wp( command ) {
	return execSync( `npx wp-env run tests-cli wp ${ command }`, {
		encoding: 'utf8',
		stdio: [ 'ignore', 'pipe', 'pipe' ],
	} ).trim();
}

/**
 * Run a bash snippet on the wp-env tests site's cli container.
 *
 * @param {string} script Bash snippet.
 * @return {string} Trimmed stdout.
 */
function bash( script ) {
	return execSync(
		`npx wp-env run tests-cli -- bash -c ${ JSON.stringify( script ) }`,
		{ encoding: 'utf8', stdio: [ 'ignore', 'pipe', 'pipe' ] }
	).trim();
}

/**
 * Console-error collector that ignores benign resource-load noise.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 * @return {string[]} Live array that accumulates error texts.
 */
function collectConsoleErrors( page ) {
	const errors = [];
	page.on( 'console', ( msg ) => {
		if (
			msg.type() === 'error' &&
			! msg.text().includes( 'Failed to load resource' )
		) {
			errors.push( msg.text() );
		}
	} );
	return errors;
}

/**
 * Run a PHP snippet on the tests site via `wp eval-file` — immune to the
 * shell-quoting pitfalls of inlining PHP in `wp eval "…"` (dollar signs
 * expand as shell variables inside the wp-env wrapper).
 *
 * @param {string} php PHP code (no opening tag).
 * @return {string} Trimmed stdout.
 */
function phpEval( php ) {
	const fs = require( 'fs' );
	const path = require( 'path' );
	const file = path.resolve(
		__dirname,
		'../../.wp-env/seed/tmp-compat-eval.php'
	);
	fs.writeFileSync( file, `<?php\n${ php }\n` );
	try {
		return bash( 'wp eval-file wp-content/awt-seed/tmp-compat-eval.php' );
	} finally {
		fs.unlinkSync( file );
	}
}

module.exports = { wp, bash, phpEval, collectConsoleErrors };
