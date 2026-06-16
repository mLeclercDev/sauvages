import React from "react";
import { fetchAPI } from "@/utils/strapi";
import ClientsScrollClient, { ClientItem } from "./ClientsScrollClient";

interface ClientsScrollProps {
  label?: string;
  title?: string;
}

const FALLBACK_CLIENTS: ClientItem[] = [
  { id: 1, name: "Tourisme Bretagne", competencies: ["Stratégie", "Contenu", "Social media"] },
  { id: 2, name: "Yves Rocher", competencies: ["Branding", "Identité visuelle"] },
  { id: 3, name: "La Française", competencies: ["Conseil", "Création"] },
  { id: 4, name: "Breizhgo", competencies: ["Activation", "Illustration", "Déclinaisons"] },
  { id: 5, name: "Fellows", competencies: ["Motion design", "Branding"] },
  { id: 6, name: "Protys", competencies: ["Digital", "Identité"] },
  { id: 7, name: "Groupe Giboire", competencies: ["Conseil", "Campagne"] },
];

export default async function ClientsScroll({ label, title }: ClientsScrollProps) {
  let clients: ClientItem[] = [];

  try {
    const res = await fetchAPI("/clients", {
      populate: { logo: { populate: "*" } },
      sort: ["order:asc"],
    });

    const raw: any[] = res?.data || [];

    clients = raw.map((c: any) => {
      const attrs = c.attributes || c;
      const competenciesRaw = attrs.competencies || attrs.Competencies || "";
      const competencies =
        typeof competenciesRaw === "string"
          ? competenciesRaw.split(",").map((s: string) => s.trim()).filter(Boolean)
          : Array.isArray(competenciesRaw)
          ? competenciesRaw
          : [];

      return {
        id: c.id || c.documentId,
        name: attrs.name || attrs.Name || "",
        logo: attrs.logo || attrs.Logo,
        competencies,
      };
    });
  } catch (e) {
    console.error("Failed to fetch clients:", e);
  }

  if (clients.length === 0) {
    clients = FALLBACK_CLIENTS;
  }

  return <ClientsScrollClient clients={clients} label={label} title={title} />;
}
