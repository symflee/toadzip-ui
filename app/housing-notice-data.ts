import {
  HOUSING_LISTINGS,
  type EligibilityTag,
  type HousingListing,
  type HousingTypeInfo,
  type ListingStatus,
} from "./housing-data";

export type RecruitmentKind = "new" | "reserve" | "additional";
export type NoticeRevision = "original" | "corrected";
export type NoticeSupplyKind = "new" | "resupply";
export type NoticeScheduleStatus = "complete" | "current" | "upcoming";

export interface NoticeScheduleStep {
  id: string;
  label: string;
  startAt: string;
  endAt: string | null;
  status: NoticeScheduleStatus;
}

export interface NoticeHousingType {
  code: string;
  roomLabel: string;
  floorPlanUrl: string | null;
  floorPlan3dUrl: string | null;
  supplyKind: NoticeSupplyKind;
  units: number;
  depositWon: number;
  monthlyRentWon: number;
  exclusiveAreaSquareMeters: number;
}

export interface NoticeSupplyComplex {
  id: string;
  name: string;
  address: string;
  overviewImageUrl: string;
  totalHouseholds: number;
  suppliedHouseholds: number;
  unitLabel: "공급 세대" | "공급 세대수" | "모집 예비자" | "모집 호수";
  housingTypes: readonly NoticeHousingType[];
}

export interface HousingNoticeDetails {
  address: string;
  documentName: string;
  pdfUrl: string | null;
  sourceUrl: string | null;
  audiences: readonly string[];
  eligibilityTags: readonly EligibilityTag[];
  schedule: readonly NoticeScheduleStep[];
  moveInMonth: string | null;
  moveInNote: string;
  predictedCompetitionRate: number | null;
  supplyComplexes: readonly NoticeSupplyComplex[];
}

export interface HousingNotice {
  id: string;
  sourceKind: "prototype" | "notice-document";
  rentalType: string;
  title: string;
  region: string;
  applyStart: string;
  applyEnd: string;
  publishedAt: string;
  status: ListingStatus;
  daysLeft: number | null;
  viewCount: number;
  units: number;
  unitLabel: "공급 세대" | "공급 세대수" | "모집 예비자" | "모집 호수";
  provider: string;
  recruitmentKind: RecruitmentKind;
  revision: NoticeRevision;
  details: HousingNoticeDetails;
}

interface DemoNoticeSeed {
  id: string;
  title?: string;
  listings: readonly HousingListing[];
}

interface DocumentNoticeSeed {
  id: string;
  complexId: string;
  title: string;
  region: string;
  publishedAt: string;
  applyStart: string;
  applyEnd: string;
  recruitmentKind: RecruitmentKind;
  audiences: readonly string[];
  schedule: readonly NoticeScheduleStep[];
  moveInMonth: string | null;
  moveInNote: string;
  housingTypeUnits: readonly number[];
  unitLabel: "공급 세대" | "모집 예비자";
}

const DEMO_MULTI_COMPLEX_NOTICES = [
  {
    id: "demo-seongnam-youth-happy-notice",
    title: "성남 청년 행복주택 예비입주자 모집 공고",
    complexIds: ["demo-wirye-youth-01", "demo-pangyo-youth-12"],
  },
] as const;

