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
	ToggleControl,
} from '@wordpress/components';
import IconPicker, { iconPreviewUrl } from '../shared/icon-picker';

export default function Edit( { attributes, setAttributes } ) {
	const { text, href, iconName, isCurrent, matchMode } = attributes;
	const blockProps = useBlockProps( { className: 'cds--side-nav__item' } );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Side nav link', 'awt' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'Link target (href)', 'awt' ) }
						value={ href }
						onChange={ ( value ) =>
							setAttributes( { href: value } )
						}
					/>
					<IconPicker
						label={ __( 'Icon', 'awt' ) }
						value={ iconName }
						onChange={ ( value ) =>
							setAttributes( { iconName: value } )
						}
					/>
					<SelectControl
						label={ __( 'Current-URL match mode', 'awt' ) }
						value={ matchMode }
						options={ [
							{ value: 'exact', label: __( 'Exact', 'awt' ) },
							{ value: 'prefix', label: __( 'Prefix', 'awt' ) },
						] }
						onChange={ ( value ) =>
							setAttributes( { matchMode: value } )
						}
					/>
					<ToggleControl
						label={ __( 'Force aria-current="page"', 'awt' ) }
						checked={ isCurrent }
						onChange={ ( value ) =>
							setAttributes( { isCurrent: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<li { ...blockProps }>
				<a
					className="cds--side-nav__link"
					href={ href || '#' }
					onClick={ ( e ) => e.preventDefault() }
				>
					{ /* Mirror render.php which inlines the actual Carbon SVG via the
					     icon() helper. We can't inline-SVG from JS without the manifest
					     so we mask the size-32 raster using currentColor — same trick
					     awt/icon's edit.js uses. Spacing comes from Carbon's
					     .cds--side-nav__icon CSS (not inline). */ }
					{ iconName && (
						<span
							className="cds--side-nav__icon"
							aria-hidden="true"
						>
							<span
								style={ {
									display: 'inline-block',
									width: '1rem',
									height: '1rem',
									background: 'currentColor',
									WebkitMaskImage: `url(${ iconPreviewUrl(
										iconName,
										[ 32 ]
									) })`,
									maskImage: `url(${ iconPreviewUrl(
										iconName,
										[ 32 ]
									) })`,
									WebkitMaskRepeat: 'no-repeat',
									maskRepeat: 'no-repeat',
									WebkitMaskPosition: 'center',
									maskPosition: 'center',
									WebkitMaskSize: 'contain',
									maskSize: 'contain',
								} }
							/>
						</span>
					) }
					<RichText
						tagName="span"
						className="cds--side-nav__link-text"
						value={ text }
						onChange={ ( value ) =>
							setAttributes( { text: value } )
						}
						placeholder={ __( 'Link label', 'awt' ) }
						allowedFormats={ [] }
					/>
				</a>
			</li>
		</>
	);
}
