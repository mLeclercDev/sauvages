import React from "react";
import TransitionLink from "@/components/ui/TransitionLink/TransitionLink";
import { SITE_URL } from "@/utils/site";
import styles from "./Breadcrumb.module.scss";

interface BreadcrumbItem {
  label: string;
  /** Absent sur le dernier item : page courante, non cliquable */
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      // Le dernier item (page courante) n'a volontairement pas d'URL,
      // conformément à la documentation Google sur le BreadcrumbList.
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <section className={`${styles.breadcrumb} pb-xs`}>
      <div className="container">
        <nav aria-label="Fil d'Ariane">
          <ol className={styles.list}>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <li key={index} className={styles.item} aria-current={isLast ? "page" : undefined}>
                  {isLast || !item.href ? (
                    <span className={styles.current}>{item.label}</span>
                  ) : (
                    <TransitionLink href={item.href} className={styles.link}>
                      {item.label}
                    </TransitionLink>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
};

export default Breadcrumb;
