<?php
/**
 * Targeted attribute-coercion tests: out-of-range or wrong-type attribute
 * values must clamp to safe defaults in the rendered output.
 *
 * @package AWT\Blocks
 */

/**
 * Attribute clamping / coercion behavior of individual blocks and helpers.
 */
class Test_Attribute_Coercion extends WP_UnitTestCase {

	/**
	 * Render a single block comment with the given attributes.
	 *
	 * @param string $name  Block name.
	 * @param array  $attrs Block attributes.
	 * @return string Rendered HTML.
	 */
	private function render_block_markup( string $name, array $attrs = array() ): string {
		$json = $attrs ? ' ' . wp_json_encode( $attrs ) : '';
		return do_blocks( '<!-- wp:' . $name . $json . ' /-->' );
	}

	/**
	 * Stat heading level outside none|2–6 clamps to the non-heading default.
	 */
	public function test_stat_level_out_of_range_clamps_to_non_heading() {
		$html = $this->render_block_markup(
			'awt/stat',
			array(
				'value'   => '42%',
				'heading' => 'Coverage',
				'level'   => '9',
			)
		);
		$this->assertStringContainsString( '<p class="awt-stat__heading">', $html );
		$this->assertStringNotContainsString( '<h9', $html );
	}

	/**
	 * Stat with an explicit heading level renders that heading tag.
	 */
	public function test_stat_explicit_level_renders_heading() {
		$html = $this->render_block_markup(
			'awt/stat',
			array(
				'value'   => '42%',
				'heading' => 'Coverage',
				'level'   => '3',
			)
		);
		$this->assertStringContainsString( '<h3 class="awt-stat__heading">', $html );
	}

	/**
	 * Stat align outside start|center falls back to start.
	 */
	public function test_stat_align_invalid_falls_back_to_start() {
		$html = $this->render_block_markup(
			'awt/stat',
			array(
				'value' => '42%',
				'align' => 'diagonal',
			)
		);
		$this->assertStringContainsString( 'awt-stat--align-start', $html );
	}

	/**
	 * Spacing tokens outside 01–13 clamp to the default.
	 */
	public function test_spacing_token_clamps_to_default() {
		$clamp = '\AWT\Blocks\GlobalControls\clamp_token';
		$this->assertTrue( function_exists( $clamp ), 'clamp_token() not found — namespace moved?' );
		$this->assertSame( '05', $clamp( '99' ) );
		$this->assertSame( '05', $clamp( 'banana' ) );
		$this->assertSame( '05', $clamp( null ) );
		$this->assertSame( '13', $clamp( '13' ) );
		$this->assertSame( '01', $clamp( '01' ) );
	}

	/**
	 * Stat value markup is filtered: script tags never reach the output.
	 */
	public function test_stat_value_strips_script_tags() {
		$html = $this->render_block_markup(
			'awt/stat',
			array( 'value' => '<script>alert(1)</script>42' )
		);
		$this->assertStringNotContainsString( '<script>', $html );
		$this->assertStringContainsString( '42', $html );
	}
}
