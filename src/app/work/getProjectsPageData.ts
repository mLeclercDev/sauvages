import { fetchAPI } from "@/utils/strapi";

export async function getProjectsPageData() {
  let projects: any[] = [];
  let titreTexteData = null;
  let texteImageData = null;
  let pageTitle: string | null = null;

  try {
    const [projectsData, workData] = await Promise.all([
      fetchAPI("/projets", {
        populate: {
          client: { populate: "*" },
          thumbnail: { populate: "*" },
          thumbnailFallback: { populate: "*" },
          expertise: { populate: "*" },
        },
        sort: ["rank:desc"],
        pagination: { limit: 200 },
      }),
      fetchAPI("/work", { populate: "deep" }),
    ]);

    projects = projectsData?.data || [];

    const workAttrs = workData?.data?.attributes || workData?.data || {};
    const contenu = workAttrs.Contenu || [];
    titreTexteData = contenu.find((m: any) => m.__component === "global.titre-texte");
    texteImageData = contenu.find((m: any) => m.__component === "global.texte-image");
    pageTitle = workAttrs.Titre || null;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  }

  return { projects, titreTexteData, texteImageData, pageTitle };
}
