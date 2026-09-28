interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

export default async function LesVusPasPrisDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <main>
      <section className="container">
        <h1>Vue : {slug}</h1>
        <p>Détail à venir.</p>
      </section>
    </main>
  );
}
