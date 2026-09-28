import { notFound } from "next/navigation";
import { getContactData } from "@/services/contact";
import Contact from "@/components/sections/Contact/Contact";

const KNOWN_SLUGS = ["j-ai-un-projet", "rejoindre-lequipe"];

const METADATA_BY_SLUG: Record<string, { title: string; description: string }> = {
  "j-ai-un-projet": {
    title: "J'ai un projet",
    description: "Parlez-nous de votre projet, l'agence Sauvages vous répond.",
  },
  "rejoindre-lequipe": {
    title: "Rejoindre l'équipe",
    description: "Envie de rejoindre Sauvages ? Candidatez dès maintenant.",
  },
};

export function generateStaticParams() {
  return KNOWN_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return METADATA_BY_SLUG[slug] || { title: "Contact" };
}

export default async function ContactFormSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!KNOWN_SLUGS.includes(slug)) notFound();

  const contactData = await getContactData();

  return (
    <main>
      <Contact data={contactData} />
    </main>
  );
}
