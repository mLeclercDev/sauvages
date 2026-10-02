import { fetchAPI, getStrapiMedia } from "@/utils/strapi";
import { strapiBlocksToHtml, strapiBlocksToPlainText } from "@/utils/strapiRichText";
import { SITE_URL } from "@/utils/site";

export const revalidate = 60;

import BlogArticle from "@/components/sections/Blog/BlogArticle";
import Breadcrumb from "@/components/sections/Breadcrumb/Breadcrumb";
import { redirectToNotFound } from "@/utils/notFound";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  const response = await fetchAPI(
    "/articles",
    { filters: { Slug: { $eq: slug } }, populate: "*" },
    {}
  );
  return response?.data?.[0] || null;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const articleWrap = await getArticle(slug);
  if (!articleWrap) return { title: "Article" };

  const attrs = articleWrap.attributes || articleWrap;
  const title = attrs.Titre || attrs.title;
  const description =
    attrs.soustitre || strapiBlocksToPlainText(attrs.Contenu) || undefined;
  const image = getStrapiMedia(attrs.Image || attrs.image, undefined);

  return {
    title,
    description,
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  // Récupération de l'article par son slug
  const articleWrap = await getArticle(slug);

  if (!articleWrap) {
    redirectToNotFound();
  }

  const attrs = articleWrap.attributes || articleWrap;

  const contentHtml = strapiBlocksToHtml(attrs.Contenu);

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

  const publishedRaw = attrs.DatePublication ?? attrs.createdAt;
  const updatedDate =
    attrs.updatedAt &&
    new Date(attrs.updatedAt).toDateString() !== new Date(publishedRaw).toDateString()
      ? formatDate(attrs.updatedAt)
      : undefined;
  const shareUrl = `${SITE_URL}/blog/${slug}`;

  return (
    <main>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: attrs.Titre || attrs.title },
        ]}
      />
      <BlogArticle
        title={attrs.Titre || attrs.title}
        date={formatDate(publishedRaw)}
        updatedDate={updatedDate}
        author={attrs.Auteur || undefined}
        readTime={readTime}
        heroImage={getStrapiMedia(attrs.Image || attrs.image, undefined) || ""}
        intro={attrs.soustitre || ""}
        contentHtml={contentHtml}
        shareUrl={shareUrl}
      />
    </main>
  );
}
