import { getContactData } from "@/services/contact";
import Contact from "@/components/sections/Contact/Contact";

export default async function ContactPage() {
  const contactData = await getContactData();

  return (
    <main>
      <Contact data={contactData} />
    </main>
  );
}
