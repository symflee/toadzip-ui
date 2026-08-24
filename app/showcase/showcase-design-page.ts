import { encodeShowcaseDesignCursor } from "./showcase-design-cursor";
import {
  SHOWCASE_DESIGN_PAGE_SIZE,
  type ShowcaseDesignPage,
  type ShowcaseDesignSummary,
} from "./showcase-design-types";

export function createReadyShowcaseDesignPage(
  fetchedItems: ShowcaseDesignSummary[],
): ShowcaseDesignPage {
  const items = fetchedItems.slice(0, SHOWCASE_DESIGN_PAGE_SIZE);
  const hasNextPage = fetchedItems.length > SHOWCASE_DESIGN_PAGE_SIZE;
  const lastItem = items.at(-1);
  return {
    status: "ready",
    items,
    nextCursor: hasNextPage && lastItem?.sequence
      ? encodeShowcaseDesignCursor(lastItem.sequence)
      : null,
  };
}
