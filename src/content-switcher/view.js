/**
 * AWT Content switcher — view-side store.
 *
 * Works like the tabs store: the Nth segment shows the Nth panel. On boot it
 * pairs segments with panels by DOM order (wiring aria-controls /
 * aria-labelledby) and activates the first. Click or arrow-key navigation
 * (Left/Right/Home/End — WAI-ARIA automatic-activation pattern) swaps the
 * selected segment and its panel.
 *
 * A `awt:content-switcher-change` CustomEvent (detail: { value }) still fires
 * on every change for app/JS consumers that want the raw value too.
 */

import { store, getElement, withSyncEvent } from '@wordpress/interactivity';

function getRoot( ref ) {
	return ref.closest( '.awt-content-switcher' );
}

function getSegments( root ) {
	return Array.from(
		root.querySelectorAll( '.cds--content-switcher [role="tab"]' )
	);
}

function getPanels( root ) {
	return Array.from( root.querySelectorAll( ':scope > [role="tabpanel"]' ) );
}

function activate( root, target ) {
	const segments = getSegments( root );
	const panels = getPanels( root );
	segments.forEach( ( seg, i ) => {
		const isTarget = seg === target;
		seg.setAttribute( 'aria-selected', isTarget ? 'true' : 'false' );
		seg.setAttribute( 'tabindex', isTarget ? '0' : '-1' );
		seg.classList.toggle( 'cds--content-switcher--selected', isTarget );
		if ( panels[ i ] ) {
			panels[ i ].toggleAttribute( 'hidden', ! isTarget );
		}
	} );
	const value = target.dataset.value || '';
	root.dispatchEvent(
		new CustomEvent( 'awt:content-switcher-change', {
			detail: { value },
			bubbles: true,
		} )
	);
}

store( 'awt/content-switcher', {
	callbacks: {
		init() {
			const root = getElement().ref;
			const segments = getSegments( root );
			const panels = getPanels( root );
			segments.forEach( ( seg, i ) => {
				const panel = panels[ i ];
				if ( panel ) {
					seg.setAttribute( 'aria-controls', panel.id );
					panel.setAttribute( 'aria-labelledby', seg.id );
				}
			} );
			// Activate the first enabled segment (skip a leading disabled one).
			const first =
				segments.find( ( s ) => ! s.disabled ) || segments[ 0 ];
			if ( first ) {
				activate( root, first );
			}
		},
	},
	actions: {
		choose() {
			const seg = getElement().ref;
			const root = getRoot( seg );
			if ( root ) {
				activate( root, seg );
				seg.focus();
			}
		},
		keydown: withSyncEvent( ( event ) => {
			if (
				! [ 'ArrowLeft', 'ArrowRight', 'Home', 'End' ].includes(
					event.key
				)
			) {
				return;
			}
			event.preventDefault();
			const seg = getElement().ref;
			const root = getRoot( seg );
			if ( ! root ) {
				return;
			}
			const all = getSegments( root );
			let idx = all.indexOf( seg );
			if ( event.key === 'ArrowLeft' ) {
				idx = ( idx - 1 + all.length ) % all.length;
			}
			if ( event.key === 'ArrowRight' ) {
				idx = ( idx + 1 ) % all.length;
			}
			if ( event.key === 'Home' ) {
				idx = 0;
			}
			if ( event.key === 'End' ) {
				idx = all.length - 1;
			}
			const next = all[ idx ];
			if ( next ) {
				activate( root, next );
				next.focus();
			}
		} ),
	},
} );
