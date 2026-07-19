import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import metadata from './block.json';
import Edit from './edit';

// Parent block with inner blocks. save() emits <InnerBlocks.Content /> so the
// child nav-item markup is preserved between the parent's comments on
// serialization; the front-end render runs via render.php.
registerBlockType( metadata.name, {
	edit: Edit,
	save: () => <InnerBlocks.Content />,
	deprecated: [],
} );
