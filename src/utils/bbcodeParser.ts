import { normalizeForumImageUrl } from "@/utils/forumImageUrl";

/**
 * BBCode Parser - Converts BBCode tags to HTML
 * Supports: [b], [u], [s], [color], [size], [url], [align], [img]
 */

/** Strip object-replacement / invisible paste junk (U+FFFC renders as [OBJ]). */
export const sanitizeUserVisibleText = (value: string | null | undefined): string => {
  if (value == null) return "";
  return String(value)
    .replace(/\uFFFC/g, "")
    .replace(/\uFFFD/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
};

const DANGEROUS_PROTOCOL = /^(javascript|data|vbscript):/i;
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

const escapeHtmlAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const sanitizeImageSource = (raw: string): string => {
  const normalized = normalizeForumImageUrl(raw).trim().replace(/&amp;/g, "&");
  if (!normalized) return "";
  if (DANGEROUS_PROTOCOL.test(normalized)) return "";

  // Allow relative storage keys while rejecting dangerous explicit schemes.
  if (!HAS_SCHEME.test(normalized)) return normalized;

  try {
    const url = new URL(normalized);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
};

const sanitizeLinkHref = (raw: string): string => {
  const trimmed = raw.trim().replace(/&amp;/g, "&");
  if (!trimmed || DANGEROUS_PROTOCOL.test(trimmed)) return "";

  // If no scheme is provided, treat it as a normal website URL.
  const candidate = HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
};

export const parseBBCode = (bbcode: string): string => {
  if (!bbcode) return "";

  let html = sanitizeUserVisibleText(bbcode);

  // Escape existing HTML to prevent XSS
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Convert newlines to <br>
  html = html.replace(/\n/g, "<br>");

  // Parse nested tags (process from innermost to outermost)
  // We'll use a recursive approach for nested tags

  // Image tags: [img]url[/img] or [img=url]alt text[/img]
  // Process images before URLs to avoid conflicts
  // Clean up URL - remove any whitespace and escape for HTML attributes
  // Add max-size constraints and data attribute for click handler
  // Images are inline by default, aligned left
  html = html.replace(
    /\[img=([^\]]+)\](.*?)\[\/img\]/gi,
    (match, url, alt) => {
      const safeSrc = sanitizeImageSource(url);
      if (!safeSrc) return "";
      const cleanUrl = escapeHtmlAttr(safeSrc);
      const cleanAlt = escapeHtmlAttr(alt.trim());
      return `<img src="${cleanUrl}" alt="${cleanAlt}" data-image-url="${cleanUrl}" class="forum-image max-w-full h-auto rounded-lg my-2 cursor-pointer transition-transform hover:scale-[1.02]" style="max-width: 600px; max-height: 400px; width: auto; height: auto; object-fit: contain; display: inline-block; margin: 0.5rem 0; vertical-align: middle;" loading="lazy" />`;
    }
  );
  html = html.replace(
    /\[img\](.*?)\[\/img\]/gi,
    (match, url) => {
      const safeSrc = sanitizeImageSource(url);
      if (!safeSrc) return "";
      const cleanUrl = escapeHtmlAttr(safeSrc);
      return `<img src="${cleanUrl}" alt="" data-image-url="${cleanUrl}" class="forum-image max-w-full h-auto rounded-lg my-2 cursor-pointer transition-transform hover:scale-[1.02]" style="max-width: 600px; max-height: 400px; width: auto; height: auto; object-fit: contain; display: inline-block; margin: 0.5rem 0; vertical-align: middle;" loading="lazy" />`;
    }
  );

  // URL tags: [url=https://example.com]text[/url] or [url]https://example.com[/url]
  html = html.replace(
    /\[url=([^\]]+)\](.*?)\[\/url\]/gi,
    (match, url, text) => {
      const safeHref = sanitizeLinkHref(url);
      if (!safeHref) return text;
      return `<a href="${escapeHtmlAttr(safeHref)}" target="_blank" rel="noopener noreferrer" class="text-[#FF902A] hover:underline">${text}</a>`;
    }
  );
  html = html.replace(
    /\[url\](.*?)\[\/url\]/gi,
    (match, url) => {
      const safeHref = sanitizeLinkHref(url);
      if (!safeHref) return url;
      const label = escapeHtmlAttr(url.trim().replace(/&amp;/g, "&")) || safeHref;
      return `<a href="${escapeHtmlAttr(safeHref)}" target="_blank" rel="noopener noreferrer" class="text-[#FF902A] hover:underline">${label}</a>`;
    }
  );

  // Alignment tags (simplified): [left], [center], [right]
  // These can wrap images and text, making them align accordingly
  html = html.replace(
    /\[left\](.*?)\[\/left\]/gi,
    '<div style="text-align: left; display: block;">$1</div>'
  );
  html = html.replace(
    /\[center\](.*?)\[\/center\]/gi,
    '<div style="text-align: center; display: block;">$1</div>'
  );
  html = html.replace(
    /\[right\](.*?)\[\/right\]/gi,
    '<div style="text-align: right; display: block;">$1</div>'
  );

  // Backward compatibility: [align=left], [align=center], [align=right]
  html = html.replace(
    /\[align=left\](.*?)\[\/align\]/gi,
    '<div style="text-align: left;">$1</div>'
  );
  html = html.replace(
    /\[align=center\](.*?)\[\/align\]/gi,
    '<div style="text-align: center;">$1</div>'
  );
  html = html.replace(
    /\[align=right\](.*?)\[\/align\]/gi,
    '<div style="text-align: right;">$1</div>'
  );

  // Size tags (simplified): [small], [medium], [large]
  html = html.replace(
    /\[small\](.*?)\[\/small\]/gi,
    '<span style="font-size: 12px;">$1</span>'
  );
  html = html.replace(
    /\[medium\](.*?)\[\/medium\]/gi,
    '<span style="font-size: 24px;">$1</span>'
  );
  html = html.replace(
    /\[large\](.*?)\[\/large\]/gi,
    '<span style="font-size: 36px;">$1</span>'
  );

  // Backward compatibility: [size=12], [size=24], [size=36] or any numeric size
  html = html.replace(
    /\[size=(\d+)\](.*?)\[\/size\]/gi,
    '<span style="font-size: $1px;">$2</span>'
  );

  // Color tags: [color=#FF0000]text[/color] or [color=red]text[/color]
  // Whitelist safe CSS color values to prevent attribute/CSS injection (stored XSS).
  html = html.replace(
    /\[color=([^\]]+)\](.*?)\[\/color\]/gi,
    (_match, color, text) => {
      const trimmed = String(color).trim();
      const safeColor = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\))$/.test(trimmed)
        ? trimmed
        : 'inherit';
      return `<span style="color: ${safeColor};">${text}</span>`;
    }
  );

  // Bold: [b]text[/b]
  html = html.replace(/\[b\](.*?)\[\/b\]/gi, "<strong>$1</strong>");

  // Underline: [u]text[/u]
  html = html.replace(/\[u\](.*?)\[\/u\]/gi, "<u>$1</u>");

  // Strikethrough: [s]text[/s]
  html = html.replace(/\[s\](.*?)\[\/s\]/gi, "<s>$1</s>");

  return html;
};

