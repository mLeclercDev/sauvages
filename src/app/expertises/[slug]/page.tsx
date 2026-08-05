import { fetchAPI } from "@/utils/strapi";
import styles from "./page.module.scss";

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
          on: {
            "expertise.hero-section-single": { populate: { Image: true } },
            "expertise.expertise-description-single": { populate: { Image: true } },
            "homepage.intro": { populate: { Image: true, Bouton: true } },
            "global.titre-texte": { populate: { Titre: true, Image: true } },
            "global.texte-image": { populate: { Titre: true, Image: true, Options: true } },
            "global.text-reveal": { fields: ["Texte", "Label"] },
            "global.full-width-image": { populate: { Image: true } },
            "global.projets-listing": { populate: { Titre: true } },
          },
        },
      },
    },
    {}
  );

  const entries = Array.isArray(response?.data) ? response.data : [];

  const matchedEntry = entries.find((entry: any) => {
    const attrs = entry?.attributes || entry;
    const contenu = Array.isArray(attrs?.Contenu) ? attrs.Contenu : [];
    const textReveal = contenu.find(
      (block: any) => block.__component === "global.text-reveal"
    );
    const titleSlug = slugify(textReveal?.Label || "");

    return entry?.documentId === slug || attrs?.documentId === slug || titleSlug === slug;
  });

  if (!matchedEntry) {
    notFound();
  }

  const attrs = matchedEntry.attributes || matchedEntry;
  const contenu = Array.isArray(attrs?.Contenu) ? attrs.Contenu : [];

  const projetsListingBlock = contenu.find(
    (block: any) => block.__component === "global.projets-listing"
  );

  const renderBlock = (block: any, idx: number) => {
    switch (block.__component) {
      case "global.text-reveal":
        return <TextRevealSection key={idx} data={block} pt="none" pb="none" />;
      case "global.full-width-image":
        return <FullWidthImage key={idx} data={block} />;
      case "global.titre-texte":
        return <TitreTexte key={idx} data={block} />;
      case "global.texte-image":
        return <TexteImage key={idx} data={block} />;
      case "expertise.expertise-description-single":
        return <ExpertiseDetailsSingle key={idx} data={block} />;
      default:
        return null;
    }
  };

  return (
    <main className={styles.page}>
      {contenu.map((block: any, idx: number) => renderBlock(block, idx))}
      <RecentProjects
        limit={4}
        title={projetsListingBlock?.Titre?.Texte}
      />
    </main>
  );
}
