import Link from "next/link";

// Contenu partagé par not-found.tsx (notFound() dans un segment résolu,
// ex. /blog/[slug]) et global-not-found.tsx (URL qui ne correspond à aucune
// route). Style inline volontairement : les pages not-found de l'App Router
// ne chargent jamais réellement les CSS Modules/globals.scss (elles restent
// bloquées en <link rel="preload">, bug Next.js connu) — seul le style
// inline s'affiche de façon fiable ici.
export default function NotFoundContent() {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        padding: "140px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <p
          style={{
            color: "#5e5e5e",
            fontFamily: "var(--font-monument-normal), sans-serif",
            fontSize: 14,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            margin: "0 0 16px",
          }}
        >
          Erreur 404
        </p>
        <h1
          style={{
            fontFamily: "var(--font-monument-black), sans-serif",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: 800,
            lineHeight: 0.95,
            textTransform: "uppercase",
            color: "#060606",
            margin: "0 0 24px",
          }}
        >
          Cette page s&apos;est perdue.
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.5,
            color: "#5e5e5e",
            maxWidth: 480,
            margin: "0 0 40px",
          }}
        >
          La page que vous cherchez n&apos;existe pas ou plus.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "16px 28px",
            borderRadius: 9999,
            border: "1px solid #060606",
            color: "#060606",
            fontFamily: "var(--font-monument-normal), sans-serif",
            fontSize: 14,
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
