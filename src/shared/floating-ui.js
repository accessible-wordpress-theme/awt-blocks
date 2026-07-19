/**
 * Shared floating-ui helpers for AWT view-side stores.
 *
 * Every AWT block that anchors a floating surface to a trigger (tooltip,
 * menu-button, popover, combobox, dropdown, multi-select, overflow-menu,
 * contextual-menu, toggletip, date-picker, time-picker) goes through this
 * module. Two contracts:
 *
 *   attach(trigger, floating, options) — wraps computePosition + middleware.
 *     Returns { update, dispose }. Call update() whenever the trigger or
 *     floating size/position changes (e.g., on open, on resize, on scroll).
 *     dispose() removes listeners and clears inline positioning styles.
 *
 *   installOutsideDismiss(floating, trigger, onDismiss) — listens for
 *     click-outside + Escape + Tab-out and invokes onDismiss(reason).
 *     Reasons: "outside-click", "escape", "tab-out". onDismiss is responsible
 *     for any post-close cleanup (the helper does NOT mutate ARIA or hidden
 *     state — that's the caller's domain).
 *
 * The helpers intentionally do not own ARIA, focus management, or visibility
 * mechanics. Those vary by block (tooltip uses aria-describedby; menu uses
 * aria-expanded + roving tabindex; popover dialog uses focus trap). Keeping
 * positioning + dismissal here means each block's view.js stays small and
 * the contract is consistent.
 *
 * Bundle weight: @floating-ui/dom is ~5 KB minified. Webpack dedupes it
 * across every block view bundle that imports it.
 */

import {
	computePosition,
	flip,
	shift,
	offset,
	autoUpdate,
} from '@floating-ui/dom';

/**
 * Anchor a floating element to a trigger.
 *
 * @param {HTMLElement} trigger
 * @param {HTMLElement} floating
 * @param {Object}      options
 * @param {string}      [options.placement='top'] Floating-ui placement (top, bottom, left, right, ...).
 * @param {number}      [options.offsetPx=8]      Gap between trigger and floating element.
 * @param {boolean}     [options.autoUpdate=true] Reposition on scroll/resize.
 * @param {number}      [options.shiftPadding=8]  Viewport padding for the shift middleware.
 *
 * @return {{ update: () => Promise<void>, dispose: () => void }} Handle to reposition or tear down the attachment.
 */
export function attach( trigger, floating, options = {} ) {
	const {
		placement = 'top',
		offsetPx = 8,
		autoUpdate: live = true,
		shiftPadding = 8,
	} = options;

	const middleware = [
		offset( offsetPx ),
		flip(),
		shift( { padding: shiftPadding } ),
	];

	const update = async () => {
		const {
			x,
			y,
			placement: actualPlacement,
		} = await computePosition( trigger, floating, {
			placement,
			middleware,
			strategy: 'fixed',
		} );
		Object.assign( floating.style, {
			position: 'fixed',
			left: `${ x }px`,
			top: `${ y }px`,
		} );
		floating.dataset.placement = actualPlacement;
	};

	let cleanup = () => {};
	if ( live ) {
		cleanup = autoUpdate( trigger, floating, update );
	} else {
		update();
	}

	return {
		update,
		dispose: () => {
			cleanup();
			floating.style.position = '';
			floating.style.left = '';
			floating.style.top = '';
			delete floating.dataset.placement;
		},
	};
}

/**
 * Wire dismissal behavior: outside-click, Escape, Tab-out (focus moves outside
 * both trigger and floating).
 *
 * The helper attaches listeners on `document` (capture phase for clicks so we
 * see the event even if a descendant calls stopPropagation). Caller is
 * responsible for calling dispose() when the floating element closes — leaks
 * are easy to introduce if dispose() is forgotten on every close path.
 *
 * @param {HTMLElement}              floating
 * @param {HTMLElement}              trigger
 * @param {(reason: string) => void} onDismiss
 *
 * @return {() => void} dispose
 */
export function installOutsideDismiss( floating, trigger, onDismiss ) {
	const handleClick = ( event ) => {
		const target = event.target;
		if (
			target instanceof Node &&
			! floating.contains( target ) &&
			! trigger.contains( target )
		) {
			onDismiss( 'outside-click' );
		}
	};

	const handleKey = ( event ) => {
		if ( event.key === 'Escape' ) {
			event.stopPropagation();
			onDismiss( 'escape' );
		}
	};

	const handleFocusIn = ( event ) => {
		const target = event.target;
		if (
			target instanceof Node &&
			! floating.contains( target ) &&
			! trigger.contains( target )
		) {
			onDismiss( 'tab-out' );
		}
	};

	document.addEventListener( 'click', handleClick, true );
	document.addEventListener( 'keydown', handleKey );
	document.addEventListener( 'focusin', handleFocusIn );

	return () => {
		document.removeEventListener( 'click', handleClick, true );
		document.removeEventListener( 'keydown', handleKey );
		document.removeEventListener( 'focusin', handleFocusIn );
	};
}
