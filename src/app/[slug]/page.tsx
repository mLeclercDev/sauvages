import { fetchAPI } from "@/utils/strapi";
import { strapiBlocksToHtml, strapiBlocksToPlainText } from "@/utils/strapiRichText";
import { notFound } from "next/navigation";
import LegalPage from "@/components/sections/LegalPage/LegalPage";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const res = await fetchAPI("/pages-legales", { fields: ["slug"] });
  return (res?.data || []).map((p: any) => ({ slug: p.slug }));
}

async function getLegalPage(slug: string) {
  const response = await fetchAPI("/pages-legales", {
    filters: { slug: { $eq: slug } },
    populate: "*",
  });
  return response?.data?.[0] || null;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) return {};

  const attrs = page.attributes || page;
  return {
    title: attrs.Titre || "",
    description: strapiBlocksToPlainText(attrs.Contenu) || undefined,
  };
}

export default async function LegalPageRoute({ params }: PageProps) {
  const { slug } = await params;

  const page = await getLegalPage(slug);

  if (!page) {
    notFound();
  }

  const attrs = page.attributes || page;

  const contentHtml = strapiBlocksToHtml(attrs.Contenu);

  return <LegalPage titre={attrs.Titre || ""} contentHtml={contentHtml} />;
}
