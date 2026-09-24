import React from "react";
import { marked } from "marked";
import TransitionLink from "@/components/ui/TransitionLink/TransitionLink";
import { getStrapiMedia } from "@/utils/strapi";

/**
 * Convert literal markdown (**bold**, *italic*) inside a plain text node to HTML.
 * Normalizes a common CMS typo (trailing space before the closing delimiter)
 * before handing off to marked.
 */
const markdownInlineToHtml = (text: string): string => {
  const normalized = text
    .replace(/\*\*([^*\n]+?) (\*\*)/g, "**$1** ")
    .replace(/\*([^*\n]+?) (\*)/g, "*$1* ");
  return marked.parseInline(normalized) as string;
};

/** Une URL absolue sort du site : nouvel onglet. Interne : navigation maison. */
const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

/**
 * Classe globale (non hashée) définie dans globals.scss. Elle doit être posée
 * côté utilitaire car les liens richtext sortent par deux chemins — JSX et
 * chaîne HTML injectée — qu'aucun module CSS ne couvre simultanément.
 */
const RICHTEXT_LINK_CLASS = "richtext-link";

/** Échappement minimal pour interpoler une valeur CMS dans un attribut HTML. */
const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

interface StrapiInlineChild {
  type?: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  /** Lexical bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code */
  format?: number;
  /** présent sur les noeuds "link" */
  url?: string;
  /** présent sur les "list-item" et les noeuds "link" */
  children?: StrapiInlineChild[];
}

/** Strapi media object (v4 or v5 shape) — left loose, resolved via getStrapiMedia */
type StrapiMediaLike = { alternativeText?: string } & Record<string, unknown>;

interface StrapiBlock {
  type?: string;
  level?: number;
  /** "ordered" | "unordered" for list blocks */
  format?: string;
  children?: StrapiInlineChild[];
  /** only present on "image" blocks */
  image?: StrapiMediaLike;
}

/**
 * Render a single Strapi "child" node to JSX : liens, sauts de ligne, et
 * formatage (bold/italic/underline/strikethrough/code, en booléens ou en
 * bitmask Lexical), avec repli sur le markdown littéral (**bold**) quand aucun
 * formatage structuré n'est présent.
 */
export const renderStrapiInline = (
  c: StrapiInlineChild,
  key: number | string
): React.ReactNode => {
  if (c.type === "linebreak") return <br key={key} />;

  // Un noeud "link" ne porte pas de texte : il vit dans ses children.
  if (c.type === "link" && c.url) {
    const inner = c.children?.map((child, i) => renderStrapiInline(child, i));
    return isExternalUrl(c.url) ? (
      <a
        key={key}
        href={c.url}
        target="_blank"
        rel="noopener noreferrer"
        className={RICHTEXT_LINK_CLASS}
      >
        {inner}
      </a>
    ) : (
      <TransitionLink key={key} href={c.url} className={RICHTEXT_LINK_CLASS}>
        {inner}
      </TransitionLink>
    );
  }

  const fmt = c.format || 0;
  const hasStructuredFormat =
    fmt !== 0 || c.bold || c.italic || c.code || c.underline || c.strikethrough;

  if (!hasStructuredFormat) {
    const text = c.text || "";
    if (/\*/.test(text)) {
      return (
        <span key={key} dangerouslySetInnerHTML={{ __html: markdownInlineToHtml(text) }} />
      );
    }
  }

  let node: React.ReactNode = c.text;
  if (fmt & 16 || c.code) node = <code key={key}>{node}</code>;
  if (fmt & 1 || c.bold) node = <strong key={key}>{node}</strong>;
  if (fmt & 2 || c.italic) node = <em key={key}>{node}</em>;
  if (fmt & 4 || c.strikethrough) node = <s key={key}>{node}</s>;
  if (fmt & 8 || c.underline) node = <u key={key}>{node}</u>;
  return <React.Fragment key={key}>{node}</React.Fragment>;
};

/** Contenu d'un <li> : un enfant peut être une liste imbriquée, pas juste du inline. */
const renderListItemChildren = (item: StrapiInlineChild): React.ReactNode =>
  item.children?.map((child, k) =>
    child.type === "list"
      ? renderStrapiBlocks([child as StrapiBlock])
      : renderStrapiInline(child, k)
  );

/**
 * Render an array of Strapi rich-text blocks to JSX.
 * Also accepts a plain string (already-HTML paragraphs with literal **bold**
 * markers inside, as produced by some CMS fields).
 */
