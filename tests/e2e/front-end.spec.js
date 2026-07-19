/**
 * Front-end render test: a page composed of representative AWT blocks
 * renders on the tests site with the expected Carbon markup, working
 * interactivity (accordion toggle), and no console errors.
 *
 * Self-contained: the page is created through the REST API at test time, so
 * this needs no seeded content.
 */

const { test, expect } = require( './fixtures' );

const PAGE_CONTENT = `
<!-- wp:awt/section -->
<!-- wp:awt/stat {"value":"98%","heading":"Automated checks passed","level":"3"} /-->
<!-- wp:awt/button {"text":"Get started","href":"#main"} /-->
<!-- wp:awt/tag {"text":"Stable","type":"green"} /-->
<!-- wp:awt/list -->
<!-- wp:awt/list-item {"content":"First item"} /-->
<!-- wp:awt/list-item {"content":"Second item"} /-->
<!-- /wp:awt/list -->
<!-- wp:awt/accordion -->
<!-- wp:awt/accordion-item {"title":"What is AWT?"} -->
<!-- wp:paragraph --><p>An accessibility-first theme.</p><!-- /wp:paragraph -->
<!-- /wp:awt/accordion-item -->
<!-- /wp:awt/accordion -->
<!-- /wp:awt/section -->
`;

test.describe( 'AWT blocks render on the front end', () => {
	let pageId;

	test.beforeAll( async ( { requestUtils } ) => {
		// Theme + plugin activation happens in env:prepare-tests (wp-cli),
		// which `npm run test:e2e` runs first.
		const created = await requestUtils.createPage( {
			title: 'Front-end smoke',
			content: PAGE_CONTENT,
			status: 'publish',
		} );
		pageId = created.id;
	} );

	test( 'representative blocks emit Carbon markup and interactivity works', async ( {
		page,
	} ) => {
		const consoleErrors = [];
		page.on( 'console', ( msg ) => {
			if ( msg.type() === 'error' ) {
				consoleErrors.push( msg.text() );
			}
		} );

		await page.goto( `/?page_id=${ pageId }` );

		// Server-rendered Carbon structures.
		await expect( page.locator( '.awt-stat' ) ).toBeVisible();
		await expect(
			page.locator( '.awt-stat h3.awt-stat__heading' )
		).toContainText( 'Automated checks passed' );
		await expect( page.locator( '.cds--btn' ).first() ).toContainText(
			'Get started'
		);
		await expect( page.locator( '.cds--tag' ).first() ).toContainText(
			'Stable'
		);
		await expect( page.locator( '.cds--list--unordered li' ) ).toHaveCount(
			2
		);

		// Interactivity API behavior: the accordion opens on click.
		const accordionBtn = page.locator( '.cds--accordion__heading' ).first();
		await expect( accordionBtn ).toBeVisible();
		const expandedBefore =
			await accordionBtn.getAttribute( 'aria-expanded' );
		await accordionBtn.click();
		await expect( accordionBtn ).toHaveAttribute(
			'aria-expanded',
			expandedBefore === 'true' ? 'false' : 'true'
		);

		expect(
			consoleErrors.filter(
				( t ) => ! t.includes( 'Failed to load resource' )
			)
		).toEqual( [] );
	} );
} );
