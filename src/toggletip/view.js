/**
 * AWT Toggletip — view-side store.
 *
 * Carbon's click-not-hover tooltip variant: a small info button that opens an
 * anchored popover on click. Unlike the hover-driven Tooltip, the Toggletip's
 * content can include links and longer copy because the visitor controls
 * dismissal explicitly.
 *
 * Positioning runs through the shared floating-ui helper (flip + shift +
 * autoUpdate). Dismissal goes through installOutsideDismiss so click-outside,
 * Escape, and Tab-out all close cleanly and return focus to the trigger when
 * appropriate.
 */

import { store, getElement } from '@wordpress/interactivity';
import { attach, installOutsideDismiss } from '../shared/floating-ui';

const handles = new WeakMap();
const dismissers = new WeakMap();

function getParts( ref ) {
	const root = ref.closest( '.cds--toggletip' );
	if ( ! root ) {
		return null;
	}
	const trigger = root.querySelector( '.cds--toggletip-button' );
	const content = root.querySelector( '.cds--toggletip-content' );
	return trigger && content ? { root, trigger, content } : null;
}

function openTip( parts ) {
	const { root, trigger, content } = parts;
	content.removeAttribute( 'hidden' );
	trigger.setAttribute( 'aria-expanded', 'true' );

	if ( ! handles.has( root ) ) {
		const placement = root.dataset.placement || 'bottom';
		handles.set(
			root,
			attach( trigger, content, { placement, offsetPx: 8 } )
		);
	}
	if ( ! dismissers.has( root ) ) {
		dismissers.set(
			root,
			installOutsideDismiss( content, trigger, () =>
				closeTip( parts, false )
			)
		);
	}
}

function closeTip( parts, returnFocus = true ) {
	const { root, trigger, content } = parts;
	content.setAttribute( 'hidden', '' );
	trigger.setAttribute( 'aria-expanded', 'false' );

	const handle = handles.get( root );
	if ( handle ) {
		handle.dispose();
		handles.delete( root );
	}
	const disposeDismiss = dismissers.get( root );
	if ( disposeDismiss ) {
		disposeDismiss();
		dismissers.delete( root );
	}
	if ( returnFocus && trigger ) {
		trigger.focus();
	}
}

store( 'awt/toggletip', {
	actions: {
		toggle() {
			const parts = getParts( getElement().ref );
			if ( ! parts ) {
				return;
			}
			const isOpen =
				parts.trigger.getAttribute( 'aria-expanded' ) === 'true';
			if ( isOpen ) {
				closeTip( parts, /* returnFocus */ false );
			} else {
				openTip( parts );
			}
		},
	},
} );
