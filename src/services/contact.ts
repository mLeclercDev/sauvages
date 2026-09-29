import { fetchAPI, StrapiSource } from "@/utils/strapi";

export interface StrapiOption {
  id: number;
  Texte: string;
}

export interface StrapiField {
  id: number;
  Type: "select" | "texte" | "mail" | "fichier" | "textarea" | string;
  Intitule: string;
  TexteReponse?: string;
  Email?: string;
  Option?: StrapiOption[];
  Obligatoire?: boolean;
}

export interface StrapiForm {
  id: number;
  __component: "contact.formulaire";
  TitreFormulaire: string;
  Accroche?: string;
  Icone?: StrapiMedia;
  Champs: StrapiField[];
}

export interface StrapiMedia {
  id: number;
  url: string;
  mime?: string;
  width?: number;
  height?: number;
  alternativeText?: string | null;
}

export interface HeroContact {
  id: number;
  Titre?: string;
  Description?: Array<{ type: string; children: Array<{ type: string; text: string }> }>;
  TexteBouton1?: string;
  TexteBouton2?: string;
  LienCalendrier?: string;
  Image?: StrapiMedia;
  IconBouton1?: StrapiMedia;
  IconBouton2?: StrapiMedia;
}

export interface ContactData {
  id: number;
  documentId: string;
  HeroContact?: HeroContact;
  Formulaires: StrapiForm[];
}

export interface MessageReponse {
  label: string;
  type: string;
  value: string;
}

export interface SubmitContactPayload {
  formulaire: "projet" | "candidature";
  reponses: MessageReponse[];
  chips: string[];
  acceptTerms: boolean;
  acceptCommunications: boolean;
}

export async function submitContact(
  payload: SubmitContactPayload,
  source?: StrapiSource
): Promise<boolean> {
  const response = await fetchAPI(
    "/messages",
    {},
    {
      method: "POST",
      body: JSON.stringify({ data: payload }),
    },
    source
  );

  return response !== null;
}

export async function getContactData(source?: StrapiSource): Promise<ContactData | null> {
  try {
    const response = await fetchAPI(
      "/contact",
      {
        populate: {
          HeroContact: {
            populate: { Image: { populate: "*" }, IconBouton1: { populate: "*" }, IconBouton2: { populate: "*" } },
          },
          Formulaires: {
            on: {
              "contact.formulaire": {
                populate: { Champs: { populate: "*" }, Icone: true },
              },
            },
          },
        },
      },
      { next: { revalidate: 60 } },
      source
    );

    return response?.data || null;
  } catch (error) {
    console.error("Error fetching contact data:", error);
    return null;
  }
}
