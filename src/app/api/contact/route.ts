import { NextRequest, NextResponse } from "next/server";
import { getContactData, submitContact, MessageReponse } from "@/services/contact";
import { StrapiSource } from "@/utils/strapi";

// Permet de cibler explicitement le Strapi local pour tester la soumission
// du formulaire sans changer NEXT_PUBLIC_STRAPI_SOURCE (qui piloterait aussi
// tout le reste du site, contenu des pages compris). Non défini par défaut :
// suit alors le même Strapi que le reste de l'app.
const CONTACT_STRAPI_SOURCE = process.env.CONTACT_STRAPI_SOURCE as
  | StrapiSource
  | undefined;

// Rate limiting in-memory (reset au redémarrage du serveur)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS) return false;

  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── Honeypot : si le champ est rempli c'est un bot ──────────────────────
    if (body._honeypot) {
      // On répond 200 pour ne pas alerter le bot
      return NextResponse.json({ ok: true });
    }

    // ── Timing : soumission trop rapide (< 3s) = bot ─────────────────────────
    const elapsed = Date.now() - (body._timestamp ?? 0);
    if (elapsed < 3000) {
      return NextResponse.json({ ok: true });
    }

    // ── Rate limiting ─────────────────────────────────────────────────────────
    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: "Trop de tentatives. Réessaie dans 15 minutes." },
        { status: 429 }
      );
    }

    // ── Traitement du formulaire ──────────────────────────────────────────────
    // Les données nettoyées (sans champs de protection)
    const { _honeypot: _h, _timestamp: _t, ...formData } = body;

    const formulaire = formData.form === "candidature" ? "candidature" : "projet";
    const fields: Record<string, string> = formData.fields || {};
    const chips: string[] = Array.isArray(formData.chips) ? formData.chips : [];

    // Les libellés/types des champs ne sont connus que via le schéma Strapi
    // (le formulaire est piloté par le CMS, les clés soumises sont des ids
    // opaques `field_<id>`), donc on le recharge ici pour reconstituer des
    // réponses lisibles.
    const contactData = await getContactData();
    const formIndex = formulaire === "candidature" ? 1 : 0;
    const champs = contactData?.Formulaires?.[formIndex]?.Champs || [];

    const reponses: MessageReponse[] = champs
      .filter((champ) => champ.Type !== "fichier")
      .map((champ) => {
        const key = `field_${champ.id}`;
        const value =
          champ.Type === "select" ? chips.join(", ") : fields[key] || "";
        return { label: champ.Intitule, type: champ.Type, value };
      })
      .filter((reponse) => reponse.value !== "");

    const sent = await submitContact(
      {
        formulaire,
        reponses,
        chips,
        acceptTerms: fields.acceptTerms === "true",
        acceptCommunications: fields.acceptCommunications === "true",
      },
      CONTACT_STRAPI_SOURCE
    );

    if (!sent) {
      return NextResponse.json(
        { ok: false, error: "Erreur lors de l'envoi. Réessaie plus tard." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
