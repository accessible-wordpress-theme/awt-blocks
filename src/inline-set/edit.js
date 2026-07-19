import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';

const ALLOWED = [ 'awt/button', 'awt/link', 'awt/tag', 'awt/icon' ];

const TEMPLATE = [
	[ 'awt/button', { label: 'Primary action', kind: 'primary' } ],
	[ 'awt/button', { label: 'Secondary action', kind: 'secondary' } ],
];

const ORIENTATION = [
	{ label: __( 'Horizontal', 'awt' ), value: 'horizontal' },
	{ label: __( 'Vertical', 'awt' ), value: 'vertical' },
];

const GAP = [
	{ label: __( 'Small (0.25rem)', 'awt' ), value: 'sm' },
	{ label: __( 'Medium (0.5rem)', 'awt' ), value: 'md' },
	{ label: __( 'Large (1rem)', 'awt' ), value: 'lg' },
	{ label: __( 'X-large (1.5rem)', 'awt' ), value: 'xl' },
];

const ALIGN = [
	{ label: __( 'Start', 'awt' ), value: 'start' },
	{ label: __( 'Center', 'awt' ), value: 'center' },
	{ label: __( 'End', 'awt' ), value: 'end' },
	{ label: __( 'Space between', 'awt' ), value: 'between' },
];

export default function Edit( { attributes, setAttributes } ) {
	const { orientation, gap, align, wrap } = attributes;
	const classes = [
		'awt-inline-set',
		`awt-inline-set--${ orientation }`,
		`awt-inline-set--gap-${ gap }`,
		`awt-inline-set--align-${ align }`,
		wrap ? 'awt-inline-set--wrap' : 'awt-inline-set--nowrap',
	].join( ' ' );

	const blockProps = useBlockProps( { className: classes } );
	const innerProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		allowedBlocks: ALLOWED,
		orientation: orientation === 'vertical' ? 'vertical' : 'horizontal',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Inline set', 'awt' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Orientation', 'awt' ) }
						value={ orientation }
						options={ ORIENTATION }
						onChange={ ( v ) =>
							setAttributes( { orientation: v } )
						}
					/>
					<SelectControl
						label={ __( 'Gap', 'awt' ) }
						value={ gap }
						options={ GAP }
						onChange={ ( v ) => setAttributes( { gap: v } ) }
					/>
					<SelectControl
						label={ __( 'Alignment', 'awt' ) }
						value={ align }
						options={ ALIGN }
						onChange={ ( v ) => setAttributes( { align: v } ) }
					/>
					<ToggleControl
						label={ __(
							'Wrap to next line when out of space',
							'awt'
						) }
						checked={ wrap }
						onChange={ ( v ) => setAttributes( { wrap: v } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerProps } />
		</>
	);
}
