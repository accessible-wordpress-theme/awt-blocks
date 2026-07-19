<?php
/**
 * Render smoke tests: every registered AWT block renders with its default
 * attributes without notices, warnings, or fatals (phpunit.xml.dist converts
 * notices/warnings to exceptions, so a sloppy render.php fails the test).
 *
 * @package AWT\Blocks
 */

/**
 * Smoke-renders every registered awt/* block.
 */
class Test_Render_Smoke extends WP_UnitTestCase {

	/**
	 * All registered awt/* block names.
	 *
	 * @return array[] Data-provider shape: [ [ name ], … ].
	 */
	public function awt_block_names(): array {
		// The data provider runs before setUp(), so register blocks here.
		if ( ! did_action( 'init' ) ) {
			do_action( 'init' ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- core hook, test bootstrap.
		}
		$names = array();
		foreach ( WP_Block_Type_Registry::get_instance()->get_all_registered() as $name => $type ) {
			if ( str_starts_with( $name, 'awt/' ) ) {
				$names[ $name ] = array( $name );
			}
		}
		return $names;
	}

	/**
	 * The plugin registers its full block inventory (58 at Stage 1).
	 */
	public function test_blocks_are_registered() {
		$names = $this->awt_block_names();
		$this->assertGreaterThanOrEqual( 50, count( $names ), 'Expected the full AWT block inventory to register.' );
	}

	/**
	 * Rendering a block with default attributes must not raise notices,
	 * warnings, or fatals, and must return a string.
	 *
	 * @dataProvider awt_block_names
	 *
	 * @param string $name Block name.
	 */
	public function test_block_renders_with_defaults( string $name ) {
		$markup = '<!-- wp:' . $name . ' /-->';
		$html   = do_blocks( $markup );
		$this->assertIsString( $html, "{$name} render did not return a string." );
	}

	/**
	 * Rendering with garbage attribute types must not fatal — attributes are
	 * coerced or ignored, never trusted.
	 *
	 * @dataProvider awt_block_names
	 *
	 * @param string $name Block name.
	 */
	public function test_block_survives_garbage_attributes( string $name ) {
		$attrs  = wp_json_encode(
			array(
				'level'    => 999,
				'align'    => array( 'nonsense' ),
				'type'     => 42,
				'kind'     => 'no-such-kind',
				'maxWidth' => (object) array(),
			)
		);
		$markup = '<!-- wp:' . $name . ' ' . $attrs . ' /-->';
		$html   = do_blocks( $markup );
		$this->assertIsString( $html, "{$name} render fataled on garbage attributes." );
	}
}
