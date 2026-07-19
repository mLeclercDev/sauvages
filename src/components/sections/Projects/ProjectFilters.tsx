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
              <span className={styles.viewIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7.5 10.8333C7.94203 10.8333 8.36595 11.0089 8.67851 11.3215C8.99107 11.634 9.16667 12.058 9.16667 12.5V15.8333C9.16667 16.2754 8.99107 16.6993 8.67851 17.0118C8.36595 17.3244 7.94203 17.5 7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5C2.5 12.058 2.67559 11.634 2.98816 11.3215C3.30072 11.0089 3.72464 10.8333 4.16667 10.8333H7.5ZM15.8333 10.8333C16.2754 10.8333 16.6993 11.0089 17.0118 11.3215C17.3244 11.634 17.5 12.058 17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H12.5C12.058 17.5 11.634 17.3244 11.3215 17.0118C11.0089 16.6993 10.8333 16.2754 10.8333 15.8333V12.5C10.8333 12.058 11.0089 11.634 11.3215 11.3215C11.634 11.0089 12.058 10.8333 12.5 10.8333H15.8333ZM7.5 2.5C7.94203 2.5 8.36595 2.67559 8.67851 2.98816C8.99107 3.30072 9.16667 3.72464 9.16667 4.16667V7.5C9.16667 7.94203 8.99107 8.36595 8.67851 8.67851C8.36595 8.99107 7.94203 9.16667 7.5 9.16667H4.16667C3.72464 9.16667 3.30072 8.99107 2.98816 8.67851C2.67559 8.36595 2.5 7.94203 2.5 7.5V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5ZM15.8333 2.5C16.2754 2.5 16.6993 2.67559 17.0118 2.98816C17.3244 3.30072 17.5 3.72464 17.5 4.16667V7.5C17.5 7.94203 17.3244 8.36595 17.0118 8.67851C16.6993 8.99107 16.2754 9.16667 15.8333 9.16667H12.5C12.058 9.16667 11.634 8.99107 11.3215 8.67851C11.0089 8.36595 10.8333 7.94203 10.8333 7.5V4.16667C10.8333 3.72464 11.0089 3.30072 11.3215 2.98816C11.634 2.67559 12.058 2.5 12.5 2.5H15.8333Z"
                    fill="#5E5E5E"
                  />
                </svg>
              </span>
            </button>
            <button
              className={`${styles.toggleBtn} ${currentView === "list" ? styles.active : ""}`}
              onClick={() => onViewChange("list")}
            >
              VUE LISTE
              <span className={styles.viewIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M3.33398 9.16667H16.6673V10.8333H3.33398V9.16667ZM3.33398 5H16.6673V6.66667H3.33398V5ZM3.33398 13.3333H16.6673V15H3.33398V13.3333Z"
                    fill="#5E5E5E"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;
