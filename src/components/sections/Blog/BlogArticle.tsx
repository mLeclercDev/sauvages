"use client";

import React, { useState } from "react";
import styles from "./BlogArticle.module.scss";

interface BlogArticleProps {
  title: string;
  date: string;
  updatedDate?: string;
  author?: string;
  readTime?: string;
  heroImage: string;
  intro?: string;
  contentHtml?: string;
  shareUrl: string;
}

const CopyLinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.52733 0C1.58757 0 0 1.58754 0 3.52733V14.4732C0 16.413 1.58754 18 3.52733 18H14.4732C16.413 18 18 16.413 18 14.4732V3.52733C18 1.58757 16.413 0 14.4732 0H3.52733ZM4.4145 2.97036C5.34457 2.97036 5.91746 3.58094 5.93514 4.38353C5.93514 5.1684 5.34454 5.79614 4.39651 5.79614H4.37906C3.46669 5.79614 2.87699 5.16844 2.87699 4.38353C2.87699 3.58095 3.48454 2.97036 4.41448 2.97036H4.4145ZM12.4294 6.72158C14.2181 6.72158 15.559 7.89069 15.559 10.403V15.0932H12.8407V10.7175C12.8407 9.61793 12.4473 8.86776 11.4635 8.86776C10.7125 8.86776 10.2649 9.37338 10.0683 9.86183C9.99655 10.0366 9.9789 10.2806 9.9789 10.5251V15.0932H7.26056C7.26056 15.0932 7.29623 7.6809 7.26056 6.9134H9.97946V8.07174C10.3407 7.5144 10.9869 6.72156 12.4294 6.72156V6.72158ZM3.03733 6.914H5.75567V15.0932H3.03733V6.914Z"
      fill="currentColor"
    />
  </svg>
);

const ThreadsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.4286 0C16.8469 0 18 1.15313 18 2.57143V15.4286C18 16.8469 16.8469 18 15.4286 18H2.57143C1.15313 18 0 16.8469 0 15.4286V2.57143C0 1.15313 1.15313 0 2.57143 0H15.4286ZM9.55446 2.58348C5.57679 2.58348 2.87277 5.40402 2.87277 9.49821C2.87277 13.2429 5.52054 15.4165 8.67857 15.4165C11.2862 15.4165 13.9259 13.8938 13.9259 11.2902C13.9259 9.92812 13.1464 9.02812 12.0174 8.51786C12.0013 6.65357 10.9888 5.53259 9.28527 5.53259C8.14821 5.53259 7.18795 6.04688 6.68571 6.87054L7.78661 7.63393C8.07187 7.18393 8.46562 6.81027 9.19286 6.81027C10.0085 6.81027 10.4304 7.26429 10.5509 8.10804C10.1571 8.04777 9.76339 8.01562 9.35357 8.01562C7.14777 8.01562 6.11116 9.01205 6.10714 10.3339C6.10313 11.6558 7.14375 12.4674 8.67455 12.4674C10.354 12.4674 11.3545 11.3344 11.7683 9.93616C12.1942 10.129 12.4875 10.579 12.4875 11.258C12.4875 13.0701 10.3982 14.0545 8.62634 14.0545C6.01473 14.0545 4.30714 12.3388 4.30714 9.55045C4.30714 6.13125 6.56518 3.94152 9.59866 3.94152C11.6357 3.94152 12.6442 4.83348 13.3272 6.03482L14.4522 5.24732C13.7089 3.69241 12.0455 2.58348 9.55045 2.58348H9.55446ZM9.47411 9.30134C9.83571 9.30134 10.1893 9.32545 10.5067 9.39375C10.2817 10.4223 9.61473 11.1134 8.63036 11.1134C8.0558 11.1134 7.54955 10.8402 7.54955 10.3379C7.54955 9.54643 8.52187 9.30536 9.47812 9.30536L9.47411 9.30134Z"
      fill="currentColor"
    />
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.57143 0C1.15313 0 0 1.15313 0 2.57143V15.4286C0 16.8469 1.15313 18 2.57143 18H15.4286C16.8469 18 18 16.8469 18 15.4286V2.57143C18 1.15313 16.8469 0 15.4286 0H2.57143ZM14.5085 3.375L10.3379 8.14018L15.2437 14.625H11.4027L8.39732 10.6915L4.95402 14.625H3.04554L7.50536 9.52634L2.80045 3.375H6.73795L9.45804 6.97098L12.6 3.375H14.5085ZM12.9897 13.4839L6.16339 4.4558H5.02634L11.929 13.4839H12.9897Z"
      fill="currentColor"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="18" height="18" rx="3" fill="currentColor" />
    <path
      d="M15.0548 4.20141L14.7987 3.89472C14.6385 3.70215 14.4419 3.54311 14.2201 3.42673C13.9984 3.31036 13.7558 3.23894 13.5063 3.21658C13.2569 3.19422 13.0054 3.22136 12.7665 3.29643C12.5276 3.37151 12.3058 3.49305 12.114 3.65408L8.61528 6.57801C8.42275 6.73818 8.26374 6.9348 8.1474 7.15658C8.03105 7.37836 7.95964 7.62093 7.93728 7.87038C7.91492 8.11982 7.94205 8.37123 8.0171 8.61016C8.09215 8.8491 8.21366 9.07086 8.37463 9.26271L8.63074 9.56941C8.7909 9.76195 8.98753 9.92096 9.20932 10.0373C9.43111 10.1536 9.6737 10.225 9.92316 10.2474C10.1726 10.2697 10.424 10.2425 10.663 10.1674C10.9019 10.0923 11.1236 9.97074 11.3154 9.8097L14.8145 6.88611C15.007 6.72592 15.1659 6.52928 15.2823 6.30749C15.3986 6.0857 15.47 5.84312 15.4923 5.59368C15.5146 5.34423 15.4875 5.09283 15.4124 4.85391C15.3373 4.61499 15.2158 4.39325 15.0548 4.20141Z"
      stroke="white"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.62525 8.73832L9.36915 8.43197C9.20898 8.23943 9.01235 8.08007 8.79056 7.96372C8.56877 7.84738 8.32618 7.77599 8.07672 7.75367C7.82727 7.73134 7.57585 7.75851 7.33693 7.83361C7.098 7.90872 6.87626 8.03029 6.68445 8.19133L3.18577 11.1149C2.99318 11.2751 2.83414 11.4717 2.71775 11.6935C2.60137 11.9153 2.52995 12.158 2.50759 12.4074C2.48523 12.6569 2.51237 12.9084 2.58746 13.1473C2.66254 13.3863 2.78409 13.6081 2.94512 13.8L3.20122 14.1063C3.36137 14.2989 3.55797 14.4579 3.77975 14.5743C4.00153 14.6907 4.24411 14.7621 4.49357 14.7845C4.74303 14.8068 4.99445 14.7797 5.23339 14.7046C5.47233 14.6295 5.69409 14.508 5.88592 14.347L9.38495 11.423C9.57746 11.2628 9.73644 11.0662 9.85275 10.8444C9.96907 10.6226 10.0404 10.38 10.0628 10.1306C10.0851 9.88113 10.0579 9.62974 9.98286 9.39081C9.90777 9.15189 9.78625 8.93015 9.62525 8.73832Z"
      stroke="white"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BlogArticle: React.FC<BlogArticleProps> = ({
  title,
  date,
  updatedDate,
  author,
  readTime,
  intro,
  contentHtml = "",
  shareUrl,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API indisponible (contexte non sécurisé, permission refusée) — pas de crash
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <section className={styles.blogArticle}>
      <div className="container">
        <div className={styles.contentGrid}>
          <div className={styles.metaColumn}>
            <span className="label">Publié le {date}</span>
            <h1 className={`${styles.title} h3`}>{title}</h1>
            <div className={styles.metaInfo}>
              {updatedDate && (
                <span className="label">Mis à jour le {updatedDate}</span>
              )}
              {author && (
                <span className="label">Rédigé par {author}</span>
              )}
              {readTime && (
                <span className="label">[{readTime}]</span>
              )}
            </div>

            <div className={styles.share}>
              <span className={`label ${styles.shareLabel}`}>Partager cet article</span>
              <div className={styles.shareIcons}>
                <button
                  type="button"
                  className={styles.shareButton}
                  onClick={handleCopyLink}
                  aria-label="Copier le lien de l'article"
                >
                  <CopyLinkIcon />
                  {copied && <span className={styles.copiedTooltip}>Copié !</span>}
                </button>
                <a
                  href={`https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shareButton}
                  aria-label="Partager sur Threads"
                >
                  <ThreadsIcon />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shareButton}
                  aria-label="Partager sur X"
                >
                  <XIcon />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shareButton}
                  aria-label="Partager sur LinkedIn"
                >
                  <LinkedInIcon />
                </a>
              </div>
            </div>
          </div>

          <div className={styles.bodyColumn}>
            {intro && (
              <div
                className={styles.intro}
                dangerouslySetInnerHTML={{ __html: intro }}
              />
            )}

            {contentHtml && (
              <div
                className={styles.richText}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogArticle;
