"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import styles from "./ContactFormPanel.module.scss";
import { useContactPanel } from "@/context/ContactPanelContext";
import Button from "@/components/ui/Button/Button";
import { ContactData, StrapiForm, StrapiField } from "@/services/contact";
import { getStrapiMedia } from "@/utils/strapi";

interface ContactFormPanelProps {
  data: ContactData | null;
}

const ContactFormPanel: React.FC<ContactFormPanelProps> = ({ data }) => {
  const { isOpen, activeForm, setForm, closePanel } = useContactPanel();
  const panelRef = useRef<HTMLDivElement>(null);
  const formWrapperRef = useRef<HTMLFormElement>(null);
  const pathname = usePathname();

  // Map the Strapi forms to our internal activeForm state (0: projet, 1: candidature)
  const currentFormIndex = activeForm === "projet" ? 0 : 1;
  const currentStrapiForm = data?.Formulaires?.[currentFormIndex];

  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState("");
  const [formOpenedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState("");

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

  // Fermeture automatique à la navigation
  useEffect(() => {
    if (isOpen) closePanel();
  }, [pathname]);

  // Animation GSAP ouvrir/fermer
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    if (isOpen) {
      el.style.overflowY = "auto";
      gsap.fromTo(el, { y: "100%" }, { y: "0%", duration: 0.8, ease: "power2.out" });
    } else {
      gsap.to(el, {
        y: "100%",
        duration: 0.7,
        ease: "power2.in",
        onComplete: () => { el.style.overflowY = "hidden"; },
      });
    }
  }, [isOpen]);

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
    setSubmitError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _honeypot: honeypot,
          _timestamp: formOpenedAt,
          form: activeForm,
          fields: formValues,
          chips: selectedChips,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.error || "Une erreur est survenue.");
        setSubmitStatus("error");
      } else {
        setSubmitStatus("success");
      }
    } catch {
      setSubmitStatus("error");
      setSubmitError("Une erreur est survenue. Réessaie plus tard.");
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
                placeholder={(field.Type === "mail" ? field.Email : field.TexteReponse) || ""}
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
                    <span className={styles.toggleCheck}>
                      {isActive && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clip-rule="evenodd"
                    d="M5.46934 5.46934C5.60997 5.32889 5.80059 5.25 5.99934 5.25C6.19809 5.25 6.38871 5.32889 6.52934 5.46934L18.5293 17.4693C18.603 17.538 18.6621 17.6208 18.7031 17.7128C18.7441 17.8048 18.7662 17.9041 18.7679 18.0048C18.7697 18.1055 18.7512 18.2055 18.7135 18.2989C18.6757 18.3923 18.6196 18.4772 18.5484 18.5484C18.4772 18.6196 18.3923 18.6757 18.2989 18.7135C18.2055 18.7512 18.1055 18.7697 18.0048 18.7679C17.9041 18.7662 17.8048 18.7441 17.7128 18.7031C17.6208 18.6621 17.538 18.603 17.4693 18.5293L5.46934 6.52934C5.32889 6.38871 5.25 6.19809 5.25 5.99934C5.25 5.80059 5.32889 5.60997 5.46934 5.46934Z"
                    fill="#5E5E5E"
                  />
                  <path
                    fillRule="evenodd"
                    clip-rule="evenodd"
                    d="M18.5308 5.46934C18.6713 5.60997 18.7502 5.80059 18.7502 5.99934C18.7502 6.19809 18.6713 6.38871 18.5308 6.52934L6.53082 18.5293C6.38865 18.6618 6.2006 18.7339 6.0063 18.7305C5.812 18.7271 5.62661 18.6484 5.4892 18.511C5.35179 18.3735 5.27308 18.1882 5.26965 17.9939C5.26622 17.7996 5.33834 17.6115 5.47082 17.4693L17.4708 5.46934C17.6114 5.32889 17.8021 5.25 18.0008 5.25C18.1996 5.25 18.3902 5.32889 18.5308 5.46934Z"
                    fill="#5E5E5E"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.mainTitleWrapper}>
            {currentStrapiForm?.Accroche && (
              <h1 className={styles.mainTitle}>{currentStrapiForm.Accroche}</h1>
            )}
            {currentStrapiForm?.Icone && (() => {
              const iconUrl = getStrapiMedia(currentStrapiForm.Icone);
              return iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconUrl} alt="" width={33} height={33} />
              ) : null;
            })()}
          </div>

          <form
            key={activeForm}
            className={styles.formWrapper}
            ref={formWrapperRef}
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Honeypot — invisible pour les humains, les bots le remplissent */}
            <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

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
                  {submitError || "Une erreur est survenue lors de l'envoi. Veuillez réessayer."}
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