export const renderStrapiBlocks = (
  blocks?: StrapiBlock[] | string | null
): React.ReactNode => {
  if (!blocks) return null;

  if (typeof blocks === "string") {
    if (!/\*/.test(blocks)) return blocks;
    return <span dangerouslySetInnerHTML={{ __html: markdownInlineToHtml(blocks) }} />;
  }

  if (!Array.isArray(blocks)) return null;

  return blocks.map((block, i) => {
    switch (block.type) {
      case "paragraph": {
        const isEmpty = !block.children?.some(
          (c) => c.text || c.type === "linebreak" || c.type === "link"
        );
        if (isEmpty) return <br key={i} />;
        return <p key={i}>{block.children?.map((c, j) => renderStrapiInline(c, j))}</p>;
      }
      case "heading": {
        const Tag = `h${block.level || 2}` as keyof React.JSX.IntrinsicElements;
        return <Tag key={i}>{block.children?.map((c, j) => renderStrapiInline(c, j))}</Tag>;
      }
      case "list": {
        const ListTag = block.format === "ordered" ? "ol" : "ul";
        return (
          <ListTag key={i}>
            {block.children?.map((item, j) => (
              <li key={j}>{renderListItemChildren(item)}</li>
            ))}
          </ListTag>
        );
      }
      case "quote": {
        return (
          <blockquote key={i}>
            {block.children?.map((c, j) => renderStrapiInline(c, j))}
          </blockquote>
        );
      }
      case "code": {
        return (
          <pre key={i}>
            <code>{block.children?.map((c) => c.text).join("")}</code>
          </pre>
        );
      }
      case "image": {
        const url = getStrapiMedia(block.image, undefined);
        if (!url) return null;
        return (
          <figure key={i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={block.image?.alternativeText || ""} />
          </figure>
        );
      }
      default:
        return null;
    }
  });
};

const inlineChildToHtml = (c: StrapiInlineChild): string => {
  if (c.type === "linebreak") return "<br />";

  // Un noeud "link" ne porte pas de texte : il vit dans ses children.
  if (c.type === "link" && c.url) {
    const inner = c.children?.map(inlineChildToHtml).join("") || "";
    const attrs = isExternalUrl(c.url)
      ? ` target="_blank" rel="noopener noreferrer"`
      : "";
    return `<a class="${RICHTEXT_LINK_CLASS}" href="${escapeAttr(c.url)}"${attrs}>${inner}</a>`;
  }

  let text = c.text || "";
  if (!text) return "";

  const fmt = c.format || 0;
  const hasStructuredFormat =
    fmt !== 0 || c.bold || c.italic || c.code || c.underline || c.strikethrough;

  if (!hasStructuredFormat && /\*/.test(text)) {
    return markdownInlineToHtml(text);
  }

  if (fmt & 16 || c.code) text = `<code>${text}</code>`;
  if (fmt & 1 || c.bold) text = `<strong>${text}</strong>`;
  if (fmt & 2 || c.italic) text = `<em>${text}</em>`;
  if (fmt & 4 || c.strikethrough) text = `<s>${text}</s>`;
  if (fmt & 8 || c.underline) text = `<u>${text}</u>`;
  return text;
};

/** Contenu d'un <li> : un enfant peut être une liste imbriquée. */
const listItemChildrenToHtml = (item: StrapiInlineChild): string =>
  item.children
    ?.map((child) =>
      child.type === "list"
        ? strapiBlocksToHtml([child as StrapiBlock])
        : inlineChildToHtml(child)
    )
    .join("") || "";

/**
 * Render an array of Strapi rich-text blocks to an HTML string, for Server
 * Components that build up a `contentHtml` prop instead of JSX directly.
 */
export const strapiBlocksToHtml = (blocks?: StrapiBlock[]): string => {
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph": {
          const inner = block.children?.map(inlineChildToHtml).join("") || "";
          return inner ? `<p>${inner}</p>` : "";
        }
        case "heading": {
          const level = block.level || 2;
          const inner = block.children?.map(inlineChildToHtml).join("") || "";
          return `<h${level}>${inner}</h${level}>`;
        }
        case "list": {
          const tag = block.format === "ordered" ? "ol" : "ul";
          const items =
            block.children
              ?.map((item) => `<li>${listItemChildrenToHtml(item)}</li>`)
              .join("") || "";
          return `<${tag}>${items}</${tag}>`;
        }
        case "quote": {
          const inner = block.children?.map(inlineChildToHtml).join("") || "";
          return `<blockquote>${inner}</blockquote>`;
        }
        case "image": {
          const url = getStrapiMedia(block.image, undefined);
          if (!url) return "";
          const alt = block.image?.alternativeText || "";
          return `<figure><img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" /></figure>`;
        }
        case "code": {
          const inner = block.children?.map(inlineChildToHtml).join("") || "";
          return `<pre><code>${inner}</code></pre>`;
        }
        default:
          return "";
      }
    })
    .join("");
};
