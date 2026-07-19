import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';

function Edit() {
	const blockProps = useBlockProps( {
		className: 'cds--side-nav__divider',
	} );
	return (
		<li
			{ ...blockProps }
			style={ {
				listStyle: 'none',
				borderTop: '1px solid var(--cds-border-subtle, #e0e0e0)',
				margin: '0.5rem 0',
			} }
		/>
	);
}

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => null,
	deprecated: [],
} );
