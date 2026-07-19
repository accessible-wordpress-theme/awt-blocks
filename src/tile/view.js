/**
 * AWT Tile — view-side store.
 *
 * Handles two interactive variants:
 *
 *   1. `role="radio"` selectable tiles with shared `groupName`: clicking one
 *      tile selects it (`aria-checked="true"` + `cds--tile--is-selected`)
 *      and DESELECTS every other tile in the same group. This is the
 *      "IBM-style radio tile" pattern.
 *   2. `role="checkbox"` selectable tiles (no groupName): clicking flips the
 *      tile's own state without affecting siblings.
 *
 * Keyboard: Space and Enter activate the tile (matches Carbon's spec).
 * Expandable tiles use native `<details>` so no JS is needed for that.
 */

import { store, getElement, withSyncEvent } from '@wordpress/interactivity';

function getCtx( ref ) {
	try {
		return JSON.parse( ref.getAttribute( 'data-wp-context' ) || '{}' );
	} catch ( e ) {
		return {};
	}
}

function deselectSiblings( ref, groupName ) {
	if ( ! groupName ) {
		return;
	}
	// Find every selectable tile in the document with the same groupName.
	const all = document.querySelectorAll(
		'.cds--tile--selectable[role="radio"]'
	);
	all.forEach( ( el ) => {
		if ( el === ref ) {
			return;
		}
		const ctx = getCtx( el );
		if ( ctx.groupName === groupName ) {
			el.setAttribute( 'aria-checked', 'false' );
			el.classList.remove( 'cds--tile--is-selected' );
		}
	} );
}

store( 'awt/tile', {
	actions: {
		toggle() {
			const ref = getElement().ref;
			const ctx = getCtx( ref );
			const role = ctx.role || 'checkbox';

			if ( role === 'radio' ) {
				// Radio tiles ALWAYS select on click; deselect via clicking a
				// sibling, never via clicking the same tile again. This matches
				// `<input type="radio">` behavior.
				ref.setAttribute( 'aria-checked', 'true' );
				ref.classList.add( 'cds--tile--is-selected' );
				deselectSiblings( ref, ctx.groupName );
			} else {
				// Checkbox tile: flip own state.
				const current = ref.getAttribute( 'aria-checked' ) === 'true';
				ref.setAttribute( 'aria-checked', current ? 'false' : 'true' );
				ref.classList.toggle( 'cds--tile--is-selected', ! current );
			}
		},
		keydown: withSyncEvent( ( event ) => {
			if ( event.key !== ' ' && event.key !== 'Enter' ) {
				return;
			}
			event.preventDefault();
			const ref = getElement().ref;
			ref.click();
		} ),
	},
} );
