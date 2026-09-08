import React from "react";
import { marked } from "marked";

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

interface StrapiInlineChild {
  type?: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  /** Lexical bitmask: 1=bold, 2=italic, 8=underline, 16=code */
  format?: number;
  /** present when this node is itself a list-item wrapper (block type "list") */
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
 * Render a single Strapi "child" text node to JSX, handling structured
 * formatting (bold/italic/underline/code, either as booleans or a Lexical
 * bitmask) and falling back to literal markdown (**bold**) when no
 * structured formatting is present.
 */
export const renderStrapiInline = (
  c: StrapiInlineChild,
  key: number | string
): React.ReactNode => {
  if (c.type === "linebreak") return <br key={key} />;

  const fmt = c.format || 0;
  const hasStructuredFormat = fmt !== 0 || c.bold || c.italic || c.code || c.underline;

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
  if (fmt & 8 || c.underline) node = <u key={key}>{node}</u>;
  return <React.Fragment key={key}>{node}</React.Fragment>;
};

/**
 * Render an array of Strapi rich-text blocks (paragraph/heading/list) to JSX.
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
        const isEmpty = !block.children?.some((c) => c.text || c.type === "linebreak");
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
              <li key={j}>{item.children?.map((c, k) => renderStrapiInline(c, k))}</li>
            ))}
          </ListTag>
        );
      }
      default:
        return null;
    }
  });
};

const inlineChildToHtml = (c: StrapiInlineChild): string => {
  if (c.type === "linebreak") return "<br />";

  let text = c.text || "";
  if (!text) return "";

  const fmt = c.format || 0;
  const hasStructuredFormat = fmt !== 0 || c.bold || c.italic || c.code || c.underline;

  if (!hasStructuredFormat && /\*/.test(text)) {
    return markdownInlineToHtml(text);
  }

  if (fmt & 16 || c.code) text = `<code>${text}</code>`;
  if (fmt & 1 || c.bold) text = `<strong>${text}</strong>`;
  if (fmt & 2 || c.italic) text = `<em>${text}</em>`;
  if (fmt & 8 || c.underline) text = `<u>${text}</u>`;
  return text;
};

/**
 * Render an array of Strapi rich-text blocks to an HTML string, for Server
 * Components that build up a `contentHtml` prop instead of JSX directly.
 */
export const strapiBlocksToHtml = (
  blocks?: StrapiBlock[],
  getImageUrl?: (image: StrapiMediaLike | undefined) => string | null
): string => {
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
              ?.map((item) => {
                const inner = item.children?.map(inlineChildToHtml).join("") || "";
                return `<li>${inner}</li>`;
              })
              .join("") || "";
          return `<${tag}>${items}</${tag}>`;
        }
        case "image": {
          const url = getImageUrl?.(block.image);
          if (!url) return "";
          const alt = block.image?.alternativeText || "";
          return `<figure><img src="${url}" alt="${alt}" /></figure>`;
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
