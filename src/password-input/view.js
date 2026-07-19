/**
 * AWT Password input — view-side store.
 *
 * Toggles the input's type between "password" and "text" so a visitor can
 * verify what they typed. Swaps the eye / eye-strikethrough icon and the
 * trigger button's aria-label in lockstep.
 *
 * The aria-label values come from the block's data-wp-context (so they
 * follow the site's locale + the block author's custom strings), set in
 * render.php.
 */

import { store, getContext, getElement } from '@wordpress/interactivity';

const EYE_OPEN =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 3C4.5 3 1.7 5 .3 8 1.7 11 4.5 13 8 13c3.5 0 6.3-2 7.7-5C14.3 5 11.5 3 8 3zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5S6.1 4.5 8 4.5s3.5 1.6 3.5 3.5S9.9 11.5 8 11.5z"/><circle cx="8" cy="8" r="2"/></svg>';

const EYE_OFF =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 3C4.5 3 1.7 5 .3 8 1.7 11 4.5 13 8 13c3.5 0 6.3-2 7.7-5C14.3 5 11.5 3 8 3zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5S6.1 4.5 8 4.5s3.5 1.6 3.5 3.5S9.9 11.5 8 11.5z"/><path d="M1 1.7L1.7 1 15 14.3 14.3 15z"/></svg>';

store( 'awt/password-input', {
	actions: {
		toggle() {
			const btn = getElement().ref;
			const wrapper = btn.closest( '.cds--text-input-wrapper' );
			if ( ! wrapper ) {
				return;
			}
			const input = wrapper.querySelector( 'input.cds--password-input' );
			if ( ! input ) {
				return;
			}
			const ctx = getContext();
			const isVisible = input.getAttribute( 'type' ) === 'text';
			input.setAttribute( 'type', isVisible ? 'password' : 'text' );
			btn.setAttribute(
				'aria-label',
				isVisible ? ctx.showLabel : ctx.hideLabel
			);
			btn.innerHTML = isVisible ? EYE_OPEN : EYE_OFF;
		},
	},
} );
