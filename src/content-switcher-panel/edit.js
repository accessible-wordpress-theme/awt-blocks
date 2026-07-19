import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

const TEMPLATE = [
	[ 'core/paragraph', { content: 'Switcher panel content.' } ],
];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'awt-content-switcher__panel',
		style: { paddingBlockStart: '1rem' },
	} );
	const innerProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
	} );
	return <div { ...innerProps } />;
}