const DOCUMENT_NOTICE_SEEDS: readonly DocumentNoticeSeed[] = [
  {
    id: "notice-jeonju-samcheon6-50year-20260804",
    complexId: "pdf-jeonju-samcheon6",
    title: "전주삼천6단지 50년공공임대주택 예비입주자 모집",
    region: "전북 전주시",
    publishedAt: "2026-08-04",
    applyStart: "2026-08-14",
    applyEnd: "2026-08-14",
    recruitmentKind: "reserve",
    audiences: [
      "무주택자",
      "무주택세대구성원",
      "성년자",
      "전북특별자치도 거주자",
    ],
    schedule: [
      {
        id: "published",
        label: "공고 게시",
        startAt: "2026-08-04",
        endAt: null,
        status: "complete",
      },
      {
        id: "application",
        label: "신청 접수",
        startAt: "2026-08-14",
        endAt: "2026-08-14",
        status: "complete",
      },
      {
        id: "document-target",
        label: "서류제출 대상자 발표",
        startAt: "2026-08-28",
        endAt: null,
        status: "upcoming",
      },
      {
        id: "documents",
        label: "서류 제출",
        startAt: "2026-08-28",
        endAt: "2026-09-04",
        status: "upcoming",
      },
      {
        id: "qualification",
        label: "입주자격 검증",
        startAt: "2026-09-04",
        endAt: "2026-09-15",
        status: "upcoming",
      },
      {
        id: "result",
        label: "예비입주자 당첨 발표",
        startAt: "2026-09-30",
        endAt: null,
        status: "upcoming",
      },
    ],
    moveInMonth: null,
    moveInNote: "입주 예정 미정 · 예비순번 도래 시 개별 안내",
    housingTypeUnits: [30, 10, 25],
    unitLabel: "모집 예비자",
  },
  {
    id: "notice-gimhae-jinyeong-centumcube-20260806",
    complexId: "pdf-gimhae-jinyeong-centumcube",
    title: "김해진영 센텀큐브 10년 공공임대주택(리츠) 예비입주자 모집공고",
    region: "경남 김해시",
    publishedAt: "2026-08-06",
    applyStart: "2026-08-18",
    applyEnd: "2026-08-19",
    recruitmentKind: "reserve",
    audiences: [
      "무주택자",
      "무주택세대구성원",
      "만 19세 이상",
      "부산·울산·경남 거주자",
    ],
    schedule: [
      {
        id: "published",
        label: "공고 게시",
        startAt: "2026-08-06",
        endAt: null,
        status: "complete",
      },
      {
        id: "application",
        label: "신청 접수",
        startAt: "2026-08-18",
        endAt: "2026-08-19",
        status: "complete",
      },
      {
        id: "result",
        label: "예비입주자 순번 발표",
        startAt: "2026-08-21",
        endAt: null,
        status: "complete",
      },
      {
        id: "documents",
        label: "서류 제출",
        startAt: "2026-08-25",
        endAt: "2026-08-26",
        status: "upcoming",
      },
    ],
    moveInMonth: null,
    moveInNote: "입주 예정 미정 · 공가 발생 및 예비순번 도래 시 개별 안내",
    housingTypeUnits: [10, 15, 5, 5, 25, 5],
    unitLabel: "모집 예비자",
  },
  {
    id: "notice-busan-myeongji-happy-20210310",
    complexId: "pdf-busan-myeongji-happy",
    title: "부산명지 행복주택 입주자격 완화 입주자 추가 모집",
    region: "부산 강서구",
    publishedAt: "2021-03-10",
    applyStart: "2021-03-22",
    applyEnd: "2021-03-25",
    recruitmentKind: "additional",
    audiences: [
      "무주택자",
      "산업단지근로자",
      "대학생·취업준비생",
      "청년·사회초년생",
      "신혼부부·예비신혼부부·한부모가족",
      "고령자",
    ],
    schedule: [
      {
        id: "published",
        label: "공고 게시",
        startAt: "2021-03-10",
        endAt: null,
        status: "complete",
      },
      {
        id: "application",
        label: "신청 접수",
        startAt: "2021-03-22",
        endAt: "2021-03-25",
        status: "complete",
      },
      {
        id: "document-target",
        label: "서류제출 대상자 발표",
        startAt: "2021-04-01",
        endAt: null,
        status: "complete",
      },
      {
        id: "documents",
        label: "서류 제출",
        startAt: "2021-04-05",
        endAt: "2021-04-08",
        status: "complete",
      },
      {
        id: "result",
        label: "당첨자 발표",
        startAt: "2021-06-11",
        endAt: null,
        status: "complete",
      },
      {
        id: "contract",
        label: "계약 체결",
        startAt: "2021-06-22",
        endAt: "2021-06-25",
        status: "complete",
      },
      {
        id: "move-in",
        label: "입주 예정월",
        startAt: "2022-01-01",
        endAt: null,
        status: "complete",
      },
    ],
    moveInMonth: "2022-01",
    moveInNote: "입주 예정월 2022.01 · 공고문 기준",
    housingTypeUnits: [49, 88, 8, 70],
    unitLabel: "공급 세대",
  },
];

