<?php
/**
 * Remap wp-image-<ID> classes in seeded content to the attachment IDs this
 * site actually has (media are re-imported, so IDs differ from the export).
 * With the right ID, core adds srcset/sizes/dimensions/fetchpriority to
 * content images — without it, images ship bare and LCP suffers.
 *
 * Run by seed-env.sh after the media import.
 */

$attachments = get_posts(
	array(
		'post_type'      => 'attachment',
		'posts_per_page' => -1,
	)
);
$by_basename = array();
foreach ( $attachments as $att ) {
	$file = get_attached_file( $att->ID );
	if ( $file ) {
		// Strip WP size suffixes so cropped variants match the original.
		$base = preg_replace( '/(-\d+x\d+|-scaled)(?=\.[a-z]+$)/', '', basename( $file ) );
		// Keep the FIRST (oldest-listed) match: re-imports create newer
		// duplicates whose generated size filenames don't match the files
		// the seeded markup references.
		if ( ! isset( $by_basename[ $base ] ) ) {
			$by_basename[ $base ] = $att->ID;
		}
	}
}

$content_posts = get_posts(
	array(
		'post_type'      => array( 'page', 'post', 'wp_template_part', 'wp_block' ),
		'post_status'    => 'any',
		'posts_per_page' => -1,
	)
);
$fixed         = 0;
foreach ( $content_posts as $p ) {
	$content = $p->post_content;
	$updated = preg_replace_callback(
		'/<img([^>]*?)src="([^"]+)"([^>]*?)wp-image-(\d+)/',
		static function ( $m ) use ( $by_basename ) {
			$base = preg_replace( '/(-\d+x\d+|-scaled)(?=\.[a-z]+$)/', '', basename( wp_parse_url( $m[2], PHP_URL_PATH ) ) );
			$id   = $by_basename[ $base ] ?? null;
			return $id ? "<img{$m[1]}src=\"{$m[2]}\"{$m[3]}wp-image-{$id}" : $m[0];
		},
		$content
	);
	if ( $updated !== $content ) {
		wp_update_post(
			array(
				'ID'           => $p->ID,
				'post_content' => wp_slash( $updated ),
			)
		);
		++$fixed;
	}
}
echo esc_html( "Remapped image IDs in {$fixed} posts." ), "\n";
