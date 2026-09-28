import type { MetadataRoute } from "next";
import { fetchAPI } from "@/utils/strapi";
import { SITE_URL } from "@/utils/site";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Entry = any;

/** Même dérivation de slug que `expertises/[slug]/page.tsx`, pour lister des
 * URLs canoniques qui correspondent exactement à ce que la route résout. */
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const toDate = (value?: string) => (value ? new Date(value) : undefined);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1, changeFrequency: "monthly" as const },
    { path: "/agence", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/manifeste", priority: 0.6, changeFrequency: "yearly" as const },
    { path: "/work", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/work/vus-pas-pris", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/work/archives", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/expertises", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "yearly" as const },
    { path: "/contact/j-ai-un-projet", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/contact/rejoindre-lequipe", priority: 0.5, changeFrequency: "yearly" as const },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const [projectsRes, articlesRes, expertisesRes, legalPagesRes] = await Promise.all([
    fetchAPI(
      "/projets",
      { fields: ["slug", "updatedAt"], pagination: { limit: 200 } },
      { next: { revalidate: 3600 } }
    ).catch(() => null),
    // Pas de champ `slug` sur ce content-type Strapi : les URLs de blog sont
    // construites à partir du `documentId` (cf. src/app/blog/page.tsx).
    fetchAPI(
      "/articles",
      { fields: ["updatedAt"], pagination: { limit: 200 }, status: "published" },
      { next: { revalidate: 3600 } }
    ).catch(() => null),
    fetchAPI(
      "/expertises",
      {
        populate: { Contenu: { on: { "global.text-reveal": { fields: ["Label"] } } } },
      },
      { next: { revalidate: 3600 } }
    ).catch(() => null),
    fetchAPI(
      "/pages-legales",
      { fields: ["slug", "updatedAt"] },
      { next: { revalidate: 3600 } }
    ).catch(() => null),
  ]);

  const projectRoutes: MetadataRoute.Sitemap = (projectsRes?.data || [])
    .map((entry: Entry) => {
      const attrs = entry.attributes || entry;
      const slug = attrs.slug;
      if (!slug) return null;
      return {
        url: `${SITE_URL}/work/${slug}`,
        lastModified: toDate(attrs.updatedAt) || now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  const articleRoutes: MetadataRoute.Sitemap = (articlesRes?.data || [])
    .map((entry: Entry) => {
      const attrs = entry.attributes || entry;
      const slug = attrs.slug || entry.documentId;
      if (!slug) return null;
      return {
        url: `${SITE_URL}/blog/${slug}`,
        lastModified: toDate(attrs.updatedAt) || now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  const expertiseRoutes: MetadataRoute.Sitemap = (expertisesRes?.data || [])
    .map((entry: Entry) => {
      const attrs = entry.attributes || entry;
      const contenu = Array.isArray(attrs?.Contenu) ? attrs.Contenu : [];
      const textReveal = contenu.find(
        (block: Entry) => block.__component === "global.text-reveal"
      );
      const slug = slugify(textReveal?.Label || "") || entry.documentId;
      if (!slug) return null;
      return {
        url: `${SITE_URL}/expertises/${slug}`,
        lastModified: toDate(attrs.updatedAt) || now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  const legalRoutes: MetadataRoute.Sitemap = (legalPagesRes?.data || [])
    .map((entry: Entry) => {
      const attrs = entry.attributes || entry;
      const slug = attrs.slug;
      if (!slug) return null;
      return {
        url: `${SITE_URL}/${slug}`,
        lastModified: toDate(attrs.updatedAt) || now,
        changeFrequency: "yearly" as const,
        priority: 0.3,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  return [
    ...staticRoutes,
    ...projectRoutes,
    ...articleRoutes,
    ...expertiseRoutes,
    ...legalRoutes,
  ];
}