/**
 * Strip BBCode tags from text (for plain text preview)
 */
export const stripBBCode = (bbcode: string): string => {
  if (!bbcode) return "";
  
  return sanitizeUserVisibleText(bbcode)
    .replace(/\[img=([^\]]+)\](.*?)\[\/img\]/gi, "$2")
    .replace(/\[img\](.*?)\[\/img\]/gi, "")
    .replace(/\[url=([^\]]+)\](.*?)\[\/url\]/gi, "$2")
    .replace(/\[url\](.*?)\[\/url\]/gi, "$1")
    .replace(/\[left\](.*?)\[\/left\]/gi, "$1")
    .replace(/\[center\](.*?)\[\/center\]/gi, "$1")
    .replace(/\[right\](.*?)\[\/right\]/gi, "$1")
    .replace(/\[align=[^\]]+\](.*?)\[\/align\]/gi, "$1")
    .replace(/\[small\](.*?)\[\/small\]/gi, "$1")
    .replace(/\[medium\](.*?)\[\/medium\]/gi, "$1")
    .replace(/\[large\](.*?)\[\/large\]/gi, "$1")
    .replace(/\[size=\d+\](.*?)\[\/size\]/gi, "$1")
    .replace(/\[color=[^\]]+\](.*?)\[\/color\]/gi, "$1")
    .replace(/\[b\](.*?)\[\/b\]/gi, "$1")
    .replace(/\[u\](.*?)\[\/u\]/gi, "$1")
    .replace(/\[s\](.*?)\[\/s\]/gi, "$1");
};

