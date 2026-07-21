import { NextRequest, NextResponse } from "next/server";

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

    // TODO: envoyer un email ou enregistrer en base ici
    console.log("[Contact] Nouvelle soumission:", formData);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
