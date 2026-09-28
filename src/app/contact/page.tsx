import { getContactData } from "@/services/contact";
import Contact from "@/components/sections/Contact/Contact";

export const metadata = {
  title: "Contact",
  description: "Parlons de votre projet : contactez l'agence Sauvages.",
};

export default async function ContactPage() {
  const contactData = await getContactData();

  return (
    <main>
      <Contact data={contactData} />
    </main>
  );
}
