import type {
  ShowcaseDesignSourceKind,
  ShowcaseDesignSummary,
} from "./showcase-design-types";
import type { ShowcaseView } from "./showcase-version-registry";

export function getShowcasePath(viewId: ShowcaseView) {
  if (viewId === "notice-card") {
    return "/showcase";
  }
  return `/showcase/${viewId}`;
}

export function getShowcaseDesignPreviewUrl(
  sourceKind: ShowcaseDesignSourceKind,
  id: string,
) {
  return `/api/showcase-preview/${sourceKind}/${encodeURIComponent(id)}`;
}

export function getShowcaseDesignSourceUrl(
  sourceKind: ShowcaseDesignSourceKind,
  id: string,
) {
  return `/api/showcase-designs/${sourceKind}/${encodeURIComponent(id)}/source`;
}

export function withShowcaseDesignUrls(
  summary: Omit<ShowcaseDesignSummary, "previewUrl" | "sourceUrl">,
): ShowcaseDesignSummary {
  return {
    ...summary,
    previewUrl: getShowcaseDesignPreviewUrl(summary.sourceKind, summary.id),
    sourceUrl: getShowcaseDesignSourceUrl(summary.sourceKind, summary.id),
  };
}
