import type { Metadata } from "next";
import { monumentNormal, monumentWide, monumentBlack } from "./fonts";
import "../styles/globals.scss";

export const metadata: Metadata = {
  title: "Sauvages",
  description: "Agence créative Sauvages",
};

import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SmoothScroll from "@/components/layout/SmoothScroll/SmoothScroll";
import PageTransition from "@/components/layout/PageTransition/PageTransition";
import Preloader from "@/components/layout/Preloader/Preloader";
import { TransitionProvider } from "@/context/TransitionContext";
import { ContactPanelProvider } from "@/context/ContactPanelContext";
import ContactFormPanel from "@/components/sections/ContactFormPanel/ContactFormPanel";
import { getFooterData } from "@/services/footer";
import { getHeaderData } from "@/services/header";
import { getContactData } from "@/services/contact";
import { fetchAPI } from "@/utils/strapi";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [footerData, headerData, contactData, legalPagesData] = await Promise.all([
    getFooterData(),
    getHeaderData(),
    getContactData(),
    fetchAPI("/pages-legales", { fields: ["slug", "Titre"] }).catch(() => null),
  ]);

  const legalPages = (legalPagesData?.data || []).map((p: any) => ({
    slug: p.slug,
    titre: p.Titre || p.attributes?.Titre || "",
  }));

  return (
    <html
      lang="fr"
      className={`${monumentNormal.variable} ${monumentWide.variable} ${monumentBlack.variable}`}
    >
      <head dangerouslySetInnerHTML={{ __html: `<script src="/scripts/preloader-init.js"></script>` }} />
      <body>
        <TransitionProvider>
          <ContactPanelProvider>
            <Preloader />
            <PageTransition />
            <SmoothScroll>
              <Header data={headerData} />
              <div data-page-content>
                {children}
              </div>
              <Footer data={footerData} legalPages={legalPages} />
            </SmoothScroll>
            <ContactFormPanel data={contactData} />
          </ContactPanelProvider>
        </TransitionProvider>
      </body>
    </html>
  );
}
