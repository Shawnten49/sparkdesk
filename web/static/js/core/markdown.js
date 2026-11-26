import { escapeHtml } from "./dom.js";

export function renderMarkdown(text) {
  if (window.marked && window.DOMPurify) {
    const raw = window.marked.parse(text || "", {
      gfm: true,
      breaks: true
    });
    return window.DOMPurify.sanitize(raw).replace(
      /<a /g,
      '<a target="_blank" rel="noopener noreferrer" '
    );
  }
  return `<p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>`;
}
