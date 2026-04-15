"use client";

import React from "react";
import styles from "./ProjectFilters.module.scss";

interface ProjectFiltersProps {
  currentView: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  activeFilterType: "expertise" | "secteur";
  onFilterTypeChange: (type: "expertise" | "secteur") => void;
  expertises: string[];
  secteurs: string[];
  activeExpertise: string;
  activeSecteur: string;
  onExpertiseChange: (value: string) => void;
  onSecteurChange: (value: string) => void;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="8"
    viewBox="0 0 13 8"
    fill="none"
    className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.65751 7.071L0.000514922 1.414L1.41451 -4.94551e-07L6.36452 4.95L11.3145 -6.18079e-08L12.7285 1.414L7.07152 7.071C6.88399 7.25847 6.62968 7.36379 6.36452 7.36379C6.09935 7.36379 5.84504 7.25847 5.65751 7.071Z"
      fill="currentColor"
    />
  </svg>
);

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  currentView,
  onViewChange,
  activeFilterType,
  onFilterTypeChange,
  expertises,
  secteurs,
  activeExpertise,
  activeSecteur,
  onExpertiseChange,
  onSecteurChange,
}) => {
  const activeCount =
    (activeExpertise !== "all" ? 1 : 0) + (activeSecteur !== "all" ? 1 : 0);

  const handleReset = () => {
    onExpertiseChange("all");
    onSecteurChange("all");
  };

  return (
    <div className={styles.filtersBar}>
      <div className="container">
        {/* Top Row: Main selection */}
        <div className={styles.topRow}>
          <div className={styles.navLeft}>
            <button
              className={`${styles.navItem} ${styles.hasDropdown} ${activeFilterType === "expertise" ? styles.active : ""}`}
              onClick={() => onFilterTypeChange("expertise")}
            >
              EXPERTISE
              <ChevronIcon open={activeFilterType === "expertise"} />
            </button>

            <button
              className={`${styles.navItem} ${styles.hasDropdown} ${activeFilterType === "secteur" ? styles.active : ""}`}
              onClick={() => onFilterTypeChange("secteur")}
            >
              SECTEURS D'ACTIVITÉ
              <ChevronIcon open={activeFilterType === "secteur"} />
            </button>
          </div>

          <div className={styles.navRight}>
            <button className={styles.navItemRight}>ÉTUDES DES CAS</button>
            <button className={styles.navItemRight}>ARCHIVES</button>
            {activeCount > 0 && (
              <button
                className={`${styles.navItemRight} ${styles.resetBtn}`}
                onClick={handleReset}
              >
                RÉINITIALISER ({activeCount})
              </button>
            )}
          </div>
        </div>

        {/* Filters Row: Dynamic tag list */}
        <div className={styles.bottomRow}>
          <div className={styles.categories}>
            {/* All button */}
            <button
              className={`${styles.catBtn} ${
                activeFilterType === "expertise"
                  ? activeExpertise === "all"
                    ? styles.active
                    : ""
                  : activeSecteur === "all"
                    ? styles.active
                    : ""
              }`}
              onClick={() => {
                if (activeFilterType === "expertise") onExpertiseChange("all");
                else onSecteurChange("all");
              }}
            >
              TOUS
            </button>

            {/* Dynamic tags */}
            {(activeFilterType === "expertise" ? expertises : secteurs).map(
              (tag) => {
                const isActive =
                  activeFilterType === "expertise"
                    ? activeExpertise === tag
                    : activeSecteur === tag;

                return (
                  <button
                    key={tag}
                    className={`${styles.catBtn} ${isActive ? styles.active : ""}`}
                    onClick={() => {
                      if (activeFilterType === "expertise")
                        onExpertiseChange(isActive ? "all" : tag);
                      else onSecteurChange(isActive ? "all" : tag);
                    }}
                  >
                    {tag.toUpperCase()}
                  </button>
                );
              }
            )}
          </div>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleBtn} ${currentView === "grid" ? styles.active : ""}`}
              onClick={() => onViewChange("grid")}
            >
              VUE GRILLE
            </button>
            <button
              className={`${styles.toggleBtn} ${currentView === "list" ? styles.active : ""}`}
              onClick={() => onViewChange("list")}
            >
              VUE LISTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;
