import { fetchAPI } from "@/utils/strapi";

export async function getFooterData() {
  const response = await fetchAPI(
    "/footer",
    {
      populate: {
        Titre: { populate: "*" },
        Bouton: { populate: { Icone: { populate: "*" } } },
        Item: { populate: { Item: { populate: "*" } } },
        Lien: { populate: "*" },
      },
    },
    {
      next: { revalidate: 60 }, // Cache dynamic footer for 60 seconds
    }
  );

  return response?.data || null;
}
