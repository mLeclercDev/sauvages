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
            <div className={styles.scrollDownIndicator}>
              Scroll Down{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="18"
                viewBox="0 0 14 18"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M7.30035 17.2807C7.15973 17.4211 6.9691 17.5 6.77035 17.5C6.5716 17.5 6.38098 17.4211 6.24035 17.2807L0.240354 11.2807C0.166668 11.212 0.107565 11.1292 0.0665737 11.0372C0.0255819 10.9452 0.00354062 10.8459 0.00176393 10.7452C-1.27521e-05 10.6445 0.0185114 10.5444 0.0562321 10.4511C0.0939528 10.3577 0.150098 10.2728 0.221317 10.2016C0.292535 10.1304 0.37737 10.0743 0.470758 10.0365C0.564147 9.99881 0.664174 9.98029 0.764877 9.98207C0.86558 9.98384 0.964895 10.0059 1.05689 10.0469C1.14889 10.0879 1.23169 10.147 1.30036 10.2207L6.02035 14.9407L6.02036 0.750659C6.02036 0.551748 6.09937 0.36098 6.24003 0.220329C6.38068 0.079677 6.57144 0.000659333 6.77036 0.000659351C6.96927 0.000659368 7.16003 0.079677 7.30069 0.220329C7.44134 0.36098 7.52036 0.551748 7.52036 0.750659L7.52035 14.9407L12.2404 10.2207C12.309 10.147 12.3918 10.0879 12.4838 10.0469C12.5758 10.0059 12.6751 9.98384 12.7758 9.98207C12.8765 9.98029 12.9766 9.99882 13.07 10.0365C13.1633 10.0743 13.2482 10.1304 13.3194 10.2016C13.3906 10.2728 13.4468 10.3577 13.4845 10.4511C13.5222 10.5445 13.5407 10.6445 13.5389 10.7452C13.5372 10.8459 13.5151 10.9452 13.4741 11.0372C13.4331 11.1292 13.374 11.212 13.3004 11.2807L7.30035 17.2807Z"
                  fill="#5E5E5E"
                />
              </svg>
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
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.46934 5.46934C5.60997 5.32889 5.80059 5.25 5.99934 5.25C6.19809 5.25 6.38871 5.32889 6.52934 5.46934L18.5293 17.4693C18.603 17.538 18.6621 17.6208 18.7031 17.7128C18.7441 17.8048 18.7662 17.9041 18.7679 18.0048C18.7697 18.1055 18.7512 18.2055 18.7135 18.2989C18.6757 18.3923 18.6196 18.4772 18.5484 18.5484C18.4772 18.6196 18.3923 18.6757 18.2989 18.7135C18.2055 18.7512 18.1055 18.7697 18.0048 18.7679C17.9041 18.7662 17.8048 18.7441 17.7128 18.7031C17.6208 18.6621 17.538 18.603 17.4693 18.5293L5.46934 6.52934C5.32889 6.38871 5.25 6.19809 5.25 5.99934C5.25 5.80059 5.32889 5.60997 5.46934 5.46934Z"
                    fill="#5E5E5E"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M18.5308 5.46934C18.6713 5.60997 18.7502 5.80059 18.7502 5.99934C18.7502 6.19809 18.6713 6.38871 18.5308 6.52934L6.53082 18.5293C6.38865 18.6618 6.2006 18.7339 6.0063 18.7305C5.812 18.7271 5.62661 18.6484 5.4892 18.511C5.35179 18.3735 5.27308 18.1882 5.26965 17.9939C5.26622 17.7996 5.33834 17.6115 5.47082 17.4693L17.4708 5.46934C17.6114 5.32889 17.8021 5.25 18.0008 5.25C18.1996 5.25 18.3902 5.32889 18.5308 5.46934Z"
                    fill="#5E5E5E"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.mainTitleWrapper}>
            <h1 className={styles.mainTitle}>
              {isProjet ? "Parle-nous de ton projet" : "Faisons connaissance"}
            </h1>
            {isProjet ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33" fill="none">
                <path d="M3.20786 22.9345C1.97291 24.2258 1.17189 25.8704 0.916615 27.6389C0.761101 28.5236 0.703879 29.4228 0.74599 30.3201V31.7339H2.69599C3.41534 31.7323 4.13315 31.667 4.84099 31.5389C6.61238 31.2932 8.25982 30.4908 9.54536 29.2476C10.2995 28.3997 10.6871 27.2876 10.6231 26.1546C10.5591 25.0217 10.0489 23.9602 9.20411 23.2026C8.43822 22.3827 7.38158 21.8954 6.26069 21.8453C5.1398 21.7952 4.04388 22.1862 3.20786 22.9345ZM7.44911 27.1514C6.60529 27.9507 5.53027 28.4626 4.37786 28.6139H3.84161V28.0776C3.99291 26.9252 4.50482 25.8502 5.30411 25.0064C5.4691 24.8727 5.67694 24.8035 5.88911 24.8114C6.10614 24.8201 6.31924 24.872 6.51595 24.9641C6.71267 25.0561 6.88904 25.1865 7.03474 25.3476C7.3273 25.5332 7.53489 25.8267 7.61246 26.1644C7.69004 26.502 7.63134 26.8567 7.44911 27.1514ZM32.4091 2.24011C32.3967 1.66866 32.1641 1.12406 31.76 0.719888C31.3558 0.315714 30.8112 0.0831658 30.2397 0.0707385C27.3861 -0.162251 24.5149 0.181686 21.797 1.08205C19.0792 1.98241 16.5705 3.42076 14.4204 5.31136L10.4472 9.94261L4.59724 8.72386C4.19824 8.63694 3.7838 8.65165 3.39197 8.76664C3.00014 8.88163 2.64348 9.09323 2.35474 9.38199L0.69724 11.0395C0.444266 11.2974 0.251796 11.6084 0.133759 11.9499C0.0157212 12.2913 -0.0249322 12.6548 0.0147399 13.0139C0.0506738 13.3775 0.16791 13.7284 0.357774 14.0406C0.547638 14.3529 0.805271 14.6184 1.11161 14.8176L6.13286 18.0351L6.44974 18.2301L14.2497 26.152L14.4447 26.347L17.6622 31.3682C17.8614 31.6746 18.127 31.9322 18.4392 32.1221C18.7514 32.3119 19.1023 32.4292 19.466 32.4651H19.7341C20.3736 32.4624 20.9864 32.2086 21.4404 31.7582L23.0979 30.1007C23.3866 29.812 23.5982 29.4553 23.7132 29.0635C23.8282 28.6717 23.8429 28.2572 23.756 27.8582L22.5372 22.0326L27.0222 18.1814C28.9483 16.0245 30.4184 13.5005 31.3441 10.761C32.2698 8.02154 32.6321 5.12317 32.4091 2.24011ZM4.28036 11.7707L7.49786 12.4532L5.93786 14.2814L3.50036 12.6482L4.28036 11.7707ZM19.8316 29.077L18.1985 26.6395L20.0266 25.0795L20.7091 28.297L19.8316 29.077ZM24.9747 15.9389L16.0047 23.5926L8.88724 16.4751L16.541 7.50511C20.0872 4.44081 24.6821 2.86842 29.3622 3.11761C29.6013 7.79633 28.0301 12.3875 24.9747 15.9389Z" fill="currentColor"/>
                <path d="M23.8267 12.9395C24.093 12.6598 24.3008 12.3298 24.4379 11.9687C24.575 11.6076 24.6386 11.2228 24.625 10.8369C24.6113 10.4509 24.5208 10.0715 24.3586 9.72103C24.1964 9.37053 23.9658 9.05595 23.6804 8.79574C23.4285 8.497 23.1174 8.25373 22.7668 8.08127C22.4161 7.90881 22.0335 7.81091 21.6431 7.79374C21.2527 7.77658 20.863 7.84053 20.4985 7.98154C20.1341 8.12256 19.8028 8.33759 19.5257 8.61307C19.2485 8.88854 19.0315 9.21847 18.8882 9.58205C18.745 9.94562 18.6787 10.3349 18.6934 10.7254C18.7082 11.1159 18.8038 11.4991 18.9741 11.8508C19.1444 12.2025 19.3858 12.5151 19.6829 12.7689C19.9433 13.053 20.2572 13.2829 20.6067 13.4454C20.9562 13.6079 21.3343 13.6997 21.7193 13.7155C22.1044 13.7314 22.4888 13.671 22.8505 13.5378C23.2121 13.4046 23.5439 13.2013 23.8267 12.9395Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="29" height="32" viewBox="0 0 29 32" fill="none">
                <path d="M10.685 3.04986C11.1292 3.0498 11.568 3.14651 11.9709 3.33325C12.3737 3.51998 12.7309 3.79223 13.0175 4.131C13.3041 4.46977 13.5132 4.8669 13.6301 5.29466C13.7471 5.72243 13.7692 6.17052 13.6948 6.60768L16.7061 7.1105C16.8222 6.42389 16.8196 5.72249 16.6984 5.03675C17.276 4.67567 17.958 4.51792 18.6358 4.58863C19.3136 4.65934 19.9482 4.95445 20.4385 5.42694C20.9288 5.89944 21.2467 6.52215 21.3414 7.19588C21.4361 7.86961 21.3023 8.55562 20.9612 9.14463H4.58002C4.34312 9.14437 4.10954 9.08906 3.89776 8.98308C3.68598 8.87711 3.50182 8.72337 3.35985 8.53404C3.21788 8.34471 3.12201 8.12499 3.07983 7.89227C3.03764 7.65955 3.0503 7.42023 3.11679 7.19323C3.18329 6.96624 3.3018 6.75782 3.46295 6.58447C3.62409 6.41112 3.82344 6.27759 4.04523 6.19446C4.26701 6.11134 4.50513 6.08089 4.74073 6.10554C4.97634 6.13019 5.20296 6.20925 5.40267 6.33646C5.60825 6.46792 5.84242 6.54822 6.08552 6.57063C6.32862 6.59304 6.57356 6.55691 6.79978 6.46526C7.026 6.37361 7.22689 6.22912 7.3856 6.04392C7.54431 5.85872 7.6562 5.63822 7.71188 5.40092C7.86922 4.73171 8.24856 4.13526 8.7883 3.70845C9.32804 3.28164 9.99647 3.04955 10.685 3.04986ZM12.9988 0.455012C11.6195 -0.109161 10.0811 -0.150074 8.6737 0.339988C7.26628 0.830049 6.08707 1.81722 5.35841 3.11538C4.37857 2.94634 3.37023 3.10034 2.48583 3.5541C1.60142 4.00786 0.88902 4.73671 0.456297 5.63048C0.0235741 6.52425 -0.105944 7.53436 0.0873187 8.50813C0.280582 9.48189 0.786121 10.3664 1.52752 11.0279V28.9526C1.52752 29.7608 1.84912 30.5359 2.42158 31.1074C2.99403 31.6789 3.77045 32 4.58002 32H19.8425C20.6521 32 21.4285 31.6789 22.0009 31.1074C22.5734 30.5359 22.895 29.7608 22.895 28.9526H25.9475C26.7571 28.9526 27.5335 28.6316 28.1059 28.0601C28.6784 27.4886 29 26.7135 29 25.9052V15.2394C29 14.4312 28.6784 13.6561 28.1059 13.0846C27.5335 12.5131 26.7571 12.192 25.9475 12.192H22.895V11.6526C23.8438 10.5802 24.3844 9.20864 24.4221 7.77828C24.4598 6.34792 23.9922 4.94991 23.1012 3.82913C22.2102 2.70835 20.9526 1.93626 19.5487 1.64809C18.1448 1.35992 16.6841 1.57405 15.4225 2.25297C14.7781 1.4605 13.9448 0.84227 12.9988 0.455012ZM22.895 15.2394H25.9475V25.9052H22.895V15.2394ZM19.8425 12.192V28.9526H4.58002V12.192H19.8425ZM7.63252 15.2394V25.9052H10.685V15.2394H7.63252ZM16.79 15.2394V25.9052H13.7375V15.2394H16.79Z" fill="currentColor"/>
              </svg>
            )}
          </div>

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
