import { describe, expect, it } from "vitest";
import { SHOWCASE_VIEWS } from "../app/showcase/PrototypeShowcase";
import { getMissingShowcaseHistoryPreviewIds } from "../app/showcase/ShowcaseHistory";
import {
  getCurrentPrototypeSlots,
  getPastPrototypeVersions,
  selectPrototypeVersions,
  SHOWCASE_VERSION_REGISTRY,
  SHOWCASE_VIEW_IDS,
} from "../app/showcase/showcase-version-registry";

describe("시안 버전 레지스트리", () => {
  it("모든 시안 화면을 빠짐없이 관리한다", () => {
    expect(Object.keys(SHOWCASE_VERSION_REGISTRY)).toEqual(SHOWCASE_VIEW_IDS);
    expect(SHOWCASE_VIEWS.map((view) => view.id)).toEqual(SHOWCASE_VIEW_IDS);
  });

  it("활성 슬롯의 최신 버전만 현재 시안으로 두고 나머지를 시간순으로 보관한다", () => {
    const selection = selectPrototypeVersions({
      comparisonVariants: ["A", "B"],
      revisions: [
        { id: "a-01", variant: "A", sequence: 1 },
        { id: "b-01", variant: "B", sequence: 2 },
        { id: "a-02", variant: "A", sequence: 3 },
        { id: "c-01", variant: "C", sequence: 4 },
      ],
    });

    expect(selection.current.map((slot) => slot.revision?.id)).toEqual([
      "a-02",
      "b-01",
    ]);
    expect(selection.past.map((revision) => revision.id)).toEqual([
      "a-01",
      "c-01",
    ]);
  });

  it("모든 화면에서 현재 시안을 과거 시안과 중복시키지 않는다", () => {
    for (const view of SHOWCASE_VIEW_IDS) {
      const currentIds = new Set(
        getCurrentPrototypeSlots(view).flatMap((slot) => {
          return slot.revision ? [slot.revision.id] : [];
        }),
      );
      const past = getPastPrototypeVersions(view);
      const sequences = past.map((revision) => revision.sequence);

      expect(past.some((revision) => currentIds.has(revision.id))).toBe(false);
      expect(sequences).toEqual([...sequences].sort((left, right) => left - right));
      expect(new Set(past.map((revision) => revision.id)).size).toBe(past.length);
    }
  });

  it("기존 공고 카드 변경 과정과 보관 미리보기를 빠짐없이 유지한다", () => {
    expect(getPastPrototypeVersions("notice-card").map((revision) => revision.id))
      .toEqual(["b-01", "c-01", "b-02", "b-03", "c"]);
    expect(getMissingShowcaseHistoryPreviewIds()).toEqual([]);
  });
});
