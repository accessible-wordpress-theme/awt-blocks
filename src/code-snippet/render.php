<?php
/**
 * AWT Code snippet — server-rendered output.
 *
 * @var array $attributes
 *
 * @package AWT\Blocks
 */

declare( strict_types = 1 );

use function AWT\Blocks\Render\icon;

$variant       = isset( $attributes['variant'] ) ? (string) $attributes['variant'] : 'multi';
$code          = isset( $attributes['code'] ) ? (string) $attributes['code'] : '';
$language      = isset( $attributes['language'] ) ? (string) $attributes['language'] : '';
$copy_label    = isset( $attributes['copyLabel'] ) ? (string) $attributes['copyLabel'] : __( 'Copy', 'awt' );
$copied_label  = isset( $attributes['copiedLabel'] ) ? (string) $attributes['copiedLabel'] : __( 'Copied', 'awt' );
$hide_copy_btn = ! empty( $attributes['hideCopyBtn'] );

$ds = function_exists( '\AWT\Theme\DesignSystem\get_active' ) ? \AWT\Theme\DesignSystem\get_active() : null;

$is_inline = $variant === 'inline';

$root_class            = $ds ? $ds->classes_for( 'code-snippet', array( 'variant' => $variant ) ) : 'cds--snippet cds--snippet--' . $variant;
$copy_btn_class        = $ds ? $ds->classes_for( 'code-snippet', array( 'element' => 'copy-button' ) ) : 'cds--snippet-button cds--copy-btn';
$copy_btn_inline_class = $ds ? $ds->classes_for( 'code-snippet', array( 'element' => 'copy-button-inline' ) ) : 'cds--snippet-button cds--copy-btn cds--snippet-button--inline';
$container_class       = $ds ? $ds->classes_for( 'code-snippet', array( 'element' => 'container' ) ) : 'cds--snippet-container';

$wrapper_attrs = get_block_wrapper_attributes(
	array(
		'class'               => $root_class,
		'data-wp-interactive' => 'awt/code-snippet',
		'data-wp-context'     => wp_json_encode(
			array(
				'copyLabel'   => $copy_label,
				'copiedLabel' => $copied_label,
			)
		),
	)
);

$code_attrs = $language !== '' ? sprintf( ' data-language="%s"', esc_attr( $language ) ) : '';

$copy_btn = '';
if ( ! $is_inline && ! $hide_copy_btn ) {
	$copy_btn = sprintf(
		'<button type="button" class="%1$s" aria-label="%2$s" data-wp-on--click="actions.copy">%3$s</button>',
		esc_attr( $copy_btn_class ),
		esc_attr( $copy_label ),
		icon( 'copy', 16 )
	);
}

if ( $is_inline ) {
	printf(
		'<span %1$s><code%2$s>%3$s</code>%4$s</span>',
		$wrapper_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() output is pre-escaped by core.
		$code_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built with esc_attr() above.
		esc_html( $code ),
		$hide_copy_btn ? '' : sprintf(
			' <button type="button" class="%1$s" aria-label="%2$s" data-wp-on--click="actions.copy">%3$s</button>',
			esc_attr( $copy_btn_inline_class ),
			esc_attr( $copy_label ),
			icon( 'copy', 16 ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- icon() returns vetted plugin-bundled SVG markup.
		)
	);
	return;
}

// Carbon wraps the <pre><code> in a `.cds--snippet-container` whose
// `overflow-x: auto` isolates the scrolling region from the copy button.
// Without the wrapper, the snippet's `overflow-x: auto` collides with the
// absolutely-positioned button: long code scrolls underneath the button
// and only becomes visible after the user scrolls past the button hit-box.
// Adding the container also matches Carbon's expected DOM, so its CSS
// (padding-inline-start: 1rem on the container, padding-inline-end: 2.5rem
// on the snippet) lines up cleanly with our overrides.
printf(
	'<div %1$s><div class="%5$s" tabindex="0"><pre><code%2$s>%3$s</code></pre></div>%4$s</div>',
	$wrapper_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() output is pre-escaped by core.
	$code_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built with esc_attr() above.
	esc_html( $code ),
	$copy_btn, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above with all dynamic parts escaped.
	esc_attr( $container_class )
);
