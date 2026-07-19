import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	Notice,
} from '@wordpress/components';

const ALLOWED = [
	'awt/side-nav-section',
	'awt/side-nav-link',
	'awt/side-nav-divider',
];
const TEMPLATE = [
	[
		'awt/side-nav-section',
		{ title: 'Section' },
		[
			[ 'awt/side-nav-link', { text: 'Overview', href: '/overview' } ],
			[
				'awt/side-nav-link',
				{ text: 'Getting started', href: '/getting-started' },
			],
		],
	],
];

export default function Edit( { attributes, setAttributes } ) {
	const { ariaLabel, defaultExpanded, togglable, mode, id } = attributes;
	const isNone = mode === 'none';
	const blockProps = useBlockProps(
		isNone
			? {}
			: {
					className: 'cds--side-nav awt-side-nav-preview',
					'aria-label': ariaLabel,
					style: {
						background: 'var(--cds-layer-01, #f4f4f4)',
						padding: '0.5rem',
						minWidth: '12rem',
					},
			  }
	);
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'cds--side-nav__items' },
		{ allowedBlocks: ALLOWED, template: TEMPLATE, orientation: 'vertical' }
	);

	if ( isNone ) {
		return (
			<div { ...blockProps }>
				<Notice status="info" isDismissible={ false }>
					{ __(
						'Side nav mode is "none" — this block does not render on the front-end.',
						'awt'
					) }
				</Notice>
				<InspectorControls>
					<PanelBody
						title={ __( 'Side nav', 'awt' ) }
						initialOpen={ true }
					>
						<SelectControl
							label={ __( 'Mode', 'awt' ) }
							value={ mode }
							options={ [
								{
									value: 'persistent',
									label: __( 'Persistent', 'awt' ),
								},
								{ value: 'rail', label: __( 'Rail', 'awt' ) },
								{
									value: 'overlay',
									label: __( 'Overlay', 'awt' ),
								},
								{ value: 'none', label: __( 'None', 'awt' ) },
							] }
							onChange={ ( value ) =>
								setAttributes( { mode: value } )
							}
						/>
					</PanelBody>
				</InspectorControls>
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Side nav', 'awt' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Mode', 'awt' ) }
						value={ mode }
						options={ [
							{
								value: 'persistent',
								label: __( 'Persistent', 'awt' ),
							},
							{ value: 'rail', label: __( 'Rail', 'awt' ) },
							{ value: 'overlay', label: __( 'Overlay', 'awt' ) },
							{ value: 'none', label: __( 'None', 'awt' ) },
						] }
						onChange={ ( value ) =>
							setAttributes( { mode: value } )
						}
					/>
					<ToggleControl
						label={ __( 'Default expanded', 'awt' ) }
						checked={ defaultExpanded }
						onChange={ ( value ) =>
							setAttributes( { defaultExpanded: value } )
						}
					/>
					<ToggleControl
						label={ __( 'User can toggle', 'awt' ) }
						checked={ togglable }
						onChange={ ( value ) =>
							setAttributes( { togglable: value } )
						}
					/>
					<TextControl
						label={ __( 'DOM id', 'awt' ) }
						help={ __(
							'Match a header-action panelId to this for a toggle button to control the side nav.',
							'awt'
						) }
						value={ id }
						onChange={ ( value ) => setAttributes( { id: value } ) }
					/>
					<TextControl
						label={ __( 'Accessible name (aria-label)', 'awt' ) }
						value={ ariaLabel }
						onChange={ ( value ) =>
							setAttributes( { ariaLabel: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<aside { ...blockProps }>
				<nav
					className="cds--side-nav__navigation"
					aria-label={ ariaLabel || 'Side navigation' }
				>
					<ul { ...innerBlocksProps } />
				</nav>
			</aside>
		</>
	);
}
