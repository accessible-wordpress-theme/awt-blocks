/**
 * Color-scheme toggle — view-side store.
 *
 * Cooperates with the inline pre-paint script in the theme that runs before
 * first paint to resolve the active scheme. This view-side store handles
 * runtime user-initiated changes (click handlers, polite announce, cookie
 * write).
 */

import { store, getElement, getContext } from '@wordpress/interactivity';

const COOKIE_NAME = 'awt_color_scheme';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function writeCookie( value ) {
	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	document.cookie = `${ COOKIE_NAME }=${ value }; Path=/; Max-Age=${ COOKIE_MAX_AGE }; SameSite=Lax${ secure }`;
}

function activeScheme() {
	return document.documentElement.dataset.awtColorScheme === 'dark'
		? 'dark'
		: 'light';
}

function applyScheme( scheme ) {
	const variants = window.AWT_THEME_SCOPES || {
		light: 'white',
		dark: 'g100',
	};
	const root = document.documentElement;
	const body = document.body;

	root.dataset.awtColorScheme = scheme;

	// Remove all cds--<variant> scope classes and apply the active one.
	[ 'white', 'g10', 'g90', 'g100' ].forEach( ( v ) =>
		body.classList.remove( `cds--${ v }` )
	);
	const variant = scheme === 'dark' ? variants.dark : variants.light;
	body.classList.add( `cds--${ variant }` );
}

function announce( message ) {
	let region = document.getElementById( 'awt-color-scheme-announcer' );
	if ( ! region ) {
		region = document.createElement( 'div' );
		region.id = 'awt-color-scheme-announcer';
		region.setAttribute( 'role', 'status' );
		region.setAttribute( 'aria-live', 'polite' );
		region.style.position = 'absolute';
		region.style.width = '1px';
		region.style.height = '1px';
		region.style.overflow = 'hidden';
		region.style.clip = 'rect(0 0 0 0)';
		document.body.appendChild( region );
	}
	region.textContent = message;
}

store( 'awt/color-scheme-toggle', {
	actions: {
		toggle() {
			const ctx = getContext();
			const current = activeScheme();
			const next = current === 'dark' ? 'light' : 'dark';
			applyScheme( next );
			writeCookie( next );
			const button = getElement().ref;
			button.setAttribute(
				'aria-pressed',
				next === 'dark' ? 'true' : 'false'
			);
			announce( next === 'dark' ? ctx.darkLabel : ctx.lightLabel );
		},
		setLight() {
			applyScheme( 'light' );
			writeCookie( 'light' );
			announce( getContext().lightLabel );
		},
		setDark() {
			applyScheme( 'dark' );
			writeCookie( 'dark' );
			announce( getContext().darkLabel );
		},
		setAuto() {
			writeCookie( 'auto' );
			const media = window.matchMedia( '(prefers-color-scheme: dark)' );
			applyScheme( media.matches ? 'dark' : 'light' );
			announce( getContext().autoLabel );
		},
	},
	callbacks: {
		init() {
			const button = getElement().ref;
			button.setAttribute(
				'aria-pressed',
				activeScheme() === 'dark' ? 'true' : 'false'
			);
		},
	},
} );
