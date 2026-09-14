import { notFound } from "next/navigation";
import { getContactData } from "@/services/contact";
import Contact from "@/components/sections/Contact/Contact";

const KNOWN_SLUGS = ["j-ai-un-projet", "rejoindre-lequipe"];

export function generateStaticParams() {
  return KNOWN_SLUGS.map((slug) => ({ slug }));
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