function shortRegion(listing: HousingListing) {
  const city = listing.district.split(" ")[0].replace(/시$/, "");
  return `${listing.regionLabel} ${city}`;
}

function recruitmentKind(listing: HousingListing, index: number): RecruitmentKind {
  if (listing.title.includes("예비")) return "reserve";
  return index % 3 === 1 ? "new" : "reserve";
}

function noticeTitle(listing: HousingListing, kind: RecruitmentKind) {
  const complexName = listing.title.replace(/\s+(예비입주|예비자)$/, "");
  const applicant = kind === "reserve" ? "예비입주자" : "입주자";
  return `${complexName} ${applicant} 모집 공고`;
}

function documentNotice(seed: DocumentNoticeSeed): HousingNotice {
  const listing = requireListing(seed.complexId);
  const supplyComplex = createDocumentNoticeComplex(listing, seed.housingTypeUnits);
  return {
    id: seed.id,
    sourceKind: "notice-document",
    rentalType: listing.rentalType,
    title: seed.title,
    region: seed.region,
    applyStart: seed.applyStart,
    applyEnd: seed.applyEnd,
    publishedAt: seed.publishedAt,
    status: "closed",
    daysLeft: null,
    viewCount: 0,
    units: supplyComplex.suppliedHouseholds,
    unitLabel: seed.unitLabel,
    provider: listing.provider,
    recruitmentKind: seed.recruitmentKind,
    revision: "original",
    details: {
      address: listing.complexDetails.address,
      documentName: listing.sourceDocumentName ?? `${seed.title}.pdf`,
      pdfUrl: null,
      sourceUrl: null,
      audiences: seed.audiences,
      eligibilityTags: listing.eligibilityTags,
      schedule: seed.schedule,
      moveInMonth: seed.moveInMonth,
      moveInNote: seed.moveInNote,
      predictedCompetitionRate: null,
      supplyComplexes: [supplyComplex],
    },
  };
}

function requireListing(id: string): HousingListing {
  const listing = HOUSING_LISTINGS.find((item) => item.id === id);
  if (listing) return listing;
  throw new Error(`공고와 연결할 단지를 찾을 수 없습니다: ${id}`);
}

function demoNotice(seed: DemoNoticeSeed, index: number): HousingNotice {
  const listing = seed.listings[0];
  if (!listing) throw new Error("공고에는 공급 단지가 하나 이상 필요합니다.");
  const kind = recruitmentKind(listing, index);
  const title = seed.title ?? noticeTitle(listing, kind);
  const publishedAt = offsetDate(listing.applyStart, -2);
  return {
    id: seed.id,
    sourceKind: "prototype",
    rentalType: listing.rentalType,
    title,
    region: shortRegion(listing),
    applyStart: listing.applyStart,
    applyEnd: listing.applyEnd,
    publishedAt,
    status: listing.status,
    daysLeft: deadlineDaysLeft(listing),
    viewCount: 614 + index * 137,
    units: seed.listings.reduce((total, complex) => total + complex.units, 0),
    unitLabel: "공급 세대수",
    provider: listing.provider,
    recruitmentKind: kind,
    revision: index % 4 === 1 ? "corrected" : "original",
    details: createNoticeDetails(seed.listings, index, title, publishedAt),
  };
}

