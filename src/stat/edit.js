import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
	const { value, heading, description, level, align } = attributes;
	const HeadingTag = level === 'none' ? 'p' : `h${ level }`;

	const blockProps = useBlockProps( {
		className: `awt-stat awt-stat--align-${ align }`,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Statistic', 'awt' ) }>
					<SelectControl
						label={ __( 'Heading level', 'awt' ) }
						help={ __(
							'The label under the number is plain text by default. Pick a heading level only when the statistic starts a new section of the page.',
							'awt'
						) }
						value={ level }
						options={ [
							{
								value: 'none',
								label: __( 'Not a heading (default)', 'awt' ),
							},
							{ value: '2', label: __( 'Heading 2', 'awt' ) },
							{ value: '3', label: __( 'Heading 3', 'awt' ) },
							{ value: '4', label: __( 'Heading 4', 'awt' ) },
							{ value: '5', label: __( 'Heading 5', 'awt' ) },
							{ value: '6', label: __( 'Heading 6', 'awt' ) },
						] }
						onChange={ ( v ) => setAttributes( { level: v } ) }
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
			</InspectorControls>
			<div { ...blockProps }>
				<RichText
					tagName="span"
					className="awt-stat__value"
					value={ value }
					onChange={ ( v ) => setAttributes( { value: v } ) }
					placeholder={ __( '90%', 'awt' ) }
					allowedFormats={ [] }
				/>
				<RichText
					tagName={ HeadingTag }
					className="awt-stat__heading"
					value={ heading }
					onChange={ ( v ) => setAttributes( { heading: v } ) }
					placeholder={ __(
						'Heading describing the statistic',
						'awt'
					) }
					allowedFormats={ [ 'core/bold', 'core/italic' ] }
				/>
				<RichText
					tagName="p"
					className="awt-stat__description"
					value={ description }
					onChange={ ( v ) => setAttributes( { description: v } ) }
					placeholder={ __(
						'Optional supporting description',
						'awt'
					) }
					allowedFormats={ [
						'core/bold',
						'core/italic',
						'core/link',
					] }
				/>
			</div>
		</>
	);
}
