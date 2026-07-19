/**
 * AWT Modal opener — dispatches the awt:toggle-panel CustomEvent the modal
 * (or any panel/side-nav with a matching id) listens for. The current
 * trigger element rides along as `event.detail.source` so the panel can
 * return focus when it closes.
 */

import { store, getElement, withSyncEvent } from '@wordpress/interactivity';

store( 'awt/modal-opener', {
	actions: {
		open: withSyncEvent( ( event ) => {
			event.preventDefault();
			const button = getElement().ref;
			const modalId = button.dataset.modalId || '';
			if ( ! modalId ) {
				return;
			}
			button.dispatchEvent(
				new CustomEvent( 'awt:toggle-panel', {
					detail: { id: modalId, source: button },
					bubbles: true,
				} )
			);
		} ),
	},
} );
