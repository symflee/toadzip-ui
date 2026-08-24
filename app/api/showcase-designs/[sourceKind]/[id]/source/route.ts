import {
  isShowcaseDesignSourceKind,
  resolveShowcaseDesignSource,
} from "../../../../../showcase/server/showcase-design-source";
import type { ShowcaseDesignSource } from "../../../../../showcase/showcase-design-types";
import { buildShowcasePreviewDocument } from "../../../../../showcase/server/showcase-preview-document";

type RouteParameters = {
  params: Promise<{ sourceKind: string; id: string }>;
};

type DownloadFormat = "html" | "css" | "combined";

export const dynamic = "force-dynamic";

const SOURCE_JSON_HEADERS = {
  "Cache-Control": "private, no-store",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
} as const;

export async function GET(request: Request, context: RouteParameters) {
  const { sourceKind, id } = await context.params;
  if (!isShowcaseDesignSourceKind(sourceKind)) {
    return errorResponse("시안 종류를 확인해 주세요.", 400);
  }
  const result = await resolveShowcaseDesignSource(sourceKind, id);
  if (result.status === "not-found") {
    return errorResponse("시안을 찾을 수 없습니다.", 404);
  }
  if (result.status === "unavailable") {
    return errorResponse(result.message, 503);
  }
  const download = new URL(request.url).searchParams.get("download");
  if (download === null) {
    return Response.json(result.source, {
      headers: SOURCE_JSON_HEADERS,
    });
  }
  if (!isDownloadFormat(download)) {
    return errorResponse("다운로드 형식을 확인해 주세요.", 400);
  }
  return createDownloadResponse(download, result.source);
}

function errorResponse(message: string, status: number) {
  return Response.json({ message }, {
    status,
    headers: SOURCE_JSON_HEADERS,
  });
}

function createDownloadResponse(
  format: DownloadFormat,
  source: ShowcaseDesignSource,
) {
  const extension = format === "css" ? "css" : "html";
  const body = getDownloadBody(format, source);
  const contentType = format === "css"
    ? "text/css; charset=utf-8"
    : "text/html; charset=utf-8";
  return new Response(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="showcase-${safeFilename(source.id)}-${format}.${extension}"`,
      "Content-Type": contentType,
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function getDownloadBody(
  format: DownloadFormat,
  source: Parameters<typeof buildShowcasePreviewDocument>[0] & { html: string; css: string },
) {
  if (format === "html") {
    return source.html;
  }
  if (format === "css") {
    return source.css;
  }
  return buildShowcasePreviewDocument(source);
}

function safeFilename(value: string) {
  const filename = value.replace(/[^a-z0-9_-]/gi, "-").slice(0, 80);
  return filename || "design";
}

function isDownloadFormat(value: string): value is DownloadFormat {
  return value === "html" || value === "css" || value === "combined";
}
