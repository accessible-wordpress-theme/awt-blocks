<?php
/**
 * AWT Side nav section — server-rendered output.
 *
 * @var array  $attributes
 * @var string $content
 *
 * @package AWT\Blocks
 */

declare( strict_types = 1 );

$section_title    = isset( $attributes['title'] ) ? (string) $attributes['title'] : '';
$default_expanded = ! isset( $attributes['defaultExpanded'] ) || ! empty( $attributes['defaultExpanded'] );

$ds = function_exists( '\AWT\Theme\DesignSystem\get_active' ) ? \AWT\Theme\DesignSystem\get_active() : null;

$section_class = $ds
	? $ds->classes_for(
		'side-nav',
		array(
			'element'         => 'section',
			'defaultExpanded' => $default_expanded,
		)
	)
	: ( 'cds--side-nav__section' . ( $default_expanded ? ' cds--side-nav__section--expanded' : '' ) );

$heading_class = $ds ? $ds->classes_for( 'side-nav', array( 'element' => 'heading' ) ) : 'cds--side-nav__heading';
$menu_class    = $ds ? $ds->classes_for( 'side-nav', array( 'element' => 'menu' ) ) : 'cds--side-nav__menu';

$wrapper_attrs = get_block_wrapper_attributes(
	array( 'class' => $section_class )
);

$heading = $section_title !== ''
	? sprintf( '<div class="%s">%s</div>', esc_attr( $heading_class ), wp_kses_post( $section_title ) )
	: '';

printf(
	'<li %1$s>%2$s<ul class="%3$s">%4$s</ul></li>',
	$wrapper_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() output is pre-escaped by core.
	$heading, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above with all dynamic parts escaped.
	esc_attr( $menu_class ),
	$content // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inner-block markup, escaped by each inner block on render.
);
