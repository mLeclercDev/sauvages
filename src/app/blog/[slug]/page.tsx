import { fetchAPI, getStrapiMedia } from "@/utils/strapi";

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

  // Transformation du champ "Contenu" (blocs Strapi) en "sections" pour BlogArticle
  // On va grouper les blocs de texte et isoler les images
  const sections: any[] = [];
  let currentId = 0;

  if (Array.isArray(attrs.Contenu)) {
    attrs.Contenu.forEach((block: any) => {
      if (block.type === "heading") {
        const text = block.children?.map((c: any) => c.text).join("") || "";
        sections.push({
          id: ++currentId,
          title: text,
          description: "",
        });
      } else if (block.type === "paragraph") {
        const text = block.children?.map((c: any) => c.text).join("") || "";
        // On l'ajoute à la dernière section si elle n'a pas encore de texte, sinon on en crée une
        if (sections.length > 0 && !sections[sections.length - 1].image && !sections[sections.length - 1].description) {
          sections[sections.length - 1].description = `<p>${text}</p>`;
        } else if (sections.length > 0 && !sections[sections.length - 1].image) {
          sections[sections.length - 1].description += `<p>${text}</p>`;
        } else {
          sections.push({
            id: ++currentId,
            description: `<p>${text}</p>`,
          });
        }
      } else if (block.type === "image") {
        sections.push({
          id: ++currentId,
          description: "",
          image: getStrapiMedia(block.image, undefined),
        });
      }
    });
  }

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
        date={formatDate(attrs.publishedAt)}
        readTime={attrs.readTime || ""}
        heroImage={getStrapiMedia(attrs.Image || attrs.image, undefined) || ""}
        intro={attrs.soustitre || ""}
        sections={sections}
      />
    </main>
  );
}
