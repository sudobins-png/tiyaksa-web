<?php
/**
 * Plugin Name: ТиЯКСа — Schema/FAQ REST fields
 * Description: Exposes tiyaksa_schema and tiyaksa_faq as REST-readable/writable
 *              post meta, written by the n8n content flow and read by the
 *              Next.js frontend to render JSON-LD on article pages.
 *
 * NOT synced automatically to the VPS — deploy alongside
 * wp-content/mu-plugins/rankmath-rest.php by copying this file into the
 * same mu-plugins directory on the server.
 */

add_action( 'rest_api_init', function () {
	$keys = [ 'tiyaksa_schema', 'tiyaksa_faq' ];

	foreach ( $keys as $key ) {
		register_meta( 'post', $key, [
			'show_in_rest'      => true,
			'single'            => true,
			'type'              => 'string',
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
			// Both fields hold a JSON string (JSON.stringify'd by n8n before
			// writing) — sanitize_text_field would mangle quotes/escapes, so
			// leave sanitization off, same reasoning as rankmath-rest.php's
			// unsanitized fields.
			'sanitize_callback' => null,
		] );
	}
} );
