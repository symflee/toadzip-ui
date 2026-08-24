import "server-only";

import type { ShowcaseDesignSource } from "../showcase-design-types";
import { SHOWCASE_PREVIEW_BASE_CSS } from "../showcase-preview-base";

export const SHOWCASE_PREVIEW_CSP = [
  "sandbox",
  "default-src 'none'",
  "script-src 'none'",
  "connect-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  "style-src 'unsafe-inline'",
  "img-src data:",
  "frame-ancestors 'self'",
].join("; ");

export const SHOWCASE_PREVIEW_HEADERS = {
  "Cache-Control": "private, no-store",
  "Content-Security-Policy": SHOWCASE_PREVIEW_CSP,
  "Content-Type": "text/html; charset=utf-8",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": [
    "accelerometer=()",
    "attribution-reporting=()",
    "autoplay=()",
    "camera=()",
    "clipboard-read=()",
    "clipboard-write=()",
    "display-capture=()",
    "encrypted-media=()",
    "fullscreen=()",
    "geolocation=()",
    "gyroscope=()",
    "magnetometer=()",
    "microphone=()",
    "midi=()",
    "payment=()",
    "picture-in-picture=()",
    "publickey-credentials-get=()",
    "screen-wake-lock=()",
    "serial=()",
    "usb=()",
    "web-share=()",
    "xr-spatial-tracking=()",
  ].join(", "),
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
} as const;

export function buildShowcasePreviewDocument(
  source: Pick<ShowcaseDesignSource, "title" | "html" | "css">,
) {
  const title = escapeHtml(source.title);
  const css = escapeStyleText(source.css);
  return [
    "<!doctype html>",
    '<html lang="ko">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<meta http-equiv="Content-Security-Policy" content="${SHOWCASE_PREVIEW_CSP}">`,
    `<title>${title}</title>`,
    "<style>",
    SHOWCASE_PREVIEW_BASE_CSS,
    css,
    "</style>",
    "</head>",
    "<body>",
    source.html,
    "</body>",
    "</html>",
  ].join("\n");
}

function escapeStyleText(value: string) {
  return value.replaceAll("<", "\\3c ");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
