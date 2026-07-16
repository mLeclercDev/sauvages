import { fetchAPI } from "@/utils/strapi";

export const revalidate = 60;

import { notFound } from "next/navigation";
import ExpertiseHeroSingle from "@/components/sections/Expertises/ExpertiseHeroSingle";
import ExpertiseDetailsSingle from "@/components/sections/Expertises/ExpertiseDetailsSingle";
import RecentProjects from "@/components/sections/Projects/RecentProjects";
import TitreTexte from "@/components/sections/TitreTexte/TitreTexte";
import TexteImage from "@/components/sections/TexteImage/TexteImage";

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
  const heroBlock = contenu.find(
    (block: any) => block.__component === "expertise.hero-section-single"
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

  return (
    <main>
      <ExpertiseHeroSingle data={heroBlock} />
      <TitreTexte data={titreTexteBlock} />
      <TexteImage data={texteImageBlock} />
      <ExpertiseDetailsSingle data={detailBlock} />
      <RecentProjects limit={4} />
    </main>
  );
}
