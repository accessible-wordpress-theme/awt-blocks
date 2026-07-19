import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';

const ALLOWED = [ 'awt/accordion-item' ];
const TEMPLATE = [
	[ 'awt/accordion-item', { title: 'First section' } ],
	[ 'awt/accordion-item', { title: 'Second section' } ],
];

export default function Edit( { attributes, setAttributes } ) {
	const { align, size, singleOpen } = attributes;
	const blockProps = useBlockProps( {
		className: `cds--accordion cds--accordion--${ align } cds--accordion--${ size }`,
	} );
	// Merge blockProps so the cds--accordion classes survive (previous
	// `{ ...blockProps } { ...innerProps }` spread dropped them).
	const innerProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED,
		template: TEMPLATE,
		orientation: 'vertical',
	} );
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Accordion', 'awt' ) }>
					<SelectControl
						label={ __( 'Chevron alignment', 'awt' ) }
						value={ align }
						options={ [
							{ value: 'end', label: __( 'End', 'awt' ) },
							{ value: 'start', label: __( 'Start', 'awt' ) },
						] }
						onChange={ ( v ) => setAttributes( { align: v } ) }
					/>
					<SelectControl
						label={ __( 'Size', 'awt' ) }
						value={ size }
						options={ [
							{ value: 'sm', label: 'sm' },
							{ value: 'md', label: 'md' },
							{ value: 'lg', label: 'lg' },
						] }
						onChange={ ( v ) => setAttributes( { size: v } ) }
					/>
					<ToggleControl
						label={ __( 'Single-open mode', 'awt' ) }
						help={ __(
							'Only one item can be open at a time. Opening one closes the others.',
							'awt'
						) }
						checked={ singleOpen }
						onChange={ ( v ) => setAttributes( { singleOpen: v } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<ul { ...innerProps } />
		</>
	);
}
