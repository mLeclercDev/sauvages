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

/**
 * Récupère la miniature générée par Vimeo via leur API oEmbed publique
 * (pas de clé requise). Sert de fallback automatique quand aucune image
 * n'est fournie manuellement dans Strapi.
 */
export async function getVimeoThumbnail(
  vimeoId: string,
  vimeoHash?: string
): Promise<string | null> {
  try {
    const videoUrl = vimeoHash
      ? `https://vimeo.com/${vimeoId}/${vimeoHash}`
      : `https://vimeo.com/${vimeoId}`;
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const url: string | undefined = data?.thumbnail_url;
    if (!url) return null;
    // oEmbed renvoie du 295x166 par défaut. "-d_1920" (largeur seule) donne
    // la meilleure qualité en gardant le ratio d'origine (verticales incluses),
    // next/image se charge ensuite de redimensionner à la taille affichée.
    return url.replace(/-d_\d+(x\d+)?/, "-d_1920");
  } catch {
    return null;
  }
}
