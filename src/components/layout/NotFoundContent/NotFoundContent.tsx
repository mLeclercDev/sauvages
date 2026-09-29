import Button from "@/components/ui/Button/Button";

// Contenu partagé par not-found.tsx (filet de sécurité, ne devrait plus être
// atteint : les pages avec slug redirigent désormais vers global-not-found.tsx
// via @/utils/notFound au lieu d'appeler notFound(), voir ce fichier pour le
// détail du bug Next.js contourné) et global-not-found.tsx (URL réellement
// inconnue, chemin nominal). Style inline volontairement : sur le rendu de
// not-found.tsx imbriqué dans le layout, le CSS Modules/globals.scss reste
// bloqué en <link rel="preload"> et ne s'applique jamais (vérifié en dev et en
// build de prod, Next.js 16.2) — seul le style inline s'affiche de façon
// fiable dans ce cas précis.
export default function NotFoundContent() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "140px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
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
        <Button href="/" label="Retour à l'accueil" variant="outline" color="black" />
      </div>
    </main>
  );
}
