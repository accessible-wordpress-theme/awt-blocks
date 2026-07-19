<?php
/**
 * PHPUnit bootstrap: loads the WordPress test library provided by wp-env
 * and this plugin, then hands off to the core test bootstrap.
 *
 * Run via `npm run test:php` (executes inside the wp-env tests container,
 * where WP_TESTS_DIR points at the core test library).
 *
 * @package AWT\Blocks
 */

$_tests_dir = getenv( 'WP_TESTS_DIR' );
if ( ! $_tests_dir ) {
	$_tests_dir = '/wordpress-phpunit';
}

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	echo "Could not find the WordPress test library at {$_tests_dir}. Run this suite via `npm run test:php` (wp-env).\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CLI bootstrap message.
	exit( 1 );
}

require_once $_tests_dir . '/includes/functions.php';

tests_add_filter(
	'muplugins_loaded',
	static function (): void {
		require dirname( __DIR__, 2 ) . '/awt-blocks.php';
	}
);

require $_tests_dir . '/includes/bootstrap.php';
