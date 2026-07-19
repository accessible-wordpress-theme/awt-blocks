<?php
/**
 * AWT Color scheme toggle — server-rendered output.
 *
 * Reads settings.custom.ui-shell.colorScheme.allowVisitorOverride from theme.json
 * and self-removes if false. Otherwise renders an icon-only / with-label /
 * segmented toggle.
 *
 * @var array $attributes
 *
 * @package AWT\Blocks
 */

declare( strict_types = 1 );

$kind        = isset( $attributes['kind'] ) ? (string) $attributes['kind'] : 'icon-only';
$light_label = isset( $attributes['lightLabel'] ) ? (string) $attributes['lightLabel'] : __( 'Light mode', 'awt' );
$dark_label  = isset( $attributes['darkLabel'] ) ? (string) $attributes['darkLabel'] : __( 'Dark mode', 'awt' );
$auto_label  = isset( $attributes['autoLabel'] ) ? (string) $attributes['autoLabel'] : __( 'Use system preference', 'awt' );

// Honour the theme.json allowVisitorOverride flag.
if ( function_exists( '\\AWT\\Theme\\color_scheme_allow_visitor_override' )
	&& ! \AWT\Theme\color_scheme_allow_visitor_override() ) {
	return;
}

$context_json = wp_json_encode(
	array(
		'kind'       => $kind,
		'lightLabel' => $light_label,
		'darkLabel'  => $dark_label,
		'autoLabel'  => $auto_label,
	)
);

if ( $kind === 'segmented' ) {
	$wrapper = get_block_wrapper_attributes(
		array(
			'class'               => 'awt-color-scheme-toggle awt-color-scheme-toggle--segmented',
			'role'                => 'group',
			'aria-label'          => __( 'Color scheme', 'awt' ),
			'data-wp-interactive' => 'awt/color-scheme-toggle',
			'data-wp-context'     => $context_json,
		)
	);
	printf(
		'<div %1$s>'
		. '<button type="button" data-wp-on--click="actions.setLight">%2$s</button>'
		. '<button type="button" data-wp-on--click="actions.setAuto">%3$s</button>'
		. '<button type="button" data-wp-on--click="actions.setDark">%4$s</button>'
		. '</div>',
		$wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() output is pre-escaped by core.
		esc_html( $light_label ),
		esc_html( $auto_label ),
		esc_html( $dark_label )
	);
	return;
}

// Icon-only or with-label kinds follow.
// §A: the icon-only / with-label kinds adopt Carbon's header-action button styling,
// so that one class routes through the design system's `header-action` resolver
// instead of hardcoding `cds--header__action`. If the resolver returns ''
// (e.g. no AWT theme active), the toggle keeps its awt-* classes + behavior
// and renders unstyled. The segmented kind above uses no `cds--*` and returned early.
$ds                  = function_exists( '\AWT\Theme\DesignSystem\get_active' ) ? \AWT\Theme\DesignSystem\get_active() : null;
$header_action_class = $ds ? $ds->classes_for( 'header-action', array() ) : 'cds--header__action';

$wrapper = get_block_wrapper_attributes(
	array(
		'class'               => trim( 'awt-color-scheme-toggle awt-color-scheme-toggle--' . ( $kind === 'with-label' ? 'with-label' : 'icon-only' ) . ' ' . $header_action_class ),
		'type'                => 'button',
		'aria-label'          => $light_label . ' / ' . $dark_label,
		'aria-pressed'        => 'false',
		'data-wp-interactive' => 'awt/color-scheme-toggle',
		'data-wp-context'     => $context_json,
		'data-wp-on--click'   => 'actions.toggle',
		'data-wp-init'        => 'callbacks.init',
	)
);

$icon = '<span class="awt-color-scheme-toggle__icon" aria-hidden="true">'
	. '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor" focusable="false">'
	. '<path d="M8 11a3 3 0 110-6 3 3 0 010 6zm0-1a2 2 0 100-4 2 2 0 000 4zM7.5 1h1v2h-1V1zm0 12h1v2h-1v-2zM1 7.5h2v1H1v-1zm12 0h2v1h-2v-1zM2.8 2.1l.7-.7 1.4 1.4-.7.7-1.4-1.4zm9.3 9.3l.7-.7 1.4 1.4-.7.7-1.4-1.4zM2.1 13.2l1.4-1.4.7.7-1.4 1.4-.7-.7zM11.4 3.9l1.4-1.4.7.7-1.4 1.4-.7-.7z"/>'
	. '</svg></span>';

$label_html = $kind === 'with-label'
	? '<span class="awt-color-scheme-toggle__label">' . esc_html( $light_label ) . '</span>'
	: '';

printf( '<button %1$s>%2$s%3$s</button>', $wrapper, $icon, $label_html ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() output is pre-escaped by core; static plugin-authored SVG; dynamic classes escaped with esc_attr() above; built above with all dynamic parts escaped.
