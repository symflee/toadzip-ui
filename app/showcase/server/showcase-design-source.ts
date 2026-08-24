import "server-only";

import type {
  ShowcaseDesignSource,
  ShowcaseDesignSourceKind,
} from "../showcase-design-types";
import { isShowcaseDesignUuid } from "../showcase-design-identifiers";
import { getBuiltinShowcaseDesignSource } from "../showcase-source-catalog";
import { loadSubmittedShowcaseDesignSource } from "./showcase-design-dal";

export type ShowcaseDesignSourceResult =
  | { status: "ready"; source: ShowcaseDesignSource }
  | { status: "not-found" }
  | { status: "unavailable"; message: string };

export async function resolveShowcaseDesignSource(
  sourceKind: ShowcaseDesignSourceKind,
  id: string,
): Promise<ShowcaseDesignSourceResult> {
  if (sourceKind === "builtin") {
    if (!/^[a-z0-9](?:[a-z0-9-]{0,79})$/.test(id)) {
      return { status: "not-found" };
    }
    const source = getBuiltinShowcaseDesignSource(id);
    if (!source) {
      return { status: "not-found" };
    }
    return { status: "ready", source };
  }
  if (!isShowcaseDesignUuid(id)) {
    return { status: "not-found" };
  }
  return loadSubmittedShowcaseDesignSource(id);
}

export function isShowcaseDesignSourceKind(
  value: string,
): value is ShowcaseDesignSourceKind {
  return value === "builtin" || value === "submitted";
}
