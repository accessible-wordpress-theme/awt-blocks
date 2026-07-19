/**
 * FAQ-item view-side bootstrap.
 *
 * awt/faq-item renders accordion-item HTML and points its data-wp-interactive
 * at the existing `awt/accordion-item` store. We re-import that store here so
 * pages containing FAQ items (but no accordion-items) still load the toggle
 * logic.
 *
 * The accordion-item store registers itself by side-effect when the module
 * runs; this import is enough.
 */

import '../accordion-item/view.js';
