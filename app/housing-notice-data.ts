import {
  HOUSING_LISTINGS,
  type EligibilityTag,
  type HousingListing,
  type HousingTypeInfo,
  type ListingStatus,
} from "./housing-data";

export type RecruitmentKind = "new" | "reserve";
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
  moveInMonth: string;
  predictedCompetitionRate: number | null;
  supplyComplexes: readonly NoticeSupplyComplex[];
}

export interface HousingNotice {
  id: string;
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

const DEMO_MULTI_COMPLEX_NOTICES = [
  {
    id: "demo-seongnam-youth-happy-notice",
    title: "성남 청년 행복주택 예비입주자 모집 공고",
    complexIds: ["demo-wirye-youth-01", "demo-pangyo-youth-12"],
  },
] as const;

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

function demoNotice(seed: DemoNoticeSeed, index: number): HousingNotice {
  const listing = seed.listings[0];
  if (!listing) throw new Error("공고에는 공급 단지가 하나 이상 필요합니다.");
  const kind = recruitmentKind(listing, index);
  const title = seed.title ?? noticeTitle(listing, kind);
  const publishedAt = offsetDate(listing.applyStart, -2);
  return {
    id: seed.id,
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
    housingTypes: createNoticeHousingTypes(listing.complexDetails.housingTypes, listing.units),
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

export const HOUSING_NOTICES: readonly HousingNotice[] = createDemoNoticeSeeds(
  HOUSING_LISTINGS.filter((listing) => listing.status !== "always"),
).map(demoNotice);

export function noticeStatusLabel(status: ListingStatus) {
  if (status === "upcoming") return "접수예정";
  if (status === "always") return "상시모집";
  return "접수중";
}

export function noticeDeadlineLabel(notice: HousingNotice) {
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
