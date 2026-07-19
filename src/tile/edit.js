import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';

const TEMPLATE = [
	[ 'core/heading', { level: 3, content: 'Tile heading' } ],
	[
		'core/paragraph',
		{ content: 'Tile body text. Describe what this tile represents.' },
	],
];

export default function Edit( { attributes, setAttributes } ) {
	const { variant, href, groupName, summary, defaultOpen } = attributes;

	const classes = [
		'cds--tile',
		variant !== 'default' ? `cds--tile--${ variant }` : null,
	]
		.filter( Boolean )
		.join( ' ' );
	const blockProps = useBlockProps( { className: classes } );
	const innerProps = useInnerBlocksProps( {}, { template: TEMPLATE } );

	// Inline chevron for expandable preview (matches render.php's SVG).
	const Chevron = () => (
		<span className="cds--tile__chevron" aria-hidden="true">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				width="16"
				height="16"
				fill="currentColor"
				focusable="false"
			>
				<path d="M8 11L3 6l.7-.7L8 9.6l4.3-4.3.7.7z" />
			</svg>
		</span>
	);

	const inspector = (
		<InspectorControls>
			<PanelBody title={ __( 'Tile', 'awt' ) }>
				<SelectControl
					label={ __( 'Variant', 'awt' ) }
					value={ variant }
					options={ [
						{
							value: 'default',
							label: __( 'Default (read-only)', 'awt' ),
						},
						{
							value: 'clickable',
							label: __( 'Clickable (renders as link)', 'awt' ),
						},
						{
							value: 'selectable',
							label: __(
								'Selectable (checkbox / radio-tile)',
								'awt'
							),
						},
						{
							value: 'expandable',
							label: __(
								'Expandable (details / summary)',
								'awt'
							),
						},
					] }
					onChange={ ( v ) => setAttributes( { variant: v } ) }
				/>
				{ variant === 'clickable' && (
					<TextControl
						label={ __( 'Link URL', 'awt' ) }
						help={ __( 'The address this tile links to.', 'awt' ) }
						value={ href }
						onChange={ ( v ) => setAttributes( { href: v } ) }
						type="url"
					/>
				) }
				{ variant === 'selectable' && (
					<TextControl
						label={ __(
							'Group name (for radio-tile group)',
							'awt'
						) }
						help={ __(
							'Tiles sharing the same group name form a radio group — only one can be selected. Leave empty for a single checkbox-style toggle.',
							'awt'
						) }
						value={ groupName }
						onChange={ ( v ) => setAttributes( { groupName: v } ) }
					/>
				) }
				{ variant === 'expandable' && (
					<>
						<TextControl
							label={ __( 'Summary (visible header)', 'awt' ) }
							value={ summary }
							onChange={ ( v ) =>
								setAttributes( { summary: v } )
							}
						/>
						<ToggleControl
							label={ __( 'Open by default', 'awt' ) }
							checked={ defaultOpen }
							onChange={ ( v ) =>
								setAttributes( { defaultOpen: v } )
							}
						/>
					</>
				) }
			</PanelBody>
		</InspectorControls>
	);

	// Mirror render.php's structure for each variant so the editor preview
	// matches the published page.
	if ( variant === 'expandable' ) {
		return (
			<>
				{ inspector }
				<details { ...blockProps } open={ defaultOpen }>
					<summary className="cds--tile__summary">
						<span className="cds--tile__summary-row">
							<span className="cds--tile__summary-text">
								{ summary }
							</span>
							<Chevron />
						</span>
					</summary>
					<div className="cds--tile__content">
						<div { ...innerProps } />
					</div>
				</details>
			</>
		);
	}

	let role;
	if ( variant === 'selectable' ) {
		role = groupName ? 'radio' : 'checkbox';
	}

	return (
		<>
			{ inspector }
			<div
				{ ...blockProps }
				role={ role }
				aria-checked={ role ? 'false' : undefined }
				tabIndex={ role ? 0 : undefined }
			>
				<div { ...innerProps } />
			</div>
		</>
	);
}
