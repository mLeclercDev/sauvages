import { fetchAPI, getStrapiMedia } from "@/utils/strapi";
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

const renderChild = (child: any): string => {
  let text = child.text || "";
  if (!text) return "";
  if (child.bold) text = `<strong>${text}</strong>`;
  if (child.italic) text = `<em>${text}</em>`;
  if (child.underline) text = `<u>${text}</u>`;
  if (child.strikethrough) text = `<s>${text}</s>`;
  if (child.code) text = `<code>${text}</code>`;
  return text;
};

const renderBlock = (block: any): string => {
  switch (block.type) {
    case "paragraph": {
      const inner = block.children?.map(renderChild).join("") || "";
      return inner ? `<p>${inner}</p>` : "";
    }
    case "heading": {
      const level = block.level || 2;
      const inner = block.children?.map(renderChild).join("") || "";
      return `<h${level}>${inner}</h${level}>`;
    }
    case "list": {
      const tag = block.format === "ordered" ? "ol" : "ul";
      const items =
        block.children
          ?.map((item: any) => {
            const inner = item.children?.map(renderChild).join("") || "";
            return `<li>${inner}</li>`;
          })
          .join("") || "";
      return `<${tag}>${items}</${tag}>`;
    }
    case "image": {
      const url = getStrapiMedia(block.image, undefined);
      if (!url) return "";
      const alt = block.image?.alternativeText || "";
      return `<figure><img src="${url}" alt="${alt}" /></figure>`;
    }
    case "code": {
      const inner = block.children?.map(renderChild).join("") || "";
      return `<pre><code>${inner}</code></pre>`;
    }
    default:
      return "";
  }
};

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

  const contentHtml = Array.isArray(attrs.Contenu)
    ? attrs.Contenu.map(renderBlock).join("")
    : "";

  return <LegalPage titre={attrs.Titre || ""} contentHtml={contentHtml} />;
}
