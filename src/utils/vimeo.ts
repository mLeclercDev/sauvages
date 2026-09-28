export interface VimeoField {
  id: string;
  hash?: string;
}

/**
 * Accepts a bare ID, "id/hash", or a full vimeo.com / player.vimeo.com URL
 * as pasted manually into Strapi.
 */
export function parseVimeoField(raw?: string | null): VimeoField | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
  if (urlMatch) {
    const hashFromQuery = trimmed.match(/[?&]h=([a-zA-Z0-9]+)/);
    return { id: urlMatch[1], hash: urlMatch[2] || hashFromQuery?.[1] };
  }

  const idHashMatch = trimmed.match(/^(\d+)\/([a-zA-Z0-9]+)$/);
  if (idHashMatch) return { id: idHashMatch[1], hash: idHashMatch[2] };

  const bareMatch = trimmed.match(/^(\d+)$/);
  if (bareMatch) return { id: bareMatch[1] };

  return null;
}
