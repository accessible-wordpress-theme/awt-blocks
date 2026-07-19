/**
 * AWT Dropdown — view-side store.
 *
 * Carbon dropdown pattern: a button that opens a listbox below. Floating-ui
 * positions the listbox; installOutsideDismiss closes on outside-click,
 * Escape, or focus moving outside. Selection updates the trigger's display
 * value + the hidden <input> that participates in form submission.
 */

import { store, getElement } from '@wordpress/interactivity';
import { attach, installOutsideDismiss } from '../shared/floating-ui';

const handles = new WeakMap();
const dismissers = new WeakMap();

function getParts( ref ) {
	const root = ref.closest( '.cds--dropdown' );
	if ( ! root ) {
		return null;
	}
	const trigger = root.querySelector( '.cds--list-box__field' );
	const listbox = root.querySelector( '.cds--list-box__menu' );
	const hidden = root.querySelector( 'input[type="hidden"]' );
	return trigger && listbox ? { root, trigger, listbox, hidden } : null;
}

function open( parts ) {
	const { root, trigger, listbox } = parts;
	// Match the menu's width to the trigger so it doesn't grow to whatever
	// the closest positioned ancestor allows. With `position: fixed` (from
	// the floating-ui helper) the menu's natural containing block is the
	// viewport, which made the menu render at full window width — Carbon's
	// `.cds--list-box__menu` rule has `inline-size: 100%`, so 100% became
	// 100vw. Pinning width here keeps it locked to the trigger.
	listbox.style.width = `${ trigger.offsetWidth }px`;
	listbox.removeAttribute( 'hidden' );
	trigger.setAttribute( 'aria-expanded', 'true' );
	root.classList.add( 'cds--list-box--expanded' );
	if ( ! handles.has( root ) ) {
		handles.set(
			root,
			attach( trigger, listbox, {
				placement: 'bottom-start',
				offsetPx: 0,
			} )
		);
	}
	if ( ! dismissers.has( root ) ) {
		dismissers.set(
			root,
			installOutsideDismiss( listbox, trigger, () =>
				close( parts, false )
			)
		);
	}
}

function close( parts, returnFocus = true ) {
	const { root, trigger, listbox } = parts;
	listbox.setAttribute( 'hidden', '' );
	listbox.style.width = '';
	trigger.setAttribute( 'aria-expanded', 'false' );
	root.classList.remove( 'cds--list-box--expanded' );
	const h = handles.get( root );
	if ( h ) {
		h.dispose();
		handles.delete( root );
	}
	const d = dismissers.get( root );
	if ( d ) {
		d();
		dismissers.delete( root );
	}
	if ( returnFocus && trigger ) {
		trigger.focus();
	}
}

store( 'awt/dropdown', {
	actions: {
		toggle() {
			const parts = getParts( getElement().ref );
			if ( ! parts ) {
				return;
			}
			if ( parts.trigger.getAttribute( 'aria-expanded' ) === 'true' ) {
				close( parts, /* returnFocus */ false );
			} else {
				open( parts );
			}
		},
		choose() {
			const itemBtn = getElement().ref;
			const value = itemBtn.dataset.value || '';
			const label = itemBtn.textContent || '';
			const root = itemBtn.closest( '.cds--dropdown' );
			if ( ! root ) {
				return;
			}
			const labelEl = root.querySelector( '.cds--list-box__label' );
			const hidden = root.querySelector( 'input[type="hidden"]' );
			if ( labelEl ) {
				labelEl.textContent = label;
			}
			if ( hidden ) {
				hidden.value = value;
			}
			root.querySelectorAll(
				'.cds--list-box__menu-item--highlighted'
			).forEach( ( el ) =>
				el.classList.remove( 'cds--list-box__menu-item--highlighted' )
			);
			itemBtn.classList.add( 'cds--list-box__menu-item--highlighted' );
			itemBtn.setAttribute( 'aria-selected', 'true' );
			const parts = getParts( itemBtn );
			if ( parts ) {
				close( parts, /* returnFocus */ true );
			}
		},
	},
} );
