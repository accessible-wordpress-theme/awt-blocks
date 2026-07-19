import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
	const { text, href, external } = attributes;
	const blockProps = useBlockProps( { className: 'cds--footer__link' } );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Footer link', 'awt' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'Link target (href)', 'awt' ) }
						value={ href }
						onChange={ ( value ) =>
							setAttributes( { href: value } )
						}
					/>
					<ToggleControl
						label={ __( 'External link', 'awt' ) }
						help={ __(
							'Adds target="_blank" rel="noopener noreferrer" and an external-link icon.',
							'awt'
						) }
						checked={ external }
						onChange={ ( value ) =>
							setAttributes( { external: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<li { ...blockProps }>
				<a
					className="cds--link"
					href={ href || '#' }
					onClick={ ( e ) => e.preventDefault() }
				>
					<RichText
						tagName="span"
						value={ text }
						onChange={ ( value ) =>
							setAttributes( { text: value } )
						}
						placeholder={ __( 'Link label', 'awt' ) }
						allowedFormats={ [] }
					/>
					{ external && <span aria-hidden="true"> ↗</span> }
				</a>
			</li>
		</>
	);
}
