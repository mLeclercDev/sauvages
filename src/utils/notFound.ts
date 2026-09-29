import { redirect } from "next/navigation";

// URL volontairement inexistante dans app/ (2 segments, ne matche aucune route
// dynamique comme /[slug] ou /blog/[slug]). On y redirige plutôt que d'appeler
// notFound() directement : le not-found.tsx imbriqué dans le layout charge le
// CSS de façon non fiable (bug Next.js 16.2 sur le rendu du not-found de segment),
// alors que global-not-found.tsx, déclenché pour une URL réellement inconnue,
// charge son CSS correctement.
const NOT_FOUND_PATH = "/404/page-introuvable";

export function redirectToNotFound(): never {
  redirect(NOT_FOUND_PATH);
}
