import NotFoundContent from "@/components/layout/NotFoundContent/NotFoundContent";

export const metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundContent />;
}
