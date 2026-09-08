import { fetchAPI, getStrapiMedia } from "@/utils/strapi";
import { strapiBlocksToHtml } from "@/utils/strapiRichText";

export const revalidate = 60;

import BlogArticle from "@/components/sections/Blog/BlogArticle";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  // Récupération de l'article par son documentId (puisqu'on l'utilise comme slug dans le listing)
  // On tente de filtrer par slug d'abord, puis par documentId si rien n'est trouvé
  const response = await fetchAPI("/articles", {
    filters: {
      documentId: slug,
    },
    populate: "*",
  }, {});

  const articleWrap = response?.data?.[0];
  
  if (!articleWrap) {
    notFound();
  }

  const attrs = articleWrap.attributes || articleWrap;

  const contentHtml = strapiBlocksToHtml(attrs.Contenu, (image) =>
    getStrapiMedia(image, undefined)
  );

  // Calcul du temps de lecture (200 mots/min, minimum 1 minute)
  const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  let totalWords = 0;
  if (attrs.Titre) totalWords += countWords(attrs.Titre);
  if (attrs.soustitre) totalWords += countWords(attrs.soustitre);
  if (Array.isArray(attrs.Contenu)) {
    attrs.Contenu.forEach((block: any) => {
      if (block.children) {
        block.children.forEach((c: any) => {
          if (c.text) totalWords += countWords(c.text);
        });
      }
    });
  }
  const readingMinutes = Math.max(1, Math.ceil(totalWords / 200));
  const readTime = `${readingMinutes} minute${readingMinutes > 1 ? "s" : ""} de lecture`;

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main>
      <BlogArticle
        title={attrs.Titre || attrs.title}
        date={formatDate(attrs.DatePublication ?? attrs.createdAt)}
        readTime={readTime}
        heroImage={getStrapiMedia(attrs.Image || attrs.image, undefined) || ""}
        intro={attrs.soustitre || ""}
        contentHtml={contentHtml}
      />
    </main>
  );
}
