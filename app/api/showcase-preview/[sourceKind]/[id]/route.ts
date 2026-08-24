import {
  SHOWCASE_PREVIEW_HEADERS,
  buildShowcasePreviewDocument,
} from "../../../../showcase/server/showcase-preview-document";
import {
  isShowcaseDesignSourceKind,
  resolveShowcaseDesignSource,
} from "../../../../showcase/server/showcase-design-source";

type RouteParameters = {
  params: Promise<{ sourceKind: string; id: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteParameters) {
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
  return new Response(buildShowcasePreviewDocument(result.source), {
    headers: SHOWCASE_PREVIEW_HEADERS,
  });
}

function errorResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: SHOWCASE_PREVIEW_HEADERS,
  });
}
