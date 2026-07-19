/**
 * Floor A compatibility: Polylang (multilingual family — the spec names
 * WPML/Polylang together; Polylang is the free, CI-installable member.
 * WPML itself is commercial and sits on the manual release checklist).
 *
 *   - install + activate alongside AWT without fatals
 *   - add a second language (German), translate a page
 *   - both language versions render on the front end with Carbon styling
 */

const { test, expect } = require( '../e2e/fixtures' );
const { bash, phpEval, collectConsoleErrors } = require( './helpers' );

let enUrl = '';
let deUrl = '';

test.describe( 'Polylang — Floor A coexistence', () => {
	test.beforeAll( () => {
		test.setTimeout( 300_000 );
		bash( 'wp plugin install polylang --activate' );
		// Languages + a translated page pair, via Polylang's PHP API
		// (Polylang ships no wp-cli commands).
		const setup = `
			$model = PLL()->model;
			if ( ! $model->get_language( 'en' ) ) {
				$model->add_language( array( 'name' => 'English', 'slug' => 'en', 'locale' => 'en_US', 'rtl' => 0, 'term_group' => 0 ) );
			}
			if ( ! $model->get_language( 'de' ) ) {
				$model->add_language( array( 'name' => 'Deutsch', 'slug' => 'de', 'locale' => 'de_DE', 'rtl' => 0, 'term_group' => 1 ) );
			}
			$model->clean_languages_cache();
			$content = '<!-- wp:awt/section --><!-- wp:awt/stat {"value":"100%","heading":"accessible"} /--><!-- /wp:awt/section -->';
			$en = wp_insert_post( array( 'post_title' => 'Languages EN', 'post_type' => 'page', 'post_status' => 'publish', 'post_content' => $content ) );
			$de = wp_insert_post( array( 'post_title' => 'Sprachen DE', 'post_type' => 'page', 'post_status' => 'publish', 'post_content' => $content ) );
			pll_set_post_language( $en, 'en' );
			pll_set_post_language( $de, 'de' );
			pll_save_post_translations( array( 'en' => $en, 'de' => $de ) );
			echo get_permalink( $en ), '|', get_permalink( $de );
		`;
		const urls = phpEval( setup ).split( '\n' ).pop();
		[ enUrl, deUrl ] = urls.split( '|' );
	} );

	test.afterAll( () => {
		test.setTimeout( 120_000 );
		bash( 'wp plugin deactivate polylang && wp plugin delete polylang' );
	} );

	test( 'both language versions render with Carbon styling', async ( {
		page,
	} ) => {
		const errors = collectConsoleErrors( page );

		await page.goto( enUrl );
		await expect( page.locator( '.cds--header' ) ).toBeVisible();
		await expect( page.locator( '.awt-stat' ) ).toBeVisible();

		await page.goto( deUrl );
		await expect( page.locator( '.cds--header' ) ).toBeVisible();
		await expect( page.locator( '.awt-stat' ) ).toBeVisible();
		await expect( page.locator( 'html' ) ).toHaveAttribute( 'lang', /de/i );

		expect( errors ).toEqual( [] );
	} );
} );
