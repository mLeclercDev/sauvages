import React from "react";
import styles from "./LegalPage.module.scss";

interface LegalPageProps {
  titre: string;
  contentHtml: string;
}

const LegalPage: React.FC<LegalPageProps> = ({ titre, contentHtml }) => {
  return (
    <main className={styles.legalPage}>
      <div className="container">
        <h1 className={styles.title}>{titre}</h1>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </main>
  );
};

export default LegalPage;
