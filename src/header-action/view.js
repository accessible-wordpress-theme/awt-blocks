/**
 * Header action — view-side Interactivity API store.
 *
 * Dispatches an `awt:toggle-panel` CustomEvent on click when panelId is set,
 * mirroring the spec §1 contract. Updates aria-expanded by listening for the
 * matching panel's open-state change.
 *
 * Imperative DOM mutations — no data-wp-text (per phase-1 spec §2 #8).
 */

import {
	store,
	getElement,
	getContext,
	withSyncEvent,
} from '@wordpress/interactivity';

store( 'awt/header-action', {
	actions: {
		toggle: withSyncEvent( ( event ) => {
			const { panelId } = getContext();
			if ( ! panelId ) {
				return;
			}
			event.preventDefault();
			const button = getElement().ref;
			button.dispatchEvent(
				new CustomEvent( 'awt:toggle-panel', {
					detail: { id: panelId, source: button },
					bubbles: true,
				} )
			);
		} ),
	},
	callbacks: {
		init() {
			const { panelId } = getContext();
			if ( ! panelId ) {
				return;
			}
			const button = getElement().ref;
			const update = ( open ) => {
				button.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
			};
			// Listen for the corresponding panel's broadcast.
			document.addEventListener( 'awt:panel-state', ( e ) => {
				if ( e.detail && e.detail.id === panelId ) {
					update( !! e.detail.open );
				}
			} );
		},
	},
} );