function createNoticeDetails(
  listings: readonly HousingListing[],
  index: number,
  title: string,
  publishedAt: string,
): HousingNoticeDetails {
  const listing = listings[0];
  if (!listing) throw new Error("공고에는 공급 단지가 하나 이상 필요합니다.");
  const resultAt = offsetDate(listing.applyEnd, 21);
  const contractStartAt = offsetDate(resultAt, 7);
  const contractEndAt = offsetDate(resultAt, 11);
  const moveInMonth = offsetMonth(listing.applyEnd, 3);
  return {
    address: noticeAddressSummary(listings),
    documentName: `${title}.pdf`,
    pdfUrl: null,
    sourceUrl: null,
    audiences: [
      ...new Set(["무주택자", ...listings.flatMap((complex) => complex.audience)]),
    ],
    eligibilityTags: listing.eligibilityTags,
    schedule: [
      {
        id: "published",
        label: "공고 게시",
        startAt: publishedAt,
        endAt: null,
        status: "complete",
      },
      {
        id: "application",
        label: "접수 기간",
        startAt: listing.applyStart,
        endAt: listing.applyEnd,
        status: listing.status === "open" ? "current" : "upcoming",
      },
      {
        id: "result",
        label: "당첨자 발표",
        startAt: resultAt,
        endAt: null,
        status: "upcoming",
      },
      {
        id: "contract",
        label: "계약 기간",
        startAt: contractStartAt,
        endAt: contractEndAt,
        status: "upcoming",
      },
      {
        id: "move-in",
        label: "입주 예정월",
        startAt: `${moveInMonth}-01`,
        endAt: null,
        status: "upcoming",
      },
    ],
    moveInMonth,
    moveInNote: `입주 예정월 ${moveInMonth.replace("-", ".")}`,
    predictedCompetitionRate: predictedCompetitionRate(listing, index),
    supplyComplexes: listings.map(createNoticeComplex),
  };
}

function noticeAddressSummary(listings: readonly HousingListing[]) {
  const listing = listings[0];
  if (!listing) return "공급 단지 주소 확인 필요";
  if (listings.length === 1) return listing.complexDetails.address;
  return `${listing.regionLabel} ${listing.district.split(" ")[0]} · ${listings.length}개 공급 단지`;
}

function createNoticeComplex(listing: HousingListing): NoticeSupplyComplex {
  return {
    id: listing.id,
    name: listing.title,
    address: listing.complexDetails.address,
    overviewImageUrl: listing.complexDetails.overviewImageUrl,
    totalHouseholds: listing.complexDetails.totalHouseholds,
    suppliedHouseholds: listing.units,
    unitLabel: "공급 세대수",
    housingTypes: createNoticeHousingTypes(listing.complexDetails.housingTypes, listing.units),
  };
}

function createDocumentNoticeComplex(
  listing: HousingListing,
  unitsByHousingType: readonly number[],
): NoticeSupplyComplex {
  const housingTypes = listing.complexDetails.housingTypes.map((housingType, index) => {
    const units = unitsByHousingType[index];
    if (!units) throw new Error(`${listing.title}의 주택형별 모집 수가 필요합니다.`);
    return {
      code: housingType.code,
      roomLabel: housingType.roomLabel,
      floorPlanUrl: housingType.floorPlanUrl,
      floorPlan3dUrl: null,
      supplyKind: "resupply" as const,
      units,
      depositWon: housingType.depositWon,
      monthlyRentWon: housingType.monthlyRentWon,
      exclusiveAreaSquareMeters: housingType.exclusiveAreaSquareMeters,
    };
  });
  const suppliedHouseholds = housingTypes.reduce((total, housingType) => {
    return total + housingType.units;
  }, 0);
  return {
    id: listing.id,
    name: listing.title,
    address: listing.complexDetails.address,
    overviewImageUrl: listing.complexDetails.overviewImageUrl,
    totalHouseholds: listing.complexDetails.totalHouseholds,
    suppliedHouseholds,
    unitLabel: listing.unitLabel,
    housingTypes,
  };
}

