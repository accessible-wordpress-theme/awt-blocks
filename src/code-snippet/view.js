/**
 * AWT Code snippet — view-side store.
 *
 * Click the copy button → write the snippet text to the clipboard via the
 * async navigator.clipboard API. On success, swap the button label to the
 * "copied" string for ~1.5s and back. Falls back to a hidden textarea
 * select+execCommand("copy") path when navigator.clipboard isn't available
 * (older Safari, non-HTTPS dev pages).
 */

import { store, getElement, getContext } from '@wordpress/interactivity';

function copyText( text ) {
	if ( navigator && navigator.clipboard && navigator.clipboard.writeText ) {
		return navigator.clipboard.writeText( text );
	}
	return new Promise( ( resolve, reject ) => {
		try {
			const ta = document.createElement( 'textarea' );
			ta.value = text;
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild( ta );
			ta.select();
			const ok = document.execCommand( 'copy' );
			document.body.removeChild( ta );
			if ( ok ) {
				resolve();
			} else {
				reject( new Error( 'execCommand failed' ) );
			}
		} catch ( e ) {
			reject( e );
		}
	} );
}

store( 'awt/code-snippet', {
	actions: {
		copy() {
			const btn = getElement().ref;
			const root = btn.closest( '.cds--snippet' );
			if ( ! root ) {
				return;
			}
			const codeEl = root.querySelector( 'code' );
			const text = codeEl ? codeEl.textContent : '';
			const ctx = getContext();
			copyText( text ).then( () => {
				const original =
					btn.getAttribute( 'aria-label' ) || ctx.copyLabel;
				btn.setAttribute( 'aria-label', ctx.copiedLabel );
				btn.classList.add( 'cds--snippet-button--copied' );
				setTimeout( () => {
					btn.setAttribute( 'aria-label', original );
					btn.classList.remove( 'cds--snippet-button--copied' );
				}, 1500 );
			} );
		},
	},
} );
