import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';

const ALLOWED = [ 'awt/tab', 'awt/tab-panel' ];
const TEMPLATE = [
	[ 'awt/tab', { label: 'Tab 1' } ],
	[ 'awt/tab', { label: 'Tab 2' } ],
	[
		'awt/tab-panel',
		{},
		[ [ 'core/paragraph', { content: 'First tab panel content.' } ] ],
	],
	[
		'awt/tab-panel',
		{},
		[ [ 'core/paragraph', { content: 'Second tab panel content.' } ] ],
	],
];

export default function Edit( { attributes, setAttributes } ) {
	const { orientation, ariaLabel } = attributes;
	// Pass blockProps to useInnerBlocksProps so our `cds--tabs` classes survive
	// the merge with Gutenberg's own block-list wrapper class. Render.php uses
	// a Carbon-spec `<ul class="cds--tab--list" role="tablist">` containing
	// tab buttons + sibling panels; replicating that exact DOM here requires
	// splitting tab vs tab-panel children into two outputs which Gutenberg's
	// InnerBlocks can't do natively. Editor preview therefore renders the
	// children flat under the tabs wrapper — different from render.php but
	// at least the wrapper class makes Carbon's styling apply to the buttons.
	const blockProps = useBlockProps( {
		className: `cds--tabs cds--tabs--${ orientation }`,
	} );
	const innerProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED,
		template: TEMPLATE,
	} );
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Tabs', 'awt' ) } initialOpen={ true }>
					<SelectControl
						label={ __( 'Orientation', 'awt' ) }
						value={ orientation }
						options={ [
							{ label: 'Horizontal', value: 'horizontal' },
							{ label: 'Vertical', value: 'vertical' },
						] }
						onChange={ ( v ) =>
							setAttributes( { orientation: v } )
						}
					/>
					<TextControl
						label={ __( 'Accessible name (aria-label)', 'awt' ) }
						value={ ariaLabel }
						onChange={ ( v ) => setAttributes( { ariaLabel: v } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerProps } />
		</>
	);
}
