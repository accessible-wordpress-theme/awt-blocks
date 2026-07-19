<?php
/**
 * AWT Toggletip — server-rendered output.
 *
 * Renders the Carbon "click-not-hover tooltip" pattern: an inline label
 * (optional) + an info button + a popover that opens on click. View-side
 * Interactivity store wires positioning via @floating-ui/dom and dismissal
 * via installOutsideDismiss (click-outside, Escape, Tab-out).
 *
 * @var array $attributes
 *
 * @package AWT\Blocks
 */

declare( strict_types = 1 );

use function AWT\Blocks\Render\unique_id;

$label       = isset( $attributes['label'] ) ? (string) $attributes['label'] : '';
$description = isset( $attributes['description'] ) ? (string) $attributes['description'] : '';
$aria_label  = isset( $attributes['ariaLabel'] ) ? (string) $attributes['ariaLabel'] : __( 'More information', 'awt' );
$align       = isset( $attributes['align'] ) ? (string) $attributes['align'] : 'bottom';

$content_id = unique_id( 'awt-toggletip' );

$ds = function_exists( '\AWT\Theme\DesignSystem\get_active' ) ? \AWT\Theme\DesignSystem\get_active() : null;

$root_class    = $ds ? $ds->classes_for( 'toggletip' ) : 'cds--toggletip';
$label_class   = $ds ? $ds->classes_for( 'toggletip', array( 'element' => 'label' ) ) : 'cds--toggletip-label';
$button_class  = $ds ? $ds->classes_for( 'toggletip', array( 'element' => 'button' ) ) : 'cds--toggletip-button';
$content_class = $ds ? $ds->classes_for( 'toggletip', array( 'element' => 'content' ) ) : 'cds--toggletip-content';

$wrapper_attrs = get_block_wrapper_attributes(
	array(
		'class'               => $root_class,
		'data-placement'      => $align,
		'data-wp-interactive' => 'awt/toggletip',
	)
);

$label_html = $label !== ''
	? sprintf( '<span class="%s">%s</span>', esc_attr( $label_class ), wp_kses_post( $label ) )
	: '';

// Information icon SVG, inline — matches Carbon's `information` 16px icon.
$info_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false">'
	. '<path d="M8.5 11V6.5h-2v1h1V11H6v1h4v-1zM8 3.5A.75.75 0 108.75 4.25.75.75 0 008 3.5z"/>'
	. '<path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0-13a6 6 0 100 12A6 6 0 008 2z"/>'
	. '</svg>';

printf(
	'<span %1$s>'
	. '%2$s'
	. '<button type="button" class="%7$s" aria-label="%3$s" aria-controls="%4$s" aria-expanded="false" data-wp-on--click="actions.toggle">%5$s</button>'
	. '<span id="%4$s" class="%8$s" role="dialog" aria-label="%3$s" hidden>%6$s</span>'
	. '</span>',
	$wrapper_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() output is pre-escaped by core.
	$label_html, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above with all dynamic parts escaped.
	esc_attr( $aria_label ),
	esc_attr( $content_id ),
	$info_icon, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static plugin-authored SVG; dynamic classes escaped with esc_attr() above.
	wp_kses_post( $description ),
	esc_attr( $button_class ),
	esc_attr( $content_class )
);
