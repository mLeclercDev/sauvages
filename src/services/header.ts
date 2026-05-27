import { fetchAPI } from "@/utils/strapi";

export async function getHeaderData() {
  const response = await fetchAPI(
    "/header",
    {
      populate: {
        Logo: { populate: "*" },
        Navigation: { populate: "*" },
        Bouton: { populate: { Icone: { populate: "*" } } },
      },
    },
    {
      next: { revalidate: 60 },
    }
  );

  return response?.data || null;
}
