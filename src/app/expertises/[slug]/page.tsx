import { fetchAPI } from "@/utils/strapi";
import { notFound } from "next/navigation";
import ExpertiseHeroSingle from "@/components/sections/Expertises/ExpertiseHeroSingle";
import ExpertiseDetailsSingle from "@/components/sections/Expertises/ExpertiseDetailsSingle";

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
    {},
    "local"
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

  return (
    <main>
      <ExpertiseHeroSingle data={heroBlock} />
      <ExpertiseDetailsSingle data={detailBlock} />
    </main>
  );
}
