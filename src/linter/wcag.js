/**
 * WCAG 2.x contrast math — JS port of awt-theme/inc/contrast.php.
 * Pure functions on hex/rgb color strings. Used by the linter's contrast check
 * (#12) and, later, the palette contrast checker (§4 Part 3).
 */

export function hexToRgb( hex ) {
	if ( typeof hex !== 'string' ) {
		return null;
	}
	let h = hex.trim().replace( /^#/, '' );
	if ( h.length === 3 ) {
		h = h
			.split( '' )
			.map( ( c ) => c + c )
			.join( '' );
	}
	if ( h.length === 8 ) {
		h = h.slice( 0, 6 ); // drop alpha
	}
	if ( ! /^[0-9a-fA-F]{6}$/.test( h ) ) {
		return null;
	}
	return [
		parseInt( h.slice( 0, 2 ), 16 ),
		parseInt( h.slice( 2, 4 ), 16 ),
		parseInt( h.slice( 4, 6 ), 16 ),
	];
}

/**
 * Parse rgb()/rgba() into [r,g,b], else null.
 * @param {string} value CSS color string.
 */
export function rgbStringToRgb( value ) {
	const m = String( value ).match( /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i );
	return m ? [ Number( m[ 1 ] ), Number( m[ 2 ] ), Number( m[ 3 ] ) ] : null;
}

export function relativeLuminance( [ r, g, b ] ) {
	const channel = ( c ) => {
		const s = c / 255;
		return s <= 0.03928
			? s / 12.92
			: Math.pow( ( s + 0.055 ) / 1.055, 2.4 );
	};
	return (
		0.2126 * channel( r ) + 0.7152 * channel( g ) + 0.0722 * channel( b )
	);
}

function toRgb( color ) {
	if ( ! color ) {
		return null;
	}
	if ( color[ 0 ] === '#' ) {
		return hexToRgb( color );
	}
	if ( /^rgba?\(/i.test( color ) ) {
		return rgbStringToRgb( color );
	}
	return hexToRgb( color ); // bare hex without '#'
}

/**
 * WCAG contrast ratio between two colors (hex or rgb()). null if unparseable.
 * @param {string} colorA First color (hex or rgb()).
 * @param {string} colorB Second color (hex or rgb()).
 */
export function ratio( colorA, colorB ) {
	const a = toRgb( colorA );
	const b = toRgb( colorB );
	if ( ! a || ! b ) {
		return null;
	}
	const la = relativeLuminance( a ) + 0.05;
	const lb = relativeLuminance( b ) + 0.05;
	return la > lb ? la / lb : lb / la;
}
