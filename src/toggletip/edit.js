import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	SelectControl,
	TextareaControl,
} from '@wordpress/components';

const ALIGN_OPTIONS = [
	'top',
	'top-start',
	'top-end',
	'bottom',
	'bottom-start',
	'bottom-end',
	'left',
	'right',
].map( ( v ) => ( { value: v, label: v } ) );

export default function Edit( { attributes, setAttributes } ) {
	const { label, description, ariaLabel, align } = attributes;
	const blockProps = useBlockProps( {
		className: 'cds--toggletip',
		style: { display: 'inline-flex', alignItems: 'center', gap: '0.25rem' },
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Toggletip', 'awt' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'Trigger label (visible)', 'awt' ) }
						help={ __(
							'Optional. Renders before the info button.',
							'awt'
						) }
						value={ label }
						onChange={ ( v ) => setAttributes( { label: v } ) }
					/>
					<TextControl
						label={ __( 'Trigger accessible name', 'awt' ) }
						help={ __(
							'Read by screen readers (e.g., "Learn more").',
							'awt'
						) }
						value={ ariaLabel }
						onChange={ ( v ) => setAttributes( { ariaLabel: v } ) }
					/>
					<TextareaControl
						label={ __( 'Description', 'awt' ) }
						help={ __(
							'Body of the popover that opens on click.',
							'awt'
						) }
						value={ description }
						onChange={ ( v ) =>
							setAttributes( { description: v } )
						}
						rows={ 4 }
					/>
					<SelectControl
						label={ __( 'Placement', 'awt' ) }
						value={ align }
						options={ ALIGN_OPTIONS }
						onChange={ ( v ) => setAttributes( { align: v } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<span { ...blockProps }>
				{ label && (
					<RichText
						tagName="span"
						className="cds--toggletip-label"
						value={ label }
						onChange={ ( v ) => setAttributes( { label: v } ) }
						allowedFormats={ [] }
					/>
				) }
				<button
					type="button"
					className="cds--toggletip-button"
					aria-label={ ariaLabel }
					onClick={ ( e ) => e.preventDefault() }
					style={ {
						background: 'transparent',
						border: 0,
						padding: '0.25rem',
						minBlockSize: '1.5rem',
						minInlineSize: '1.5rem',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
					} }
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						width="16"
						height="16"
						fill="currentColor"
						aria-hidden="true"
						focusable="false"
					>
						<path d="M8.5 11V6.5h-2v1h1V11H6v1h4v-1zM8 3.5A.75.75 0 108.75 4.25.75.75 0 008 3.5z" />
						<path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0-13a6 6 0 100 12A6 6 0 008 2z" />
					</svg>
				</button>
			</span>
		</>
	);
}
