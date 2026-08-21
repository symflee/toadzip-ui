import { describe, expect, it } from "vitest";
import {
  formatNoticeDate,
  HOUSING_NOTICES,
  noticeDeadlineContext,
  noticeDeadlineLabel,
  noticeStatusLabel,
} from "../app/housing-notice-data";
import { HOUSING_LISTINGS } from "../app/housing-data";

const listingById = new Map(HOUSING_LISTINGS.map((listing) => [listing.id, listing]));

describe("housing notice data", () => {
  it("공고 목록 카드에 필요한 속성을 독립된 공고 모델로 제공한다", () => {
    expect(HOUSING_NOTICES.length).toBeGreaterThan(0);
    expect(new Set(HOUSING_NOTICES.map((notice) => notice.id)).size).toBe(
      HOUSING_NOTICES.length,
    );

    for (const notice of HOUSING_NOTICES) {
      expect(notice.rentalType).not.toBe("");
      expect(notice.title).not.toBe("");
      expect(notice.region).not.toBe("");
      expect(notice.applyStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(notice.applyEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(notice.viewCount).toBeGreaterThanOrEqual(0);
      expect(notice.units).toBeGreaterThan(0);
      expect(notice.provider).not.toBe("");
      expect(["new", "reserve"]).toContain(notice.recruitmentKind);
      expect(["original", "corrected"]).toContain(notice.revision);
    }
  });

  it("하나의 공고가 여러 공급 단지와 단지별 주택형을 중첩해 제공한다", () => {
    const notice = HOUSING_NOTICES.find((item) => {
      return item.details.supplyComplexes.length > 1;
    });

    expect(notice).toBeDefined();
    const complexes = notice?.details.supplyComplexes ?? [];
    expect(new Set(complexes.map((complex) => complex.id)).size).toBe(complexes.length);
    expect(
      complexes.reduce((total, complex) => total + complex.suppliedHouseholds, 0),
    ).toBe(notice?.units);

    for (const complex of complexes) {
      expect(complex.housingTypes.length).toBeGreaterThan(0);
      expect(
        complex.housingTypes.reduce((total, housingType) => total + housingType.units, 0),
      ).toBe(complex.suppliedHouseholds);
    }
  });

  it("상태와 정정 여부를 분리하고 날짜 및 디데이 표시를 만든다", () => {
    const open = HOUSING_NOTICES.find((notice) => notice.status === "open");
    const corrected = HOUSING_NOTICES.find((notice) => notice.revision === "corrected");

    expect(open).toBeDefined();
    expect(corrected).toBeDefined();
    expect(noticeStatusLabel(open?.status ?? "open")).toBe("접수중");
    expect(noticeDeadlineContext()).toBe("접수 마감");
    expect(noticeDeadlineLabel(open ?? HOUSING_NOTICES[0])).toMatch(/^D-/);
    expect(formatNoticeDate(HOUSING_NOTICES[0].applyStart)).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });

  it("접수예정 공고도 접수 시작일이 아닌 접수 마감일 기준 디데이를 제공한다", () => {
    const upcoming = HOUSING_NOTICES.find((notice) => notice.status === "upcoming");
    expect(upcoming).toBeDefined();

    const sourceId = upcoming?.details.supplyComplexes[0]?.id ?? "";
    const source = listingById.get(sourceId);
    expect(source?.daysLeft).not.toBeNull();

    const applicationDays = (
      Date.parse(upcoming?.applyEnd ?? "") - Date.parse(upcoming?.applyStart ?? "")
    ) / 86_400_000;
    expect(upcoming?.daysLeft).toBe((source?.daysLeft ?? 0) + applicationDays);
  });

  it("공고 상세이 원본 단지와 연결되고 공급 세대 합계가 일치한다", () => {
    for (const notice of HOUSING_NOTICES) {
      expect(notice.details.supplyComplexes.length).toBeGreaterThan(0);

      const suppliedUnits = notice.details.supplyComplexes.reduce(
        (total, complex) => total + complex.suppliedHouseholds,
        0,
      );
      expect(suppliedUnits).toBe(notice.units);

      for (const complex of notice.details.supplyComplexes) {
        const source = listingById.get(complex.id);
        const housingTypeUnits = complex.housingTypes.reduce(
          (total, housingType) => total + housingType.units,
          0,
        );
        expect(source).toBeDefined();
        expect(complex.address).toBe(source?.complexDetails.address);
        expect(complex.overviewImageUrl).toBe(source?.complexDetails.overviewImageUrl);
        expect(complex.totalHouseholds).toBe(source?.complexDetails.totalHouseholds);
        expect(housingTypeUnits).toBe(complex.suppliedHouseholds);
      }
    }
  });

  it("공고별 주택형의 공급구분과 임대조건을 제공한다", () => {
    const allHousingTypes = HOUSING_NOTICES.flatMap((notice) => {
      return notice.details.supplyComplexes.flatMap((complex) => complex.housingTypes);
    });

    expect(allHousingTypes.some((housingType) => housingType.supplyKind === "new")).toBe(true);
    expect(allHousingTypes.some((housingType) => housingType.supplyKind === "resupply")).toBe(true);
    for (const housingType of allHousingTypes) {
      expect(housingType.code).not.toBe("");
      expect(housingType.roomLabel).not.toBe("");
      expect(housingType.units).toBeGreaterThan(0);
      expect(housingType.exclusiveAreaSquareMeters).toBeGreaterThan(0);
      expect(housingType.depositWon).toBeGreaterThan(0);
      expect(housingType.monthlyRentWon).toBeGreaterThan(0);
      expect(housingType).toHaveProperty("floorPlanUrl");
      expect(housingType).toHaveProperty("floorPlan3dUrl");
    }
  });

  it("게시일부터 입주 예정월까지 상세 공급 일정이 시간순으로 이어진다", () => {
    for (const notice of HOUSING_NOTICES) {
      const schedule = notice.details.schedule;
      expect(schedule.map((step) => step.id)).toEqual([
        "published",
        "application",
        "result",
        "contract",
        "move-in",
      ]);
      expect(schedule[0]?.startAt).toBe(notice.publishedAt);
      expect(schedule[1]?.startAt).toBe(notice.applyStart);
      expect(schedule[1]?.endAt).toBe(notice.applyEnd);
      expect(schedule.at(-1)?.startAt.startsWith(notice.details.moveInMonth)).toBe(true);

      const startTimes = schedule.map((step) => Date.parse(step.startAt));
      expect(startTimes.every(Number.isFinite)).toBe(true);
      expect(startTimes).toEqual([...startTimes].sort((left, right) => left - right));
    }
  });

  it("문서·대상·자격·경쟁률 예측 필드를 안전하게 제공한다", () => {
    for (const notice of HOUSING_NOTICES) {
      expect(notice.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(notice.details.address).not.toBe("");
      expect(notice.details.documentName).toMatch(/\.pdf$/i);
      expect(notice.details).toHaveProperty("pdfUrl");
      expect(notice.details).toHaveProperty("sourceUrl");
      expect(notice.details.audiences).toContain("무주택자");
      expect(notice.details.eligibilityTags.length).toBeGreaterThan(0);
      expect(notice.details.predictedCompetitionRate).not.toBeNull();
      expect(notice.details.predictedCompetitionRate ?? 0).toBeGreaterThan(0);
    }
  });
});
