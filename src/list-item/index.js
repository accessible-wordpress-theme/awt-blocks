import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';
import Edit from './edit';

// List items may contain a nested awt/list; save() returns InnerBlocks.Content
// so the child list markup persists in the saved post_content between the
// list-item's opening and closing block comments.
registerBlockType( metadata.name, {
	edit: Edit,
	save: () => <InnerBlocks.Content />,
	deprecated: [],
} );
