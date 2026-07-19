/**
 * AWT Toggle — Interactivity API view-side store.
 *
 * The toggle is an <input type="checkbox" role="switch"> paired with a <label>;
 * native HTML handles the click + Space/Enter activation. We listen for the
 * native `change` event to keep our context in sync, then drive reactive
 * bindings (aria-checked, the on/off label text, the cds--toggle__switch--checked
 * modifier on the switch shape).
 */

import { store, getContext } from '@wordpress/interactivity';

store( 'awt/toggle', {
	state: {
		get checked() {
			return getContext().toggled;
		},
		get ariaChecked() {
			return getContext().toggled ? 'true' : 'false';
		},
		get stateLabel() {
			const ctx = getContext();
			return ctx.toggled ? ctx.labelB : ctx.labelA;
		},
	},
	actions: {
		toggle( event ) {
			const ctx = getContext();
			ctx.toggled = event?.target ? event.target.checked : ! ctx.toggled;

			// data-wp-text gets stripped server-side without a PHP-registered
			// store, so update the on/off label imperatively after toggling.
			const wrapper = event?.target?.closest(
				'[data-wp-interactive="awt/toggle"]'
			);
			const textEl = wrapper?.querySelector( '.cds--toggle__text' );
			if ( textEl ) {
				textEl.textContent = ctx.toggled ? ctx.labelB : ctx.labelA;
			}
		},
	},
} );
