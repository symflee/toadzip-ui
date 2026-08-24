import { describe, expect, it } from "vitest";
import {
  BUILT_IN_SHOWCASE_SOURCE_BY_ID,
  BUILT_IN_SHOWCASE_SOURCE_CATALOG,
  BUILT_IN_SHOWCASE_SOURCES,
  getBuiltInShowcaseSource,
  getBuiltInShowcaseSourceById,
  getBuiltInShowcaseSources,
  getBuiltinShowcaseDesignSource,
} from "../app/showcase/showcase-source-catalog";
import { validateShowcaseDesignInput } from "../app/showcase/showcase-design-validation";
import {
  SHOWCASE_VERSION_REGISTRY,
  SHOWCASE_VIEW_IDS,
} from "../app/showcase/showcase-version-registry";

const FORBIDDEN_HTML_PATTERNS = [
  /<(?:script|style|form|iframe|object|embed|meta|base|link|noscript)\b/i,
  /\son[a-z]+\s*=/i,
  /\sstyle\s*=/i,
  /\s(?:src|srcset|href|action|formaction)\s*=\s*["']\s*(?:https?:|\/\/)/i,
  /javascript\s*:/i,
  /\sattributionsrc\s*=/i,
] as const;

const FORBIDDEN_CSS_PATTERNS = [
  /@import\b/i,
  /url\s*\(/i,
  /expression\s*\(/i,
  /javascript\s*:/i,
  /behavior\s*:/i,
] as const;

describe("기존 시안 HTML/CSS source 카탈로그", () => {
  it("레지스트리의 15개 revision을 전역에서 유일한 id로 관리한다", () => {
    const revisionIds = registryEntries().map(({ revisionId }) => revisionId);

    expect(revisionIds).toHaveLength(15);
    expect(new Set(revisionIds).size).toBe(revisionIds.length);
    expect(Object.keys(BUILT_IN_SHOWCASE_SOURCE_BY_ID)).toHaveLength(15);
  });

  it("모든 레지스트리 revision에 정확히 한 개의 source를 제공한다", () => {
    const registryKeys = registryEntries().map(toEntryKey).sort();
    const sourceKeys = BUILT_IN_SHOWCASE_SOURCES.map(toEntryKey).sort();

    expect(sourceKeys).toEqual(registryKeys);
    expect(new Set(sourceKeys).size).toBe(sourceKeys.length);
    expect(Object.keys(BUILT_IN_SHOWCASE_SOURCE_CATALOG)).toEqual(
      SHOWCASE_VIEW_IDS,
    );
  });

  it("각 source는 비어 있지 않은 유효한 HTML fragment와 독립 CSS를 갖는다", () => {
    for (const source of BUILT_IN_SHOWCASE_SOURCES) {
      const template = document.createElement("template");
      template.innerHTML = source.html;

      expect(source.html.trim(), source.revisionId).not.toBe("");
      expect(source.css.trim(), source.revisionId).not.toBe("");
      expect(template.content.children.length, source.revisionId).toBe(1);
      expect(source.css, source.revisionId).toContain(":root");
      expect(source.css, source.revisionId).toContain("body");
    }
  });

  it("JavaScript, 위험 태그, inline style과 외부 네트워크 참조를 포함하지 않는다", () => {
    for (const source of BUILT_IN_SHOWCASE_SOURCES) {
      for (const pattern of FORBIDDEN_HTML_PATTERNS) {
        expect(source.html, `${source.revisionId}: ${pattern}`).not.toMatch(pattern);
      }
      for (const pattern of FORBIDDEN_CSS_PATTERNS) {
        expect(source.css, `${source.revisionId}: ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("15개 source 모두 등록 시안과 같은 parser 기반 보안 검증을 통과한다", () => {
    for (const source of BUILT_IN_SHOWCASE_SOURCES) {
      const result = validateShowcaseDesignInput({
        submissionKey: "98a4f18c-31d6-4c17-a22a-f5e71ff117ba",
        viewId: source.viewId,
        title: source.revisionId,
        description: "",
        html: source.html,
        css: source.css,
      });

      expect(result.success, source.revisionId).toBe(true);
    }
  });

  it("화면별, 전역 id별 getter와 공개 source DTO를 일관되게 제공한다", () => {
    const source = getBuiltInShowcaseSource("notice-card", "b-01");

    expect(source).toBe(getBuiltInShowcaseSourceById("b-01"));
    expect(getBuiltInShowcaseSources("notice-card").map((item) => item.revisionId))
      .toEqual([
        "notice-card-a-current",
        "b-01",
        "c-01",
        "b-02",
        "b-03",
        "c",
        "notice-card-b-current",
      ]);
    expect(getBuiltInShowcaseSourceById("missing-revision")).toBeNull();
    expect(getBuiltinShowcaseDesignSource("missing-revision")).toBeNull();
    expect(getBuiltinShowcaseDesignSource("b-01")).toMatchObject({
      id: "b-01",
      sourceKind: "builtin",
      viewId: "notice-card",
      sequence: 1,
      title: "접수 판단 우선형",
      createdAt: null,
      previewUrl: "/api/showcase-preview/builtin/b-01",
      sourceUrl: "/api/showcase-designs/builtin/b-01/source",
      html: source?.html,
      css: source?.css,
    });
  });
});

function registryEntries() {
  return SHOWCASE_VIEW_IDS.flatMap((viewId) => {
    return SHOWCASE_VERSION_REGISTRY[viewId].revisions.map((revision) => ({
      viewId,
      revisionId: revision.id,
    }));
  });
}

function toEntryKey(entry: { viewId: string; revisionId: string }) {
  return `${entry.viewId}:${entry.revisionId}`;
}
