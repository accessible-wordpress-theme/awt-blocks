/**
 * awt/linter data store — the single source of truth for current findings,
 * so block-agnostic surfaces (sidebar, pre-publish) and per-block surfaces
 * (the toolbar indicator HOC, which renders in a different React tree) read
 * the same data. One runner component computes findings and writes them here.
 */

import { createReduxStore, register } from '@wordpress/data';

export const LINTER_STORE = 'awt/linter';

const DEFAULT_STATE = { findings: [] };

const store = createReduxStore( LINTER_STORE, {
	reducer( state = DEFAULT_STATE, action ) {
		if ( action.type === 'SET_FINDINGS' ) {
			return { ...state, findings: action.findings };
		}
		return state;
	},
	actions: {
		setFindings( findings ) {
			return { type: 'SET_FINDINGS', findings };
		},
	},
	selectors: {
		getFindings( state ) {
			return state.findings;
		},
		getFindingsForBlock( state, clientId ) {
			return state.findings.filter( ( f ) => f.clientId === clientId );
		},
		getCount( state ) {
			return state.findings.length;
		},
		getSeverityCounts( state ) {
			return state.findings.reduce( ( acc, f ) => {
				acc[ f.severity ] = ( acc[ f.severity ] || 0 ) + 1;
				return acc;
			}, {} );
		},
	},
} );

register( store );
