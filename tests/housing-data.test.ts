import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  DEFAULT_PROFILE,
  HOUSING_LISTINGS,
  clusterListings,
  eligibilityMatch,
  filterListings,
  formatMoney,
  sortListings,
  type HousingListing,
  type MapViewport,
} from "../app/housing-data";

const baseListing = HOUSING_LISTINGS[0];

function listing(
  id: string,
  changes: Partial<HousingListing> = {},
): HousingListing {
  return { ...baseListing, id, title: `예시 매물 ${id}`, ...changes };
}

describe("filterListings", () => {
  it("검색어와 여러 필터를 함께 적용한다", () => {
    const listings = [
      listing("match", {
        title: "위례 청년 행복주택",
        provider: "LH",
        rentalType: "행복주택",
        audience: ["청년"],
        areaSquareMeters: 36,
        depositWon: 32_000_000,
        monthlyRentWon: 128_000,
        status: "open",
      }),
      listing("wrong-provider", {
        title: "위례 청년 행복주택",
        provider: "GH",
        rentalType: "행복주택",
        audience: ["청년"],
        areaSquareMeters: 36,
        depositWon: 32_000_000,
        monthlyRentWon: 128_000,
        status: "open",
      }),
      listing("too-expensive", {
        title: "위례 청년 행복주택",
        provider: "LH",
        rentalType: "행복주택",
        audience: ["청년"],
        areaSquareMeters: 36,
        depositWon: 32_000_000,
        monthlyRentWon: 210_000,
        status: "open",
      }),
    ];

    const result = filterListings(listings, {
      ...DEFAULT_FILTERS,
      query: "위례",
      statuses: ["open"],
      rentalTypes: ["행복주택"],
      maxMonthlyRentWon: 150_000,
      maxDepositWon: 40_000_000,
      minAreaSquareMeters: 30,
      maxAreaSquareMeters: 40,
      providers: ["LH"],
      audiences: ["청년"],
    });

    expect(result.map(({ id }) => id)).toEqual(["match"]);
  });

  it("조건과 지도 영역에 해당하는 매물이 없으면 빈 목록을 반환한다", () => {
    const viewport: MapViewport = {
      north: 35.3,
      south: 35.0,
      east: 129.3,
      west: 129.0,
      zoom: 13,
    };

    expect(
      filterListings(HOUSING_LISTINGS, {
        ...DEFAULT_FILTERS,
        query: "존재하지 않는 공고",
      }, viewport),
    ).toEqual([]);
  });

  it("내 조건만 보기에서는 기본 프로필과 네 개 이상 일치한 매물만 남긴다", () => {
    const listings = [
      listing("eligible", {
        eligibilityTags: [
          "homeless",
          "household-youth",
          "size-one",
          "income-under-70",
          "asset-standard",
        ],
      }),
      listing("ineligible", {
        eligibilityTags: [
          "homeless",
          "household-senior",
          "size-three-plus",
          "income-under-70",
          "asset-low",
        ],
      }),
    ];

    const result = filterListings(listings, {
      ...DEFAULT_FILTERS,
      profileOnly: true,
    });

    expect(result.map(({ id }) => id)).toEqual(["eligible"]);
  });
});

describe("PDF 공고 기반 단지 데이터", () => {
  it("기존 prototype mock을 유지하면서 세 공고의 단지를 추가한다", () => {
    const prototypeListings = HOUSING_LISTINGS.filter((item) => {
      return item.sourceKind === "prototype";
    });
    const documentListings = HOUSING_LISTINGS.filter((item) => {
      return item.sourceKind === "notice-document";
    });

    expect(prototypeListings.length).toBeGreaterThan(0);
    expect(documentListings.map((item) => item.id)).toEqual([
      "pdf-jeonju-samcheon6",
      "pdf-gimhae-jinyeong-centumcube",
      "pdf-busan-myeongji-happy",
    ]);
    expect(documentListings.every((item) => item.status === "closed")).toBe(true);
  });

  it("공고문의 단지 규모와 주택형별 임대조건을 보존한다", () => {
    const samcheon = HOUSING_LISTINGS.find((item) => {
      return item.id === "pdf-jeonju-samcheon6";
    });
    const gimhae = HOUSING_LISTINGS.find((item) => {
      return item.id === "pdf-gimhae-jinyeong-centumcube";
    });
    const busan = HOUSING_LISTINGS.find((item) => {
      return item.id === "pdf-busan-myeongji-happy";
    });

    expect(samcheon?.complexDetails.totalHouseholds).toBe(854);
    expect(samcheon?.units).toBe(65);
    expect(samcheon?.unitLabel).toBe("모집 예비자");
    expect(samcheon?.complexDetails.housingTypes.map((type) => type.code)).toEqual([
      "39.51(17-A)",
      "39.63(17-B)",
      "39.77(17-C)",
    ]);

    expect(gimhae?.complexDetails.totalHouseholds).toBe(595);
    expect(gimhae?.complexDetails.housingTypes).toHaveLength(6);
    expect(gimhae?.complexDetails.housingTypes[0]).toMatchObject({
      code: "74A",
      exclusiveAreaSquareMeters: 74.82,
      depositWon: 51_521_000,
      monthlyRentWon: 515_210,
    });

    expect(busan?.complexDetails.totalHouseholds).toBe(284);
    expect(busan?.units).toBe(215);
    expect(busan?.unitLabel).toBe("공급 세대");
    expect(busan?.complexDetails.housingTypes.map((type) => type.code)).toEqual([
      "16형(빌트인)",
      "26A형",
      "26B형(주거약자)",
      "36형",
    ]);
  });
});

