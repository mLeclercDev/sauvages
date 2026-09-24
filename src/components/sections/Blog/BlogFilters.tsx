"use client";

import React from "react";
import styles from "./BlogFilters.module.scss";

interface TypeOption {
  name: string;
  count: number;
}

interface BlogFiltersProps {
  types: TypeOption[];
  totalCount: number;
  activeType: string;
  onTypeChange: (value: string) => void;
}

const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="8"
    viewBox="0 0 13 8"
    fill="none"
    className={styles.chevron}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.65751 7.071L0.000514922 1.414L1.41451 -4.94551e-07L6.36452 4.95L11.3145 -6.18079e-08L12.7285 1.414L7.07152 7.071C6.88399 7.25847 6.62968 7.36379 6.36452 7.36379C6.09935 7.36379 5.84504 7.25847 5.65751 7.071Z"
      fill="currentColor"
    />
  </svg>
);

const BlogFilters: React.FC<BlogFiltersProps> = ({
  types,
  totalCount,
  activeType,
  onTypeChange,
}) => {
  return (
    <div className={styles.filtersBar}>
      <div className="container">
        <div className={styles.topRow}>
          <div className={styles.navLeft}>
            <button className={`${styles.navItem} ${styles.active}`} type="button">
              FILTRE
              <ChevronIcon />
            </button>

            <button
              className={`${styles.navItem} ${styles.disabled}`}
              type="button"
              disabled
              aria-disabled="true"
            >
              SECTEURS D&apos;ACTIVITÉ
            </button>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.categories}>
            <button
              type="button"
              className={`${styles.catBtn} ${activeType === "all" ? styles.active : ""}`}
              onClick={() => onTypeChange("all")}
            >
              Tous
              {totalCount > 0 && <sup className={styles.count}>{totalCount}</sup>}
            </button>

            {types.map(({ name, count }) => {
              const isActive = activeType === name;
              return (
                <button
                  key={name}
                  type="button"
                  className={`${styles.catBtn} ${isActive ? styles.active : ""}`}
                  onClick={() => onTypeChange(isActive ? "all" : name)}
                >
                  {name}
                  {count > 0 && <sup className={styles.count}>{count}</sup>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogFilters;
