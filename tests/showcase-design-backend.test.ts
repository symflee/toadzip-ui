import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { GET as getDesignPage } from "../app/api/showcase-designs/route";
import { GET as getDesignSource } from "../app/api/showcase-designs/[sourceKind]/[id]/source/route";
import { GET as getDesignPreview } from "../app/api/showcase-preview/[sourceKind]/[id]/route";
import {
  decodeShowcaseDesignCursor,
  encodeShowcaseDesignCursor,
} from "../app/showcase/showcase-design-cursor";
import { createReadyShowcaseDesignPage } from "../app/showcase/showcase-design-page";
import type {
  CreateShowcaseDesignInput,
  ShowcaseDesignSummary,
} from "../app/showcase/showcase-design-types";
import { SHOWCASE_PREVIEW_BASE_CSS } from "../app/showcase/showcase-preview-base";
import {
  SubmissionKeyConflictError,
  insertIdempotentShowcaseDesign,
} from "../app/showcase/server/showcase-design-idempotency";
import {
  insertShowcaseDesign,
  loadShowcaseDesignPage,
  loadSubmittedShowcaseDesignSource,
} from "../app/showcase/server/showcase-design-dal";
import {
  SHOWCASE_PREVIEW_CSP,
  SHOWCASE_PREVIEW_HEADERS,
  buildShowcasePreviewDocument,
} from "../app/showcase/server/showcase-preview-document";

const DATABASE_URL = process.env.DATABASE_URL;
const INPUT: CreateShowcaseDesignInput = {
  submissionKey: "98a4f18c-31d6-4c17-a22a-f5e71ff117ba",
  viewId: "notice-card",
  title: "정적 공고 카드",
  description: "설명",
  html: "<article>안전한 시안</article>",
  css: "article { color: navy; }",
};

afterEach(() => {
  if (DATABASE_URL === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = DATABASE_URL;
  }
});

describe("append-only 등록과 cursor pagination", () => {
  it("같은 submission key의 정상·중복·동시 등록을 한 row로 해석한다", async () => {
    const store = new MemoryIdempotentStore();
    const first = await insertIdempotentShowcaseDesign(store, INPUT);
    const duplicate = await insertIdempotentShowcaseDesign(store, INPUT);
    const concurrentKey = "5bb60d39-77e4-42e0-9f62-1692568fc867";
    const concurrentInput = { ...INPUT, submissionKey: concurrentKey };
    const concurrent = await Promise.all([
      insertIdempotentShowcaseDesign(store, concurrentInput),
      insertIdempotentShowcaseDesign(store, concurrentInput),
    ]);

    expect(first).toBe(duplicate);
    expect(concurrent[0]).toBe(concurrent[1]);
    expect(store.rows).toHaveLength(2);

    await expect(insertIdempotentShowcaseDesign(store, {
      ...INPUT,
      title: "같은 key의 다른 시안",
    })).rejects.toBeInstanceOf(SubmissionKeyConflictError);
  });

  it("최신순으로 받은 13개에서 12개와 opaque next cursor만 공개한다", () => {
    const fetched = Array.from({ length: 13 }, (_, index) => design(30 - index));
    const page = createReadyShowcaseDesignPage(fetched);

    expect(page.status).toBe("ready");
    if (page.status !== "ready") return;
    expect(page.items).toHaveLength(12);
    expect(page.items.map((item) => item.sequence)).toEqual([
      30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19,
    ]);
    expect(page.nextCursor).toBe(encodeShowcaseDesignCursor(19));
    expect(decodeShowcaseDesignCursor(page.nextCursor ?? "")).toBe(19);
    expect(decodeShowcaseDesignCursor("19")).toBeNull();
  });

  it("DATABASE_URL이 없으면 page read가 예외 없이 unavailable로 저하된다", async () => {
    delete process.env.DATABASE_URL;

    await expect(loadShowcaseDesignPage("notice-card")).resolves.toEqual({
      status: "unavailable",
      items: [],
      nextCursor: null,
      message: expect.stringContaining("연결"),
    });
    const response = await getDesignPage(new Request(
      "http://localhost/api/showcase-designs?view=notice-card",
    ));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      status: "unavailable",
      items: [],
    }));
  });

  it("DATABASE_URL 형식이 잘못되어도 모든 DAL 진입점이 unavailable로 저하된다", async () => {
    process.env.DATABASE_URL = "not-a-database-url";

    await expect(loadShowcaseDesignPage("notice-card")).resolves.toMatchObject({
      status: "unavailable",
      items: [],
    });
    await expect(loadSubmittedShowcaseDesignSource(
      "98a4f18c-31d6-4c17-a22a-f5e71ff117ba",
    )).resolves.toMatchObject({ status: "unavailable" });
    await expect(insertShowcaseDesign(INPUT)).resolves.toMatchObject({
      status: "unavailable",
    });
  });

  it("목록 Route Handler가 화면과 cursor query를 검증한다", async () => {
    const invalidView = await getDesignPage(new Request(
      "http://localhost/api/showcase-designs?view=unknown",
    ));
    const invalidCursor = await getDesignPage(new Request(
      "http://localhost/api/showcase-designs?view=notice-card&before=raw-sequence",
    ));

    expect(invalidView.status).toBe(400);
    expect(invalidCursor.status).toBe(400);
    expect(invalidView.headers.get("cache-control")).toBe("private, no-store");
    expect(invalidView.headers.get("x-content-type-options")).toBe("nosniff");
  });
});

