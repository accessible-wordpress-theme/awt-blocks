import './style.scss';
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';
import Edit from './edit';

registerBlockType( metadata.name, {
	edit: Edit,
	// Server-rendered (render.php walks $block->inner_blocks), but the inner
	// blocks MUST still be written to post_content so the server can see them.
	// Returning null here drops all items + panels on save → empty switcher.
	save: () => <InnerBlocks.Content />,
	deprecated: [],
} );
