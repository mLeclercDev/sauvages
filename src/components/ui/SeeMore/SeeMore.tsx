"use client";

import React from "react";
import TransitionLink from "@/components/ui/TransitionLink/TransitionLink";
import styles from "./SeeMore.module.scss";

interface SeeMoreProps {
  label: string;
  href: string;
  className?: string;
}

const SeeMore: React.FC<SeeMoreProps> = ({ label, href, className = "" }) => {
  return (
    <TransitionLink href={href} className={`${styles.seeMore} ${className}`}>
      <span className={styles.text} data-text={label}>
        <span className={styles.textInner}>{label}</span>
      </span>
      <span className={styles.icon}>
        <svg
          width="33"
          height="31"
          viewBox="0 0 33 31"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.0674 8.06445L13.0244 9.14258C10.0707 12.1981 8.11218 14.2239 5.62207 16.7998H28.6758C29.1545 16.7998 29.5857 16.4006 29.5859 15.8457V3.9541C29.5857 3.40505 29.1533 3 28.6689 3H16.8262V0H28.6689C30.854 0 32.5857 1.79238 32.5859 3.9541V15.8457C32.5857 18.0018 30.8664 19.7998 28.6758 19.7998H5.62109C6.95178 21.1764 8.33374 22.6057 9.53809 23.8516C10.5299 24.8776 11.4018 25.7788 12.0254 26.4238C12.3372 26.7463 12.587 27.0049 12.7588 27.1826C12.8447 27.2715 12.9111 27.3402 12.9561 27.3867C12.9784 27.4099 12.9954 27.4276 13.0068 27.4395L13.0244 27.457L14.0674 28.5361L11.9102 30.6211L10.8672 29.543L11.9463 28.5L10.8672 29.542L10.8633 29.5381C10.8604 29.5351 10.8563 29.5303 10.8506 29.5244C10.8391 29.5125 10.8213 29.4949 10.7988 29.4717C10.7539 29.4252 10.6874 29.3564 10.6016 29.2676C10.4297 29.0898 10.1799 28.8312 9.86816 28.5088C9.24469 27.8638 8.37346 26.9623 7.38184 25.9365C5.39828 23.8846 2.93306 21.3345 1.00781 19.3428L0 18.2998L1.00781 17.2578C4.85832 13.2747 7.01672 11.0408 10.8672 7.05762L11.9102 5.97852L14.0674 8.06445Z"
            fill="black"
          />
        </svg>
      </span>
    </TransitionLink>
  );
};

export default SeeMore;
