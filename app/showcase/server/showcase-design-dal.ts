import "server-only";

import { neon } from "@neondatabase/serverless";
import { and, desc, eq, lt } from "drizzle-orm";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import {
  SHOWCASE_DESIGN_PAGE_SIZE,
  type CreateShowcaseDesignInput,
  type ShowcaseDesignPage,
  type ShowcaseDesignSource,
  type ShowcaseDesignSummary,
} from "../showcase-design-types";
import {
  decodeShowcaseDesignCursor,
} from "../showcase-design-cursor";
import { createReadyShowcaseDesignPage } from "../showcase-design-page";
import { withShowcaseDesignUrls } from "../showcase-design-paths";
import type { ShowcaseView } from "../showcase-version-registry";
import {
  showcaseDesigns,
  type ShowcaseDesignRow,
} from "./showcase-design-schema";
import {
  SubmissionKeyConflictError,
  insertIdempotentShowcaseDesign,
} from "./showcase-design-idempotency";

type ShowcaseDatabase = NeonHttpDatabase<{
  showcaseDesigns: typeof showcaseDesigns;
}>;

type SubmittedDesignSourceResult =
  | { status: "ready"; source: ShowcaseDesignSource }
  | { status: "not-found" }
  | { status: "unavailable"; message: string };

type InsertShowcaseDesignResult =
  | { status: "ready"; design: ShowcaseDesignSummary }
  | { status: "conflict"; message: string }
  | { status: "unavailable"; message: string };

type ShowcaseDesignSummaryRow = Pick<
  ShowcaseDesignRow,
  "id" | "viewId" | "sequence" | "title" | "description" | "createdAt"
>;

const SHOWCASE_DESIGN_SUMMARY_COLUMNS = {
  id: showcaseDesigns.id,
  viewId: showcaseDesigns.viewId,
  sequence: showcaseDesigns.sequence,
  title: showcaseDesigns.title,
  description: showcaseDesigns.description,
  createdAt: showcaseDesigns.createdAt,
};

const SHOWCASE_DESIGN_IDEMPOTENT_COLUMNS = {
  ...SHOWCASE_DESIGN_SUMMARY_COLUMNS,
  submissionKey: showcaseDesigns.submissionKey,
};

let cachedConnection:
  | { connectionString: string; database: ShowcaseDatabase }
  | undefined;

export async function loadShowcaseDesignPage(
  viewId: ShowcaseView,
  before?: string | null,
): Promise<ShowcaseDesignPage> {
  const beforeSequence = readBeforeSequence(before);
  if (before && beforeSequence === null) {
    return unavailablePage("등록 시안 목록의 다음 위치를 확인할 수 없습니다.");
  }
  try {
    const database = getDatabase();
    if (database === null) {
      return unavailablePage("등록 시안 저장소가 아직 연결되지 않았습니다.");
    }
    return await selectDesignPage(database, viewId, beforeSequence);
  } catch {
    return unavailablePage("등록 시안을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export async function loadSubmittedShowcaseDesignSource(
  id: string,
): Promise<SubmittedDesignSourceResult> {
  try {
    const database = getDatabase();
    if (database === null) {
      return {
        status: "unavailable",
        message: "등록 시안 저장소가 아직 연결되지 않았습니다.",
      };
    }
    const [row] = await database
      .select()
      .from(showcaseDesigns)
      .where(eq(showcaseDesigns.id, id))
      .limit(1);
    if (!row) {
      return { status: "not-found" };
    }
    return { status: "ready", source: toSource(row) };
  } catch {
    return {
      status: "unavailable",
      message: "등록 시안 코드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export async function insertShowcaseDesign(
  input: CreateShowcaseDesignInput,
): Promise<InsertShowcaseDesignResult> {
  try {
    const database = getDatabase();
    if (database === null) {
      return {
        status: "unavailable",
        message: "등록 시안 저장소가 아직 연결되지 않았습니다.",
      };
    }
    const design = await insertOrLoadDesign(database, input);
    return { status: "ready", design };
  } catch (error) {
    if (error instanceof SubmissionKeyConflictError) {
      return {
        status: "conflict",
        message: "동일한 등록 요청 식별자가 다른 시안에 사용되었습니다.",
      };
    }
    return {
      status: "unavailable",
      message: "시안을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

async function selectDesignPage(
  database: ShowcaseDatabase,
  viewId: ShowcaseView,
  beforeSequence: number | null,
): Promise<ShowcaseDesignPage> {
  const where = beforeSequence === null
    ? eq(showcaseDesigns.viewId, viewId)
    : and(
        eq(showcaseDesigns.viewId, viewId),
        lt(showcaseDesigns.sequence, beforeSequence),
      );
  const rows = await database
    .select(SHOWCASE_DESIGN_SUMMARY_COLUMNS)
    .from(showcaseDesigns)
    .where(where)
    .orderBy(desc(showcaseDesigns.sequence))
    .limit(SHOWCASE_DESIGN_PAGE_SIZE + 1);
  return createReadyShowcaseDesignPage(rows.map(toSummary));
}

async function insertOrLoadDesign(
  database: ShowcaseDatabase,
  input: CreateShowcaseDesignInput,
) {
  const row = await insertIdempotentShowcaseDesign({
    async insertIfAbsent(value) {
      const inserted = await database
        .insert(showcaseDesigns)
        .values({
          viewId: value.viewId,
          submissionKey: value.submissionKey,
          title: value.title,
          description: value.description || null,
          html: value.html,
          css: value.css,
        })
        .onConflictDoNothing({ target: showcaseDesigns.submissionKey })
        .returning(SHOWCASE_DESIGN_IDEMPOTENT_COLUMNS);
      return inserted[0] ?? null;
    },
    async findBySubmissionKey(submissionKey) {
      return selectBySubmissionKey(database, submissionKey);
    },
    matchesInput(row, value) {
      return matchesStoredInput(row, value);
    },
  }, input);
  return toSummary(row);
}

async function selectBySubmissionKey(
  database: ShowcaseDatabase,
  submissionKey: string,
) {
  const [row] = await database
    .select()
    .from(showcaseDesigns)
    .where(eq(showcaseDesigns.submissionKey, submissionKey))
    .limit(1);
  return row;
}

function getDatabase(): ShowcaseDatabase | null {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    return null;
  }
  if (cachedConnection?.connectionString === connectionString) {
    return cachedConnection.database;
  }
  const database = drizzle(neon(connectionString), {
    schema: { showcaseDesigns },
  });
  cachedConnection = { connectionString, database };
  return database;
}

function matchesStoredInput(
  row: ShowcaseDesignRow,
  input: CreateShowcaseDesignInput,
) {
  return row.submissionKey === input.submissionKey
    && row.viewId === input.viewId
    && row.title === input.title
    && (row.description ?? "") === input.description
    && row.html === input.html
    && row.css === input.css;
}

function toSummary(row: ShowcaseDesignSummaryRow): ShowcaseDesignSummary {
  return withShowcaseDesignUrls({
    id: row.id,
    sourceKind: "submitted",
    viewId: row.viewId as ShowcaseView,
    sequence: row.sequence,
    title: row.title,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
  });
}

function toSource(row: ShowcaseDesignRow): ShowcaseDesignSource {
  return {
    ...toSummary(row),
    html: row.html,
    css: row.css,
  };
}

function readBeforeSequence(before?: string | null) {
  if (!before) {
    return null;
  }
  return decodeShowcaseDesignCursor(before);
}

function unavailablePage(message: string): ShowcaseDesignPage {
  return {
    status: "unavailable",
    items: [],
    nextCursor: null,
    message,
  };
}
