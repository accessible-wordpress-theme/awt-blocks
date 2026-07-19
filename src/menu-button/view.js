/**
 * AWT Menu button — view-side Interactivity store.
 *
 * WAI-ARIA menu-button pattern:
 *   - Trigger: click toggles; Enter / Space / ArrowDown opens and focuses first item.
 *   - Menu: ArrowDown / ArrowUp navigate; Home / End jump; Enter / Space activate;
 *           Escape closes and returns focus to trigger; Tab closes.
 *   - Outside click / focus-out: closes the menu (Stage 0 known limitation fix).
 *
 * Positioning runs through the shared floating-ui helper so the menu flips +
 * shifts at viewport edges (Stage 0 anchor-only workaround replaced).
 *
 * Floating handles and dismissal disposers are kept on a WeakMap keyed by the
 * wrapper so multiple menus on a page don't leak listeners onto each other.
 */

import {
	store,
	getContext,
	getElement,
	withSyncEvent,
} from '@wordpress/interactivity';
import { attach, installOutsideDismiss } from '../shared/floating-ui';

const handles = new WeakMap();
const dismissers = new WeakMap();

const PLACEMENT_MAP = {
	bottom: 'bottom-start',
	'bottom-start': 'bottom-start',
	'bottom-end': 'bottom-end',
	top: 'top-start',
	'top-start': 'top-start',
	'top-end': 'top-end',
};

function getParts( ref ) {
	const wrapper = ref.closest( '.cds--menu-button' ) || ref.parentElement;
	if ( ! wrapper ) {
		return null;
	}
	const trigger = wrapper.querySelector( '.cds--menu-button__trigger' );
	const menu = wrapper.querySelector( '[role="menu"]' );
	return trigger && menu ? { wrapper, trigger, menu } : null;
}

function resolvePlacement( menuEl ) {
	for ( const cls of menuEl.classList ) {
		if ( cls.startsWith( 'cds--menu--' ) ) {
			const slug = cls.replace( 'cds--menu--', '' );
			return PLACEMENT_MAP[ slug ] || 'bottom-start';
		}
	}
	return 'bottom-start';
}

function focusItem( menuEl, index ) {
	const buttons = menuEl.querySelectorAll( '.cds--menu-item__button' );
	if ( index >= 0 && index < buttons.length ) {
		buttons[ index ].focus();
	}
}

function itemCount( menuEl ) {
	return menuEl.querySelectorAll( '.cds--menu-item' ).length;
}

function openMenu( parts, ctx ) {
	const { wrapper, trigger, menu } = parts;
	menu.removeAttribute( 'hidden' );
	trigger.setAttribute( 'aria-expanded', 'true' );
	// Carbon's chevron-rotation animation is keyed off this modifier class.
	// `.cds--menu-button__trigger--open svg { transform: rotate(180deg) }`
	// + the base trigger's `svg { transition: transform .11s ... }` produces
	// the 180° animated flip when the menu opens.
	trigger.classList.add( 'cds--menu-button__trigger--open' );

	if ( ! handles.has( wrapper ) ) {
		handles.set(
			wrapper,
			attach( trigger, menu, {
				placement: resolvePlacement( menu ),
				offsetPx: 4,
			} )
		);
	}

	if ( ! dismissers.has( wrapper ) ) {
		dismissers.set(
			wrapper,
			installOutsideDismiss( menu, trigger, () => {
				closeMenu( parts, ctx, /* returnFocus */ false );
			} )
		);
	}

	ctx.open = true;
	ctx.activeIndex = 0;
	queueMicrotask( () => focusItem( menu, 0 ) );
}

