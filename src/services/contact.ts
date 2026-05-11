import { fetchAPI } from "@/utils/strapi";

export interface StrapiOption {
  id: number;
  Texte: string;
}

export interface StrapiField {
  id: number;
  Type: "select" | "texte" | "mail" | "fichier" | string;
  Intitule: string;
  TexteReponse?: string;
  Email?: string;
  Option?: StrapiOption[];
  obligatoire?: boolean;
}

export interface StrapiForm {
  id: number;
  __component: "contact.formulaire";
  TitreFormulaire: string;
  Champs: StrapiField[];
}

export interface ContactData {
  id: number;
  documentId: string;
  Formulaires: StrapiForm[];
}

export async function getContactData(): Promise<ContactData | null> {
  try {
    const response = await fetchAPI(
      "/contact",
      {
        populate: {
          Formulaires: {
            on: {
              "contact.formulaire": {
                populate: {
                  Champs: {
                    populate: "*"
                  }
                }
              }
            }
          }
        }
      },
      {
        next: { revalidate: 60 },
      }
    );

    return response?.data || null;
  } catch (error) {
    console.error("Error fetching contact data:", error);
    return null;
  }
}
