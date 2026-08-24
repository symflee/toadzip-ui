import type { ShowcaseDesignPage } from "../../showcase/showcase-design-types";
import { decodeShowcaseDesignCursor } from "../../showcase/showcase-design-cursor";
import { isShowcaseView } from "../../showcase/showcase-design-validation";
import { loadShowcaseDesignPage } from "../../showcase/server/showcase-design-dal";

export const dynamic = "force-dynamic";

const LIST_JSON_HEADERS = {
  "Cache-Control": "private, no-store",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
} as const;

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const viewId = searchParams.get("view");
  const before = searchParams.get("before");
  if (!viewId || !isShowcaseView(viewId)) {
    return unavailableResponse("등록 시안의 UI 요소를 확인해 주세요.", 400);
  }
  if (before !== null && decodeShowcaseDesignCursor(before) === null) {
    return unavailableResponse("등록 시안 목록의 다음 위치를 확인할 수 없습니다.", 400);
  }
  const page = await loadShowcaseDesignPage(viewId, before);
  const status = page.status === "ready" ? 200 : 503;
  return Response.json(page, {
    status,
    headers: LIST_JSON_HEADERS,
  });
}

function unavailableResponse(message: string, status: number) {
  const page: ShowcaseDesignPage = {
    status: "unavailable",
    items: [],
    nextCursor: null,
    message,
  };
  return Response.json(page, {
    status,
    headers: LIST_JSON_HEADERS,
  });
}
