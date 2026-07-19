<?php
/**
 * AWT Tile — server-rendered output.
 *
 * Carbon tile variants:
 *   - default     — read-only <div>
 *   - clickable   — <a href="…"> (full surface clickable)
 *   - selectable  — <div role="radio"> with optional groupName for radio-group
 *                   behavior. Single tiles act as a checkbox-style toggle;
 *                   multiple tiles sharing groupName form a radio group where
 *                   selecting one deselects the others (IBM-style radio tile).
 *   - expandable  — `<details>` element with a Carbon-styled summary header
 *                   and a chevron icon that rotates on expand. Native browser
 *                   toggle, full keyboard + screen-reader support out of the
 *                   box.
 *
 * @var array  $attributes
 * @var string $content
 *
 * @package AWT\Blocks
 */

declare( strict_types = 1 );

$variant      = isset( $attributes['variant'] ) ? (string) $attributes['variant'] : 'default';
$href         = isset( $attributes['href'] ) ? (string) $attributes['href'] : '';
$group_name   = isset( $attributes['groupName'] ) ? (string) $attributes['groupName'] : '';
$summary      = isset( $attributes['summary'] ) ? (string) $attributes['summary'] : __( 'Expandable tile', 'awt' );
$default_open = ! empty( $attributes['defaultOpen'] );

$ds = function_exists( '\AWT\Theme\DesignSystem\get_active' ) ? \AWT\Theme\DesignSystem\get_active() : null;

$classes = array( 'cds--tile' );
if ( $variant === 'clickable' ) {
	$classes[] = 'cds--tile--clickable';
} elseif ( $variant === 'selectable' ) {
	$classes[] = 'cds--tile--selectable';
} elseif ( $variant === 'expandable' ) {
	$classes[] = 'cds--tile--expandable';
}

$root_class         = $ds ? $ds->classes_for( 'tile', array( 'variant' => $variant ) ) : implode( ' ', $classes );
$summary_class      = $ds ? $ds->classes_for( 'tile', array( 'element' => 'summary' ) ) : 'cds--tile__summary';
$summary_text_class = $ds ? $ds->classes_for( 'tile', array( 'element' => 'summary-text' ) ) : 'cds--tile__summary-text';
$chevron_class      = $ds ? $ds->classes_for( 'tile', array( 'element' => 'chevron' ) ) : 'cds--tile__chevron';
$content_class      = $ds ? $ds->classes_for( 'tile', array( 'element' => 'content' ) ) : 'cds--tile__content';

$wrapper_attrs = get_block_wrapper_attributes( array( 'class' => $root_class ) );

if ( $variant === 'clickable' && $href !== '' ) {
	printf( '<a %1$s href="%2$s">%3$s</a>', $wrapper_attrs, esc_url( $href ), $content ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() output is pre-escaped by core; inner-block markup, escaped by each inner block on render.
	return;
}

if ( $variant === 'selectable' ) {
	// IBM-style radio tile: when `groupName` is set, multiple selectable
	// tiles sharing the same group form a radio group (click one → others
	// in the group deselect). view.js handles the exclusive-selection
	// behavior via the data-wp-interactive store. Without groupName the
	// tile is a checkbox-style toggle (clicking flips its own state).
	$tile_role    = $group_name !== '' ? 'radio' : 'checkbox';
	$context_json = wp_json_encode(
		array(
			'groupName' => $group_name,
			'role'      => $tile_role,
		)
	);
	printf(
		'<div %1$s role="%2$s" aria-checked="false" tabindex="0" data-wp-interactive="awt/tile" data-wp-context=\'%3$s\' data-wp-on--click="actions.toggle" data-wp-on--keydown="actions.keydown">%4$s</div>',
		$wrapper_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() output is pre-escaped by core.
		esc_attr( $tile_role ),
		esc_attr( $context_json ),
		$content // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inner-block markup, escaped by each inner block on render.
	);
	return;
}

if ( $variant === 'expandable' ) {
	// Native <details> gives us the toggle behavior, keyboard support, and
	// the open/closed state for free. We hide the browser's default marker
	// (via `cds--tile__summary` CSS) and inject a Carbon chevron via the
	// `cds--tile__chevron` span — Carbon's CSS rotates that chevron when
	// the parent has `cds--tile--is-expanded` (we add it via `[open]`
	// attribute selector in theme.css).
	$chevron = '<span class="' . esc_attr( $chevron_class ) . '" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" focusable="false"><path d="M8 11L3 6l.7-.7L8 9.6l4.3-4.3.7.7z"/></svg></span>';
	printf(
		// The summary's title + chevron are laid out by an INNER flex row, NOT by
		// putting `display:flex` on the <summary> itself. WebKit/Safari only honors
		// the native click-to-toggle when the <summary> keeps its default
		// `display: list-item`; making the summary a flex container silently
		// disables toggling there ("doesn't always open"). Keeping the flex on an
		// inner wrapper preserves the toggle in every browser.
		'<details %1$s%2$s><summary class="%6$s"><span class="cds--tile__summary-row"><span class="%7$s">%3$s</span>%4$s</span></summary><div class="%8$s">%5$s</div></details>',
		$wrapper_attrs, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() output is pre-escaped by core.
		$default_open ? ' open' : '',
		esc_html( $summary ),
		$chevron, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static plugin-authored SVG; dynamic classes escaped with esc_attr() above.
		$content, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inner-block markup, escaped by each inner block on render.
		esc_attr( $summary_class ),
		esc_attr( $summary_text_class ),
		esc_attr( $content_class )
	);
	return;
}

printf( '<div %1$s>%2$s</div>', $wrapper_attrs, $content ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() output is pre-escaped by core; inner-block markup, escaped by each inner block on render.
