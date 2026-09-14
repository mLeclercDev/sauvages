"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type FormType = "projet" | "candidature";

interface ContactPanelContextType {
  isOpen: boolean;
  activeForm: FormType;
  openPanel: (formType?: FormType) => void;
  closePanel: () => void;
  setForm: (formType: FormType) => void;
}

const ContactPanelContext = createContext<ContactPanelContextType | undefined>(undefined);

const FORM_TO_PATH: Record<FormType, string> = {
  projet: "/contact/j-ai-un-projet",
  candidature: "/contact/rejoindre-lequipe",
};

const SLUG_TO_FORM: Record<string, FormType> = {
  "j-ai-un-projet": "projet",
  "rejoindre-lequipe": "candidature",
};

export const isContactRoute = (pathname: string) =>
  pathname === "/contact" || Object.keys(SLUG_TO_FORM).some((slug) => pathname === `/contact/${slug}`);

// N'ajuste l'URL que si on est déjà sur la page /contact (ou une de ses
// déclinaisons), pour ne pas modifier l'URL des autres pages du site quand
// le panel y est ouvert.
const setContactPath = (formType: FormType) => {
  if (!isContactRoute(window.location.pathname)) return;
  const url = new URL(window.location.href);
  url.pathname = FORM_TO_PATH[formType];
  window.history.replaceState(null, "", url);
};

const clearContactPath = () => {
  if (!isContactRoute(window.location.pathname) || window.location.pathname === "/contact") return;
  const url = new URL(window.location.href);
  url.pathname = "/contact";
  window.history.replaceState(null, "", url);
};

export const ContactPanelProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<FormType>("projet");

  const openPanel = (formType?: FormType) => {
    const nextForm = formType || activeForm;
    if (formType) setActiveForm(formType);
    setIsOpen(true);
    // Optional: lock body scroll when panel is open
    document.body.style.overflow = "hidden";
    setContactPath(nextForm);
  };

  const closePanel = () => {
    setIsOpen(false);
    // Restore body scroll
    document.body.style.overflow = "";
    clearContactPath();
  };

  const setForm = (formType: FormType) => {
    setActiveForm(formType);
    setContactPath(formType);
  };

  // Ouverture automatique depuis un lien externe (/contact/j-ai-un-projet, /contact/rejoindre-lequipe)
  useEffect(() => {
    const pathname = window.location.pathname;
    const slug = pathname.startsWith("/contact/") ? pathname.slice("/contact/".length) : null;
    const formType = slug ? SLUG_TO_FORM[slug] : undefined;
    if (formType) openPanel(formType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ContactPanelContext.Provider
      value={{ isOpen, activeForm, openPanel, closePanel, setForm }}
    >
      {children}
    </ContactPanelContext.Provider>
  );
};

export const useContactPanel = () => {
  const context = useContext(ContactPanelContext);
  if (context === undefined) {
    throw new Error("useContactPanel must be used within a ContactPanelProvider");
  }
  return context;
};
