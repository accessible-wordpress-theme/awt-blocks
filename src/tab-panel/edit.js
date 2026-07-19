import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

const TEMPLATE = [ [ 'core/paragraph', { content: 'Tab panel content.' } ] ];

export default function Edit() {
	// Merge blockProps into useInnerBlocksProps so the `cds--tab-content` class
	// survives — the previous `{...blockProps} {...innerProps}` spread dropped
	// it. `borderBlockStart` was using a logical longhand inline; switching to
	// the shorthand `border-top` keeps the same visual.
	const blockProps = useBlockProps( {
		className: 'cds--tab-content',
		style: {
			padding: '1rem 0',
			borderTop: '1px solid var(--cds-border-subtle, #e0e0e0)',
		},
	} );
	const innerProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
	} );
	return <div { ...innerProps } />;
}
