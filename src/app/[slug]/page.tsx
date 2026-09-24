import { fetchAPI } from "@/utils/strapi";
import { strapiBlocksToHtml } from "@/utils/strapiRichText";
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

export default async function LegalPageRoute({ params }: PageProps) {
  const { slug } = await params;

  const response = await fetchAPI("/pages-legales", {
    filters: { slug: { $eq: slug } },
    populate: "*",
  });

  const page = response?.data?.[0];

  if (!page) {
    notFound();
  }

  const attrs = page.attributes || page;

  const contentHtml = strapiBlocksToHtml(attrs.Contenu);

  return <LegalPage titre={attrs.Titre || ""} contentHtml={contentHtml} />;
}