function createNoticeHousingTypes(
  housingTypes: readonly HousingTypeInfo[],
  totalUnits: number,
): NoticeHousingType[] {
  const baseUnits = Math.floor(totalUnits / housingTypes.length);
  const remainder = totalUnits % housingTypes.length;
  return housingTypes.map((housingType, index) => ({
    code: housingType.code,
    roomLabel: housingType.roomLabel,
    floorPlanUrl: housingType.floorPlanUrl,
    floorPlan3dUrl: null,
    supplyKind: index < Math.ceil(housingTypes.length / 2) ? "new" : "resupply",
    units: baseUnits + Number(index < remainder),
    depositWon: housingType.depositWon,
    monthlyRentWon: housingType.monthlyRentWon,
    exclusiveAreaSquareMeters: housingType.exclusiveAreaSquareMeters,
  }));
}

function predictedCompetitionRate(listing: HousingListing, index: number) {
  const recentRate = listing.complexDetails.recentCompetitionRate;
  if (recentRate === null) return null;
  return Number((recentRate + 0.4 + (index % 3) * 0.3).toFixed(1));
}

function deadlineDaysLeft(listing: HousingListing) {
  if (listing.daysLeft === null) return null;
  if (listing.status !== "upcoming") return listing.daysLeft;
  return listing.daysLeft + dayDifference(listing.applyStart, listing.applyEnd);
}

function dayDifference(start: string, end: string) {
  return Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000);
}

function offsetDate(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

function offsetMonth(date: string, months: number) {
  const [year, month] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + months, 1));
  return shifted.toISOString().slice(0, 7);
}

function createDemoNoticeSeeds(listings: readonly HousingListing[]): DemoNoticeSeed[] {
  const listingById = new Map(listings.map((listing) => [listing.id, listing]));
  const groupedIds = new Set<string>(
    DEMO_MULTI_COMPLEX_NOTICES.flatMap((definition) => definition.complexIds),
  );
  const multiComplexSeeds = DEMO_MULTI_COMPLEX_NOTICES.map((definition) => ({
    id: definition.id,
    title: definition.title,
    listings: definition.complexIds.flatMap((id) => {
      const listing = listingById.get(id);
      return listing ? [listing] : [];
    }),
  }));
  const singleComplexSeeds = listings
    .filter((listing) => !groupedIds.has(listing.id))
    .map((listing) => ({
      id: `${listing.id}-notice-current`,
      listings: [listing],
    }));
  return [...multiComplexSeeds, ...singleComplexSeeds];
}

const DOCUMENT_NOTICES = DOCUMENT_NOTICE_SEEDS.map(documentNotice);
const PROTOTYPE_NOTICES = createDemoNoticeSeeds(
  HOUSING_LISTINGS.filter((listing) => {
    return listing.sourceKind === "prototype" && listing.status !== "always";
  }),
).map(demoNotice);

export const HOUSING_NOTICES: readonly HousingNotice[] = [
  ...DOCUMENT_NOTICES,
  ...PROTOTYPE_NOTICES,
];

export function noticeStatusLabel(status: ListingStatus) {
  if (status === "closed") return "접수마감";
  if (status === "upcoming") return "접수예정";
  if (status === "always") return "상시모집";
  return "접수중";
}

export function noticeDeadlineLabel(notice: HousingNotice) {
  if (notice.status === "closed") return "마감";
  if (notice.daysLeft === null) return "상시";
  if (notice.daysLeft === 0) return "D-Day";
  return `D-${notice.daysLeft}`;
}

export function noticeDeadlineContext() {
  return "접수 마감";
}

export function formatNoticeDate(date: string) {
  return date.replaceAll("-", ".");
}

export function findNoticeByComplexId(complexId: string) {
  return HOUSING_NOTICES.find((notice) => {
    return notice.details.supplyComplexes.some((complex) => complex.id === complexId);
  });
}
