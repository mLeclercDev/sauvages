import { fetchAPI } from "@/utils/strapi";

export const revalidate = 60;

import { notFound } from "next/navigation";
import Intro from "@/components/sections/Intro/Intro";
import ExpertiseDetailsSingle from "@/components/sections/Expertises/ExpertiseDetailsSingle";
import RecentProjects from "@/components/sections/Projects/RecentProjects";
import TitreTexte from "@/components/sections/TitreTexte/TitreTexte";
import TexteImage from "@/components/sections/TexteImage/TexteImage";
import FullWidthImage from "@/components/sections/FullWidthImage/FullWidthImage";
import TextRevealSection from "@/components/sections/TextRevealSection/TextRevealSection";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default async function ExpertisePage({ params }: PageProps) {
  const { slug } = await params;

  const response = await fetchAPI(
    "/expertises",
    {
      populate: {
        Contenu: {
          populate: "*",
        },
      },
    },
    {}
  );

  const entries = Array.isArray(response?.data) ? response.data : [];

  const matchedEntry = entries.find((entry: any) => {
    const attrs = entry?.attributes || entry;
    const contenu = Array.isArray(attrs?.Contenu) ? attrs.Contenu : [];
    const heroBlock = contenu.find(
      (block: any) => block.__component === "expertise.hero-section-single"
    );
    const titleSlug = slugify(heroBlock?.Titre || "");

    return entry?.documentId === slug || attrs?.documentId === slug || titleSlug === slug;
  });

  if (!matchedEntry) {
    notFound();
  }

  const attrs = matchedEntry.attributes || matchedEntry;
  const contenu = Array.isArray(attrs?.Contenu) ? attrs.Contenu : [];
  const introBlock = contenu.find(
    (block: any) => block.__component === "homepage.intro"
  );
  const detailBlock = contenu.find(
    (block: any) => block.__component === "expertise.expertise-description-single"
  );
  const titreTexteBlock = contenu.find(
    (block: any) => block.__component === "global.titre-texte"
  );
  const texteImageBlock = contenu.find(
    (block: any) => block.__component === "global.texte-image"
  );
  const fullWidthImageBlock = contenu.find(
    (block: any) => block.__component === "global.full-width-image"
  );
  const textRevealBlock = contenu.find(
    (block: any) => block.__component === "global.text-reveal"
  );

  return (
    <main>
      <TextRevealSection data={textRevealBlock} />
      <FullWidthImage data={fullWidthImageBlock} />
      <TitreTexte data={titreTexteBlock} />
      <TexteImage data={texteImageBlock} />
      <RecentProjects limit={4} />
    </main>
  );
}