describe("eligibilityMatch", () => {
  it("프로필과 자격 태그의 일치 개수와 전체 개수를 계산한다", () => {
    const result = eligibilityMatch(
      listing("eligibility", {
        eligibilityTags: [
          "homeless",
          "household-youth",
          "size-one",
          "income-under-70",
          "asset-low",
        ],
      }),
      DEFAULT_PROFILE,
    );

    expect(result).toEqual({ matched: 4, total: 5 });
  });
});

describe("sortListings", () => {
  it("저장 매물, 자격 일치도, 모집 상태와 임대료 순으로 정렬한다", () => {
    const lowMatch = listing("low-match", {
      monthlyRentWon: 90_000,
      eligibilityTags: [
        "homeless",
        "household-senior",
        "size-three-plus",
        "income-under-70",
        "asset-low",
      ],
    });
    const highMatch = listing("high-match", {
      monthlyRentWon: 160_000,
      eligibilityTags: [
        "homeless",
        "household-youth",
        "size-one",
        "income-under-70",
        "asset-standard",
      ],
    });
    const saved = listing("saved", {
      status: "upcoming",
      eligibilityTags: lowMatch.eligibilityTags,
    });

    const result = sortListings(
      [lowMatch, saved, highMatch],
      DEFAULT_PROFILE,
      new Set(["saved"]),
    );

    expect(result.map(({ id }) => id)).toEqual([
      "saved",
      "high-match",
      "low-match",
    ]);
  });
});

describe("clusterListings", () => {
  it("낮은 줌에서는 같은 시군 매물을 묶고 줌 15부터 개별 매물로 분리한다", () => {
    const listings = [
      listing("near-a", {
        latitude: 37.47,
        longitude: 127.14,
        monthlyRentWon: 125_000,
      }),
      listing("near-b", {
        latitude: 37.4701,
        longitude: 127.1401,
        monthlyRentWon: 98_000,
      }),
    ];

    const grouped = clusterListings(listings, 14);
    const split = clusterListings(listings, 15);

    expect(grouped).toHaveLength(1);
    expect(grouped[0]).toMatchObject({
      regionName: "성남시",
      count: 2,
      listingIds: ["near-a", "near-b"],
    });
    expect(split).toHaveLength(2);
    expect(split.every(({ count }) => count === 1)).toBe(true);
    expect(split.every(({ regionName }) => regionName === "성남시")).toBe(true);
  });

  it("서로 다른 시군의 매물은 좌표가 가까워도 같은 클러스터로 묶지 않는다", () => {
    const clusters = clusterListings([
      listing("seongnam", {
        district: "성남시 수정구",
        latitude: 37.47,
        longitude: 127.14,
      }),
      listing("hanam", {
        district: "하남시 망월동",
        latitude: 37.4701,
        longitude: 127.1401,
      }),
    ], 14);

    expect(clusters).toHaveLength(2);
    expect(clusters.map(({ regionName }) => regionName)).toEqual(["성남시", "하남시"]);
  });
});

describe("formatMoney", () => {
  it("원 단위 금액을 읽기 쉬운 한국어 단위로 표시한다", () => {
    expect(formatMoney(0)).toBe("0원");
    expect(formatMoney(128_000)).toBe("12.8만 원");
    expect(formatMoney(58_000_000)).toBe("5,800만 원");
    expect(formatMoney(125_000_000)).toBe("1억 2,500만 원");
  });
});

describe("단지 상세 프로토타입 데이터", () => {
  it("모든 단지에 모집 요약, 주택형과 과거 공고 데이터가 있다", () => {
    for (const housing of HOUSING_LISTINGS) {
      const details = housing.complexDetails;
      expect(details.housingTypes.length).toBeGreaterThan(0);
      expect(new Set(details.housingTypes.map(({ code }) => code)).size).toBe(
        details.housingTypes.length,
      );
      expect(details.housingTypes.every(({ floorPlanUrl }) => floorPlanUrl === null)).toBe(true);
      if (housing.sourceKind === "prototype") {
        expect(details.recentCompetitionRate).not.toBeNull();
        expect(details.pastNotices).toHaveLength(3);
        expect(new Set(details.pastNotices.map(({ id }) => id)).size).toBe(
          details.pastNotices.length,
        );
      }
      if (housing.sourceKind === "notice-document") {
        expect(details.recentCompetitionRate).toBeNull();
        expect(details.pastNotices).toHaveLength(0);
      }
    }
  });
});
