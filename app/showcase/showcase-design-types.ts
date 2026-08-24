import type { ShowcaseView } from "./showcase-version-registry";

export const SHOWCASE_DESIGN_PAGE_SIZE = 12;
export const SHOWCASE_DESIGN_CODE_BYTE_LIMIT = 512 * 1024;
export const SHOWCASE_DESIGN_TITLE_LENGTH_LIMIT = 80;
export const SHOWCASE_DESIGN_DESCRIPTION_LENGTH_LIMIT = 300;

export type ShowcaseDesignSourceKind = "builtin" | "submitted";

export interface ShowcaseDesignSummary {
  id: string;
  sourceKind: ShowcaseDesignSourceKind;
  viewId: ShowcaseView;
  sequence: number | null;
  title: string;
  description: string | null;
  createdAt: string | null;
  previewUrl: string;
  sourceUrl: string;
}

export interface ShowcaseDesignSource extends ShowcaseDesignSummary {
  html: string;
  css: string;
}

export interface CreateShowcaseDesignInput {
  submissionKey: string;
  viewId: ShowcaseView;
  title: string;
  description: string;
  html: string;
  css: string;
}

export type CreateShowcaseDesignField = keyof CreateShowcaseDesignInput;

export interface ShowcaseDesignValidationIssue {
  field: CreateShowcaseDesignField;
  message: string;
  line?: number;
  column?: number;
}

export type ShowcaseDesignFieldErrors = Partial<
  Record<CreateShowcaseDesignField, string[]>
>;

export type ShowcaseDesignPage =
  | {
      status: "ready";
      items: ShowcaseDesignSummary[];
      nextCursor: string | null;
    }
  | {
      status: "unavailable";
      items: [];
      nextCursor: null;
      message: string;
    };

export type ShowcaseDesignActionResult =
  | {
      status: "success";
      design: ShowcaseDesignSummary;
    }
  | {
      status: "validation-error";
      fieldErrors: ShowcaseDesignFieldErrors;
      issues: ShowcaseDesignValidationIssue[];
    }
  | {
      status: "unavailable" | "error";
      message: string;
    };
