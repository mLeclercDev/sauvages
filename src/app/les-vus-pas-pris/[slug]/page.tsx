interface PageProps {
  params: Promise<{ slug: string }>;
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
