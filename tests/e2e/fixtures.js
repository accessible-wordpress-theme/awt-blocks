/**
 * Shared Playwright fixtures: WordPress admin/editor/request utilities from
 * the wordpress/e2e-test-utils-playwright package, wired to the wp-env
 * tests site.
 */

const {
	test: base,
	expect,
} = require( '@wordpress/e2e-test-utils-playwright' );

const test = base.extend( {} );

module.exports = { test, expect };
