/**
 * Accordion-item view-side store.
 *
 * Toggles the item's expanded state via aria-expanded + a hidden flag on the
 * content panel. Coordinates with the parent accordion's singleOpen context
 * (read via getContext().singleOpen): when singleOpen is true, opening this
 * item closes every sibling that's currently open.
 *
 * Imperative DOM updates only — no data-wp-text (per phase-1 §2 #8).
 */

import { store, getElement } from '@wordpress/interactivity';

function isOpen( itemEl ) {
	const heading = itemEl.querySelector( '.cds--accordion__heading' );
	return heading && heading.getAttribute( 'aria-expanded' ) === 'true';
}

function setOpen( itemEl, open ) {
	const heading = itemEl.querySelector( '.cds--accordion__heading' );
	const content = itemEl.querySelector( '.cds--accordion__content' );
	if ( ! heading || ! content ) {
		return;
	}
	heading.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
	if ( open ) {
		content.removeAttribute( 'hidden' );
		itemEl.classList.add( 'cds--accordion__item--active' );
	} else {
		content.setAttribute( 'hidden', '' );
		itemEl.classList.remove( 'cds--accordion__item--active' );
	}
}

store( 'awt/accordion-item', {
	actions: {
		toggle() {
			const item = getElement().ref.closest( '.cds--accordion__item' );
			if ( ! item ) {
				return;
			}
			const accordion = item.closest( '.cds--accordion' );
			const singleOpen =
				accordion &&
				accordion.dataset.wpContext &&
				JSON.parse( accordion.dataset.wpContext ).singleOpen;

			const willOpen = ! isOpen( item );
			if ( willOpen && singleOpen && accordion ) {
				accordion
					.querySelectorAll( '.cds--accordion__item--active' )
					.forEach( ( sibling ) => {
						if ( sibling !== item ) {
							setOpen( sibling, false );
						}
					} );
			}
			setOpen( item, willOpen );
		},
	},
} );
