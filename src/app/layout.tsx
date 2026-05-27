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
import { getFooterData } from "@/services/footer";
import { getHeaderData } from "@/services/header";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [footerData, headerData] = await Promise.all([
    getFooterData(),
    getHeaderData(),
  ]);

  return (
    <html
      lang="fr"
      className={`${monumentNormal.variable} ${monumentWide.variable} ${monumentBlack.variable}`}
    >
      <head dangerouslySetInnerHTML={{ __html: `<script src="/scripts/preloader-init.js"></script>` }} />
      <body>
        <TransitionProvider>
          <Preloader />
          <PageTransition />
          <SmoothScroll>
            <Header data={headerData} />
            <div data-page-content>
              {children}
            </div>
            <Footer data={footerData} />
          </SmoothScroll>
        </TransitionProvider>
      </body>
    </html>
  );
}
