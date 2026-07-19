/**
 * Canvas edge marker. Adds a severity class to a flagged block's wrapper in the
 * editor canvas so authors can scan the page for issues at a glance. The class
 * is styled by CSS injected into the canvas iframe via block_editor_settings_all
 * (see awt-blocks.php) — editor.scss only reaches the main frame, not the iframe.
 */

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { LINTER_STORE } from './store';

const withCanvasMarker = createHigherOrderComponent( ( BlockListBlock ) => {
	return ( props ) => {
		const sev = useSelect(
			( select ) => {
				const fs = select( LINTER_STORE ).getFindingsForBlock(
					props.clientId
				);
				if ( ! fs.length ) {
					return null;
				}
				if ( fs.some( ( f ) => f.severity === 'error' ) ) {
					return 'error';
				}
				if ( fs.some( ( f ) => f.severity === 'warning' ) ) {
					return 'warning';
				}
				return 'info';
			},
			[ props.clientId ]
		);

		if ( ! sev ) {
			return <BlockListBlock { ...props } />;
		}
		const className =
			( props.className ? props.className + ' ' : '' ) +
			`awt-a11y-flagged awt-a11y-flagged--${ sev }`;
		return <BlockListBlock { ...props } className={ className } />;
	};
}, 'withAwtCanvasMarker' );

addFilter(
	'editor.BlockListBlock',
	'awt/linter-canvas-marker',
	withCanvasMarker
);
