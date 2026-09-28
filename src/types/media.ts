export interface StrapiVimeoMedia {
  /** Raw Strapi text field: bare ID, "id/hash", or a full vimeo.com URL */
  vimeoUrl?: string | null;
  /** Existing Strapi image field, reused as poster until the iframe is ready */
  fallbackImage?: any;
}