function closeMenu( parts, ctx, returnFocus = true ) {
	const { wrapper, trigger, menu } = parts;
	menu.setAttribute( 'hidden', '' );
	trigger.setAttribute( 'aria-expanded', 'false' );
	trigger.classList.remove( 'cds--menu-button__trigger--open' );

	const handle = handles.get( wrapper );
	if ( handle ) {
		handle.dispose();
		handles.delete( wrapper );
	}
	const disposeDismiss = dismissers.get( wrapper );
	if ( disposeDismiss ) {
		disposeDismiss();
		dismissers.delete( wrapper );
	}

	ctx.open = false;
	ctx.activeIndex = -1;

	if ( returnFocus && trigger ) {
		trigger.focus();
	}
}

store( 'awt/menu-button', {
	actions: {
		toggle() {
			const parts = getParts( getElement().ref );
			if ( ! parts ) {
				return;
			}
			const ctx = getContext();
			if ( ctx.open ) {
				closeMenu( parts, ctx );
			} else {
				openMenu( parts, ctx );
			}
		},
		triggerKeydown: withSyncEvent( ( event ) => {
			const ctx = getContext();
			if (
				event.key === 'ArrowDown' ||
				event.key === 'Enter' ||
				event.key === ' '
			) {
				event.preventDefault();
				if ( ! ctx.open ) {
					const parts = getParts( getElement().ref );
					if ( parts ) {
						openMenu( parts, ctx );
					}
				}
			}
		} ),
		menuKeydown: withSyncEvent( ( event ) => {
			const ctx = getContext();
			const menu = getElement().ref;
			const wrapper = menu.closest( '.cds--menu-button' );
			const trigger = wrapper?.querySelector(
				'.cds--menu-button__trigger'
			);
			const parts =
				wrapper && trigger ? { wrapper, trigger, menu } : null;

			if ( event.key === 'Escape' ) {
				event.preventDefault();
				if ( parts ) {
					closeMenu( parts, ctx, /* returnFocus */ true );
				}
				return;
			}
			const total = itemCount( menu );
			if ( event.key === 'ArrowDown' ) {
				event.preventDefault();
				ctx.activeIndex = ( ctx.activeIndex + 1 ) % total;
				focusItem( menu, ctx.activeIndex );
				return;
			}
			if ( event.key === 'ArrowUp' ) {
				event.preventDefault();
				ctx.activeIndex = ( ctx.activeIndex - 1 + total ) % total;
				focusItem( menu, ctx.activeIndex );
				return;
			}
			if ( event.key === 'Home' ) {
				event.preventDefault();
				ctx.activeIndex = 0;
				focusItem( menu, 0 );
				return;
			}
			if ( event.key === 'End' ) {
				event.preventDefault();
				ctx.activeIndex = total - 1;
				focusItem( menu, total - 1 );
				return;
			}
			if ( event.key === 'Tab' && parts ) {
				closeMenu( parts, ctx, /* returnFocus */ false );
			}
		} ),
		selectItem() {
			const ctx = getContext();
			const itemBtn = getElement().ref;
			const value = itemBtn.getAttribute( 'data-value' );
			const link = itemBtn.getAttribute( 'data-link' );
			// Notify app/form consumers (cancelable so they can opt out of the
			// default navigation, e.g. to handle the value in JS instead).
			const ev = new CustomEvent( 'awt:menu-select', {
				detail: { value, link },
				bubbles: true,
				cancelable: true,
			} );
			itemBtn.dispatchEvent( ev );
			const wrapper = itemBtn.closest( '.cds--menu-button' );
			const trigger = wrapper?.querySelector(
				'.cds--menu-button__trigger'
			);
			const menu = wrapper?.querySelector( '[role="menu"]' );
			if ( wrapper && trigger && menu ) {
				// Don't return focus to the trigger when we're navigating away.
				closeMenu(
					{ wrapper, trigger, menu },
					ctx,
					/* returnFocus */ ! link
				);
			}
			// Navigation menu: send the visitor to the item's link unless a
			// consumer cancelled the event.
			if ( link && ! ev.defaultPrevented ) {
				window.location.assign( link );
			}
		},
	},
} );
