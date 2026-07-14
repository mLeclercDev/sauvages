"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./ContactFormPanel.module.scss";
import { useContactPanel } from "@/context/ContactPanelContext";
import Button from "@/components/ui/Button/Button";
import { ContactData, StrapiForm, StrapiField } from "@/services/contact";

interface ContactFormPanelProps {
  data: ContactData | null;
}

const ContactFormPanel: React.FC<ContactFormPanelProps> = ({ data }) => {
  const { isOpen, activeForm, setForm, closePanel } = useContactPanel();
  const panelRef = useRef<HTMLDivElement>(null);
  const formWrapperRef = useRef<HTMLFormElement>(null);

  // Map the Strapi forms to our internal activeForm state (0: projet, 1: candidature)
  const currentFormIndex = activeForm === "projet" ? 0 : 1;
  const currentStrapiForm = data?.Formulaires?.[currentFormIndex];

  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  useEffect(() => {
    // Reset validation and status when switching forms or opening
    setErrors({});
    setSubmitStatus("idle");
    
    // Reset values when switching forms or when panel is closed
    if (!isOpen || activeForm) {
      setFormValues({});
      setSelectedChips([]);
    }
  }, [isOpen, activeForm]);

  useEffect(() => {
    if (!formWrapperRef.current || !isOpen) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        formWrapperRef.current!.children,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.4,
          ease: "power2.out",
        }
      );
    }, formWrapperRef);

    return () => ctx.revert();
  }, [isOpen, activeForm]);

  const handleInputChange = (id: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const toggleChip = (fieldId: string, chip: string) => {
    setSelectedChips((prev) => {
      const isSelected = prev.includes(chip);
      const next = isSelected
        ? prev.filter((c) => c !== chip)
        : [...prev, chip];

      // Clear error for this field if at least one chip is selected now
      if (next.length > 0 && errors[fieldId]) {
        setErrors((prevErr) => {
          const newErr = { ...prevErr };
          delete newErr[fieldId];
          return newErr;
        });
      }
      return next;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    currentStrapiForm?.Champs?.forEach((field) => {
      const fieldKey = `field_${field.id}`;
      const value = formValues[fieldKey];
      const isRequired = field.Obligatoire;

      if (isRequired) {
        if (field.Type === "select") {
          if (selectedChips.length === 0) {
            newErrors[fieldKey] = "Veuillez sélectionner au moins une option";
          }
        } else if (!value || value.trim() === "") {
          newErrors[fieldKey] = "Ce champ est obligatoire";
        }
      }

      // Format specific validation
      if (value && field.Type === "mail") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[fieldKey] = "Format d'email invalide";
        }
      }
    });

    // Validation des conditions générales
    if (!formValues.acceptTerms) {
      newErrors.acceptTerms = "Vous devez accepter les conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Form submitted:", { formValues, selectedChips });
      setSubmitStatus("success");
      // Optional: closePanel after success
      // setTimeout(closePanel, 2000);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProjet = activeForm === "projet";

  // Helper to render fields dynamically
  const renderField = (field: StrapiField, index: number) => {
    const rowNumber = index + 1;
    const fieldKey = `field_${field.id}`;
    const hasError = !!errors[fieldKey];
    const isRequired = field.Obligatoire;

    switch (field.Type) {
      case "select":
        return (
          <div
            className={`${styles.formRow} ${hasError ? styles.hasError : ""}`}
            key={field.id}
          >
            <div className={styles.rowNumber}>{rowNumber}.</div>
            <div className={styles.rowContentFull}>
              <div className={styles.rowLabelFull}>
                {field.Intitule}
                {isRequired && (
                  <span className={styles.requiredMark}>*</span>
                )}
              </div>
              <div className={styles.chips}>
                {field.Option?.map((opt) => (
                  <button
                    key={opt.id}
                    className={`${styles.chip} ${selectedChips.includes(opt.Texte) ? styles.active : ""}`}
                    onClick={() => toggleChip(fieldKey, opt.Texte)}
                    type="button"
                  >
                    {opt.Texte}
                  </button>
                ))}
              </div>
              {hasError && (
                <span className={styles.errorMessage}>{errors[fieldKey]}</span>
              )}
            </div>
          </div>
        );

      case "texte":
      case "mail":
        return (
          <div
            className={`${styles.formRow} ${hasError ? styles.hasError : ""}`}
            key={field.id}
          >
            <div className={styles.rowNumber}>{rowNumber}.</div>
            <div className={styles.rowLabel}>
              {field.Intitule}
              {isRequired && (
                <span className={styles.requiredMark}>*</span>
              )}
            </div>
            <div className={styles.rowContent}>
              <input
                type={field.Type === "mail" ? "email" : "text"}
                className={styles.inputField}
                placeholder={field.TexteReponse || ""}
                value={formValues[fieldKey] || ""}
                onChange={(e) => handleInputChange(fieldKey, e.target.value)}
              />
              {hasError && (
                <span className={styles.errorMessage}>{errors[fieldKey]}</span>
              )}
            </div>
          </div>
        );

      case "fichier":
        return (
          <div
            className={`${styles.formRow} ${hasError ? styles.hasError : ""}`}
            key={field.id}
          >
            <div className={styles.rowNumber}>{rowNumber}.</div>
            <div className={styles.rowLabel}>
              {field.Intitule}
              {isRequired && (
                <span className={styles.requiredMark}>*</span>
              )}
            </div>
            <div className={styles.rowContent}>
              <label className={styles.fileInputLabel}>
                <input
                  type="file"
                  className={styles.fileInputNative}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
                <span className={styles.fileInputBtn}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Joindre un fichier
                </span>
                <span className={styles.fileInputHint}>
                  PDF, DOC, JPG — max 10MB
                </span>
              </label>
            </div>
          </div>
        );

      case "textarea":
        return (
          <div
            className={`${styles.formRow} ${hasError ? styles.hasError : ""}`}
            key={field.id}
          >
            <div className={styles.rowNumber}>{rowNumber}.</div>
            <div className={styles.rowLabel}>
              {field.Intitule}
              {isRequired && (
                <span className={styles.requiredMark}>*</span>
              )}
            </div>
            <div className={styles.rowContent}>
              <textarea
                className={styles.inputField}
                placeholder={field.TexteReponse || ""}
                value={formValues[fieldKey] || ""}
                onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                rows={1}
              ></textarea>
              {hasError && (
                <span className={styles.errorMessage}>{errors[fieldKey]}</span>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      data-lenis-prevent="true"
      data-lenis-prevent-wheel="true"
      className={`${styles.panel} ${isOpen ? styles.isOpen : ""} ${isProjet ? styles.variantProjet : styles.variantCandidature}`}
      ref={panelRef}
    >
      <div className="container">
        <div className={styles.containerPanel}>
          <div className={styles.header}>
            <div className={styles.toggles}>
              {data?.Formulaires?.map((form, index) => {
                const formType = index === 0 ? "projet" : "candidature";
                const isActive = activeForm === formType;
                return (
                  <button
                    key={form.id}
                    className={`${styles.toggleBtn} ${isActive ? styles.active : ""}`}
                    onClick={() => setForm(formType)}
                    type="button"
                  >
                    {form.TitreFormulaire.toUpperCase()}
                  </button>
                );
              })}
            </div>

            <div className={styles.closeWrapper}>
              <button
                className={styles.closeBtn}
                onClick={closePanel}
                aria-label="Fermer"
                type="button"
              >
                Fermer
              </button>
            </div>
          </div>

          <h1 className={styles.mainTitle}>
            {isProjet ? "Parle-nous de ton projet" : "Faisons connaissance"}
          </h1>

          <form
            key={activeForm}
            className={styles.formWrapper}
            ref={formWrapperRef}
            onSubmit={handleSubmit}
            noValidate
          >
            {currentStrapiForm?.Champs?.map((field, idx) =>
              renderField(field, idx)
            )}

            <div className={styles.footerActions}>
              <label
                className={`${styles.checkboxRow} ${errors.acceptTerms ? styles.hasError : ""}`}
              >
                <input
                  type="checkbox"
                  checked={!!formValues.acceptTerms}
                  onChange={(e) =>
                    handleInputChange(
                      "acceptTerms",
                      e.target.checked ? "true" : ""
                    )
                  }
                />
                <span>
                  J'ai lu et j'accepte les <a href="#">conditions</a> ainsi que
                  la <a href="#">politique de confidentialité</a>.
                </span>
                {errors.acceptTerms && (
                  <span className={styles.errorMessage}>
                    {errors.acceptTerms}
                  </span>
                )}
              </label>
              <label className={styles.checkboxRow}>
                <input type="checkbox" />
                <span>
                  J'accepte de recevoir des communications commerciales.
                </span>
              </label>

              <div style={{ marginTop: "30px" }}>
                <Button
                  label={isSubmitting ? "ENVOI EN COURS..." : "ENVOYER"}
                  type="submit"
                  variant="outline"
                  icon={
                    !isSubmitting && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M7.5 12.5H8.5M5.5 1.5H10.5C10.7652 1.5 11.0196 1.60536 11.2071 1.79289C11.3946 1.98043 11.5 2.23478 11.5 2.5V13.5C11.5 13.7652 11.3946 14.0196 11.2071 14.2071C11.0196 14.3946 10.7652 14.5 10.5 14.5H5.5C5.23478 14.5 4.98043 14.3946 4.79289 14.2071C4.60536 14.0196 4.5 13.7652 4.5 13.5V2.5C4.5 2.23478 4.60536 1.98043 4.79289 1.79289C4.98043 1.60536 5.23478 1.5 5.5 1.5Z"
                          stroke="#F6F6F6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )
                  }
                />
              </div>

              {submitStatus === "success" && (
                <p className={styles.successMessage}>
                  Votre message a été envoyé avec succès !
                </p>
              )}
              {submitStatus === "error" && (
                <p className={styles.errorMessageGlobal}>
                  Une erreur est survenue lors de l'envoi. Veuillez réessayer.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactFormPanel;
