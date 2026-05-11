"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type FormType = "projet" | "candidature";

interface ContactPanelContextType {
  isOpen: boolean;
  activeForm: FormType;
  openPanel: (formType?: FormType) => void;
  closePanel: () => void;
  setForm: (formType: FormType) => void;
}

const ContactPanelContext = createContext<ContactPanelContextType | undefined>(undefined);

export const ContactPanelProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<FormType>("projet");

  const openPanel = (formType?: FormType) => {
    if (formType) setActiveForm(formType);
    setIsOpen(true);
    // Optional: lock body scroll when panel is open
    document.body.style.overflow = "hidden";
  };

  const closePanel = () => {
    setIsOpen(false);
    // Restore body scroll
    document.body.style.overflow = "";
  };

  const setForm = (formType: FormType) => {
    setActiveForm(formType);
  };

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