describe("소스와 격리 미리보기 Route Handler", () => {
  it("기존 시안 source를 JSON 그대로 읽고 세 가지 파일 형식으로 다운로드한다", async () => {
    const parameters = Promise.resolve({
      sourceKind: "builtin",
      id: "notice-card-a-current",
    });
    const sourceResponse = await getDesignSource(
      new Request("http://localhost/api/showcase-designs/builtin/notice-card-a-current/source"),
      { params: parameters },
    );
    const source = await sourceResponse.json();
    expect(sourceResponse.status).toBe(200);
    expect(sourceResponse.headers.get("cache-control")).toBe("private, no-store");
    expect(sourceResponse.headers.get("x-content-type-options")).toBe("nosniff");
    expect(source).toEqual(expect.objectContaining({
      id: "notice-card-a-current",
      sourceKind: "builtin",
      html: expect.any(String),
      css: expect.any(String),
    }));

    for (const format of ["html", "css", "combined"] as const) {
      const response = await getDesignSource(
        new Request(`http://localhost/api/showcase-designs/builtin/notice-card-a-current/source?download=${format}`),
        { params: parameters },
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("content-disposition")).toContain("attachment");
      expect((await response.text()).length).toBeGreaterThan(0);
    }

    const missing = await getDesignSource(
      new Request("http://localhost/api/showcase-designs/builtin/missing/source"),
      { params: Promise.resolve({ sourceKind: "builtin", id: "missing" }) },
    );
    expect(missing.status).toBe(404);
    expect(missing.headers.get("cache-control")).toBe("private, no-store");
    expect(missing.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("preview 응답과 오류 응답에 빈 sandbox용 보안 헤더를 고정한다", async () => {
    const response = await getDesignPreview(
      new Request("http://localhost/api/showcase-preview/builtin/notice-card-a-current"),
      { params: Promise.resolve({ sourceKind: "builtin", id: "notice-card-a-current" }) },
    );
    const error = await getDesignPreview(
      new Request("http://localhost/api/showcase-preview/unknown/missing"),
      { params: Promise.resolve({ sourceKind: "unknown", id: "missing" }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-security-policy")).toBe(SHOWCASE_PREVIEW_CSP);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("permissions-policy")).toContain("camera=()");
    expect(response.headers.get("permissions-policy")).toContain("attribution-reporting=()");
    expect(error.headers.get("content-security-policy")).toBe(SHOWCASE_PREVIEW_CSP);
    expect(await response.text()).toContain("Content-Security-Policy");
  });

  it("문서 조립 시 CSS style 종료 문자열과 제목 HTML을 실행 가능한 markup으로 만들지 않는다", () => {
    const document = buildShowcasePreviewDocument({
      title: '<img src=x onerror="alert(1)">',
      html: "<p>본문</p>",
      css: ".card::after { content: '</style><script>alert(1)</script>'; }",
    });

    expect(document).not.toContain("</style><script>");
    expect(document).not.toContain("<title><img");
    expect(document).toContain("\\3c /style>");
    expect(document).toContain(SHOWCASE_PREVIEW_BASE_CSS);
    expect(SHOWCASE_PREVIEW_HEADERS["X-Frame-Options"]).toBe("SAMEORIGIN");
  });
});

describe("Drizzle migration과 runtime 권한", () => {
  it("identity, idempotency, view CHECK, 최신순 index와 append-only role을 선언한다", () => {
    const migration = readFileSync(
      resolve(process.cwd(), "drizzle/0000_create_showcase_designs.sql"),
      "utf8",
    );
    const grants = readFileSync(
      resolve(process.cwd(), "drizzle/runtime-role-grants.sql"),
      "utf8",
    );

    expect(migration).toContain("GENERATED ALWAYS AS IDENTITY");
    expect(migration).toContain("showcase_designs_submission_key_unique");
    expect(migration).toContain("showcase_designs_view_id_check");
    expect(migration).toContain('"view_id","sequence" desc');
    expect(grants).toContain("GRANT SELECT, INSERT");
    expect(grants).toContain("GRANT USAGE ON SCHEMA public");
    expect(grants).toContain("GRANT USAGE ON SEQUENCE");
    expect(grants).toContain("REVOKE CREATE ON SCHEMA public FROM PUBLIC");
    expect(grants).toContain("REVOKE UPDATE, DELETE");
    expect(grants).not.toMatch(/GRANT[^;]*(?:UPDATE|DELETE)/);
  });
});

describe("Server Action 전송 한도", () => {
  it("512KiB 코드와 multipart 여유를 수용하되 앱 검증은 별도로 유지한다", () => {
    const configuration = readFileSync(
      resolve(process.cwd(), "next.config.ts"),
      "utf8",
    );

    expect(configuration).toContain('bodySizeLimit: "2mb"');
  });
});

class MemoryIdempotentStore {
  readonly rows: Array<CreateShowcaseDesignInput & { id: number }> = [];

  async insertIfAbsent(input: CreateShowcaseDesignInput) {
    await Promise.resolve();
    const existing = this.rows.find((row) => row.submissionKey === input.submissionKey);
    if (existing) return null;
    const row = { id: this.rows.length + 1, ...input };
    this.rows.push(row);
    return row;
  }

  async findBySubmissionKey(submissionKey: string) {
    return this.rows.find((row) => row.submissionKey === submissionKey) ?? null;
  }

  matchesInput(
    row: CreateShowcaseDesignInput,
    input: CreateShowcaseDesignInput,
  ) {
    return row.submissionKey === input.submissionKey
      && row.viewId === input.viewId
      && row.title === input.title
      && row.description === input.description
      && row.html === input.html
      && row.css === input.css;
  }
}

function design(sequence: number): ShowcaseDesignSummary {
  return {
    id: `design-${sequence}`,
    sourceKind: "submitted",
    viewId: "notice-card",
    sequence,
    title: `등록 시안 ${sequence}`,
    description: null,
    createdAt: "2026-08-24T03:00:00.000Z",
    previewUrl: `/api/showcase-preview/submitted/design-${sequence}`,
    sourceUrl: `/api/showcase-designs/submitted/design-${sequence}/source`,
  };
}
