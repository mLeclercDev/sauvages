import React from "react";
import { fetchAPI } from "@/utils/strapi";
import ClientsScrollClient, { ClientItem } from "./ClientsScrollClient";

interface ClientsScrollProps {
  label?: string;
  title?: string;
}

export default async function ClientsScroll({ label, title }: ClientsScrollProps) {
  let clients: ClientItem[] = [];

  try {
    const res = await fetchAPI("/clients", {
      filters: { Afficher: { $eq: true } },
      populate: { Logo: "*", Competences: "*" },
      sort: ["name:asc"],
    });

    const raw: any[] = res?.data || [];
    console.log("[ClientsScroll] res:", JSON.stringify(res?.data?.slice(0, 2), null, 2));

    clients = raw.map((c: any) => ({
      id: c.id,
      name: c.name || "",
      logo: c.Logo,
      competencies: c.Competences?.map((comp: { Nom: string }) => comp.Nom) ?? [],
    }));
  } catch (e) {
    console.error("Failed to fetch clients:", e);
  }

  console.log("[ClientsScroll] clients count:", clients.length);
  if (clients.length === 0) return null;

  return <ClientsScrollClient clients={clients} label={label} title={title} />;
}
