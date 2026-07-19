import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	Button,
} from '@wordpress/components';

// Inline SVGs mirror the four mark variants from render.php so the editor
// preview shows the same opening quotation glyph the published page renders.
const MARK_SVGS = {
	'double-curved': (
		<svg
			className="awt-testimonial__mark awt-testimonial__mark--open"
			viewBox="0 0 40 32"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M14.4 0c-7.95 0-14.4 6.45-14.4 14.4v17.6h17.6v-17.6h-8.8c0-4.85 3.95-8.8 8.8-8.8v-5.6zm22.4 0c-7.95 0-14.4 6.45-14.4 14.4v17.6h17.6v-17.6h-8.8c0-4.85 3.95-8.8 8.8-8.8v-5.6z"
				fill="currentColor"
			/>
		</svg>
	),
	'double-straight': (
		<svg
			className="awt-testimonial__mark awt-testimonial__mark--open"
			viewBox="0 0 40 32"
			aria-hidden="true"
			focusable="false"
		>
			<rect x="2" y="2" width="14" height="20" fill="currentColor" />
			<rect x="24" y="2" width="14" height="20" fill="currentColor" />
		</svg>
	),
	'single-curved': (
		<svg
			className="awt-testimonial__mark awt-testimonial__mark--open"
			viewBox="0 0 20 32"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M14.4 0c-7.95 0-14.4 6.45-14.4 14.4v17.6h17.6v-17.6h-8.8c0-4.85 3.95-8.8 8.8-8.8v-5.6z"
				fill="currentColor"
			/>
		</svg>
	),
};

export default function Edit( { attributes, setAttributes } ) {
	const {
		quote,
		authorName,
		authorRole,
		authorOrg,
		authorAvatarUrl,
		authorAvatarAlt,
		markStyle,
		quoteSize,
		attributionStyle,
		kind,
		align,
	} = attributes;

	const blockProps = useBlockProps( {
		className: `awt-testimonial awt-testimonial--${ kind } awt-testimonial--${ quoteSize } awt-testimonial--align-${ align } awt-testimonial--mark-${ markStyle }`,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Testimonial', 'awt' ) }>
					<SelectControl
						label={ __( 'Quote size', 'awt' ) }
						value={ quoteSize }
						options={ [
							{
								value: 'md',
								label: __( 'Medium (24px)', 'awt' ),
							},
							{
								value: 'lg',
								label: __( 'Large (36px — default)', 'awt' ),
							},
							{
								value: 'xl',
								label: __( 'Extra large (48px)', 'awt' ),
							},
						] }
						onChange={ ( v ) => setAttributes( { quoteSize: v } ) }
					/>
					<SelectControl
						label={ __( 'Mark style', 'awt' ) }
						help={ __(
							'Quotation glyph style at the open of the quote.',
							'awt'
						) }
						value={ markStyle }
						options={ [
							{
								value: 'double-curved',
								label: __(
									'Double curly “ ” (default)',
									'awt'
								),
							},
							{
								value: 'double-straight',
								label: __( 'Double straight " "', 'awt' ),
							},
							{
								value: 'single-curved',
								label: __( 'Single curly ‘ ’', 'awt' ),
							},
							{ value: 'none', label: __( 'None', 'awt' ) },
						] }
						onChange={ ( v ) => setAttributes( { markStyle: v } ) }
					/>
					<SelectControl
						label={ __( 'Kind', 'awt' ) }
						value={ kind }
						options={ [
							{
								value: 'plain',
								label: __( 'Plain (no background)', 'awt' ),
							},
							{
								value: 'card',
								label: __(
									'Card (layer-01 background)',
									'awt'
								),
							},
						] }
						onChange={ ( v ) => setAttributes( { kind: v } ) }
					/>
					<SelectControl
						label={ __( 'Attribution layout', 'awt' ) }
						value={ attributionStyle }
						options={ [
							{
								value: 'stacked',
								label: __(
									'Stacked (name / role / org on separate lines)',
									'awt'
								),
							},
							{
								value: 'inline',
								label: __(
									'Inline (name · role · org)',
									'awt'
								),
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { attributionStyle: v } )
						}
					/>
					<SelectControl
						label={ __( 'Alignment', 'awt' ) }
						value={ align }
						options={ [
							{ value: 'start', label: __( 'Start', 'awt' ) },
							{ value: 'center', label: __( 'Center', 'awt' ) },
						] }
						onChange={ ( v ) => setAttributes( { align: v } ) }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Author avatar', 'awt' ) }
					initialOpen={ false }
				>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( m ) =>
								setAttributes( {
									authorAvatarUrl: m.url,
									authorAvatarAlt:
										authorAvatarAlt || m.alt || '',
								} )
							}
							allowedTypes={ [ 'image' ] }
							render={ ( { open } ) => (
								<Button variant="secondary" onClick={ open }>
									{ authorAvatarUrl
										? __( 'Replace avatar', 'awt' )
										: __( 'Upload avatar', 'awt' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>
					{ authorAvatarUrl && (
						<>
							<TextControl
								label={ __( 'Avatar alt text', 'awt' ) }
								help={ __(
									'Required when an avatar is set. The linter flags missing alt as an Error.',
									'awt'
								) }
								value={ authorAvatarAlt }
								onChange={ ( v ) =>
									setAttributes( { authorAvatarAlt: v } )
								}
							/>
							<Button
								variant="link"
								onClick={ () =>
									setAttributes( {
										authorAvatarUrl: '',
										authorAvatarAlt: '',
									} )
								}
							>
								{ __( 'Remove avatar', 'awt' ) }
							</Button>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<figure { ...blockProps }>
				{ MARK_SVGS[ markStyle ] || null }
				<RichText
					tagName="blockquote"
					className="awt-testimonial__quote"
					value={ quote }
					onChange={ ( v ) => setAttributes( { quote: v } ) }
					placeholder={ __(
						'Quote body — renders in IBM Plex Serif',
						'awt'
					) }
					allowedFormats={ [ 'core/bold', 'core/italic' ] }
				/>
				<figcaption className="awt-testimonial__source">
					{ authorAvatarUrl && (
						<img
							className="awt-testimonial__avatar"
							src={ authorAvatarUrl }
							alt={ authorAvatarAlt }
						/>
					) }
					<div className="awt-testimonial__source-details">
						<RichText
							tagName="div"
							className="awt-testimonial__source-name"
							value={ authorName }
							onChange={ ( v ) =>
								setAttributes( { authorName: v } )
							}
							placeholder={ __( 'Author name', 'awt' ) }
							allowedFormats={ [] }
						/>
						<RichText
							tagName="div"
							className="awt-testimonial__source-role"
							value={ authorRole }
							onChange={ ( v ) =>
								setAttributes( { authorRole: v } )
							}
							placeholder={ __( 'Role', 'awt' ) }
							allowedFormats={ [] }
						/>
						<RichText
							tagName="div"
							className="awt-testimonial__source-org"
							value={ authorOrg }
							onChange={ ( v ) =>
								setAttributes( { authorOrg: v } )
							}
							placeholder={ __( 'Organization', 'awt' ) }
							allowedFormats={ [] }
						/>
					</div>
				</figcaption>
			</figure>
		</>
	);
}
