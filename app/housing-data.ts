export type ListingStatus = "open" | "upcoming" | "always" | "closed";
export type HousingDataSource = "prototype" | "notice-document";

export type HouseholdType = "youth" | "newlywed" | "family" | "senior";
export type IncomeBand = "under70" | "under100" | "under120";
export type AssetBand = "low" | "standard" | "high";

export type NearbyFacilityKind =
  | "convenience-store"
  | "laundry"
  | "bus-stop"
  | "subway"
  | "large-mart";

export interface NearbyFacility {
  kind: NearbyFacilityKind;
  name: string;
  travelMode: "도보" | "대중교통";
  minutes: number;
}

export interface TransitRouteInfo {
  destination: string;
  steps: readonly string[];
  drivingMinutes: number;
  transitMinutes: number;
}

export interface AssignedSchoolInfo {
  name: string;
  students: number;
  monthlyEducationCostWon: number;
  afterSchoolPrograms: number;
  teachers: number;
}

export interface HousingTypeInfo {
  code: string;
  roomLabel: string;
  floorPlanUrl: string | null;
  supplyAreaSquareMeters: number;
  exclusiveAreaSquareMeters: number;
  depositWon: number;
  monthlyRentWon: number;
  convertedDepositWon: number;
  monthlyMaintenanceWon: number;
  isDuplex: boolean;
}

export interface PastHousingNotice {
  id: string;
  publishedAt: string;
  title: string;
  units: number;
  competitionRate: number | null;
}

export interface HousingComplexDetails {
  photoUrl: string;
  address: string;
  buildingType: "아파트";
  hasElevator: boolean | null;
  heatingType: string;
  supplyAreaSquareMeters: number;
  corridorType: string;
  annualMoveOutHouseholds: number | null;
  nearbyFacilities: readonly NearbyFacility[];
  transitRoute: TransitRouteInfo;
  assignedSchool: AssignedSchoolInfo;
  overviewImageUrl: string;
  totalHouseholds: number;
  totalParkingSpaces: number;
  recentCompetitionRate: number | null;
  housingTypes: readonly HousingTypeInfo[];
  pastNotices: readonly PastHousingNotice[];
}

export type EligibilityTag =
  | "homeless"
  | "household-youth"
  | "household-newlywed"
  | "household-family"
  | "household-senior"
  | "size-one"
  | "size-two-plus"
  | "size-three-plus"
  | "income-under-70"
  | "income-under-100"
  | "income-under-120"
  | "asset-low"
  | "asset-standard"
  | "asset-high";

export interface HousingListing {
  id: string;
  isDemo: true;
  dataLabel: "프로토타입 예시 데이터" | "공고문 기반 예시 데이터";
  sourceKind: HousingDataSource;
  sourceDocumentName: string | null;
  title: string;
  district: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  provider: string;
  rentalType: string;
  regionLabel: string;
  completedAt: string | null;
  complexDetails: HousingComplexDetails;
  audience: readonly string[];
  areaSquareMeters: number;
  depositWon: number;
  monthlyRentWon: number;
  applyStart: string;
  applyEnd: string;
  units: number;
  unitLabel: "공급 세대" | "모집 예비자";
  transitLabel: string;
  eligibilityTags: readonly EligibilityTag[];
  status: ListingStatus;
  daysLeft: number | null;
}

export interface SearchFilters {
  query: string;
  statuses: readonly ListingStatus[];
  rentalTypes: readonly string[];
  maxMonthlyRentWon: number | null;
  maxDepositWon: number | null;
  minAreaSquareMeters: number | null;
  maxAreaSquareMeters: number | null;
  providers: readonly string[];
  audiences: readonly string[];
  profileOnly: boolean;
}

export interface EligibilityProfile {
  householdType: HouseholdType;
  householdSize: number;
  homeless: boolean;
  incomeBand: IncomeBand;
  assetBand: AssetBand;
}

export interface MapViewport {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
}

export interface EligibilityMatch {
  matched: number;
  total: number;
}

export interface HousingCluster {
  id: string;
  lat: number;
  lng: number;
  regionName: string;
  count: number;
  listingIds: string[];
}

export const DEFAULT_FILTERS: SearchFilters = {
  query: "",
  statuses: ["open", "upcoming"],
  rentalTypes: [],
  maxMonthlyRentWon: null,
  maxDepositWon: null,
  minAreaSquareMeters: null,
  maxAreaSquareMeters: null,
  providers: [],
  audiences: [],
  profileOnly: false,
};

export const DEFAULT_PROFILE: EligibilityProfile = {
  householdType: "youth",
  householdSize: 1,
  homeless: true,
  incomeBand: "under70",
  assetBand: "standard",
};

const DEMO_LABEL = "프로토타입 예시 데이터" as const;
const DEMO_COMPLEX_PHOTO_URL =
  "https://images.unsplash.com/photo-1694678923183-1dd9c96b9657?auto=format&fit=crop&w=1200&q=84";
const DEMO_COMPLEX_OVERVIEW_URL =
  "https://images.unsplash.com/photo-1702738684615-55c42b29f5ae?auto=format&fit=crop&w=1200&q=82";

type DemoListingInput = Omit<
  HousingListing,
  | "isDemo"
  | "dataLabel"
  | "sourceKind"
  | "sourceDocumentName"
  | "unitLabel"
  | "regionLabel"
  | "completedAt"
  | "complexDetails"
> & Partial<
  Pick<
    HousingListing,
    "regionLabel" | "completedAt" | "complexDetails" | "unitLabel"
  >
>;

function demoListing(listing: DemoListingInput): HousingListing {
  const regionLabel = listing.regionLabel ?? "경기";
  const completedAt = listing.completedAt ?? "2020.01";
  return {
    ...listing,
    regionLabel,
    completedAt,
    complexDetails: listing.complexDetails ?? createDemoComplexDetails(listing, regionLabel),
    isDemo: true,
    dataLabel: DEMO_LABEL,
    sourceKind: "prototype",
    sourceDocumentName: null,
    unitLabel: listing.unitLabel ?? "공급 세대",
  };
}

function createDemoComplexDetails(
  listing: DemoListingInput,
  regionLabel: string,
): HousingComplexDetails {
  const totalHouseholds = Math.max(320, listing.units * 12 + 470);
  const districtName = listing.neighborhood.replace(/동$/, "");
  return {
    photoUrl: DEMO_COMPLEX_PHOTO_URL,
    address: `${regionLabel} ${listing.district} ${listing.neighborhood} 두꺼비로 ${listing.units + 32}`,
    buildingType: "아파트",
    hasElevator: true,
    heatingType: "지역난방",
    supplyAreaSquareMeters: Number((listing.areaSquareMeters * 1.38).toFixed(2)),
    corridorType: listing.areaSquareMeters < 36 ? "복도식" : "계단식",
    annualMoveOutHouseholds: Math.max(9, Math.round(totalHouseholds * 0.033)),
    nearbyFacilities: createDemoFacilities(listing.neighborhood),
    transitRoute: {
      destination: "강남역",
      steps: [
        "단지에서 도보 6분",
        `${listing.neighborhood} 인근 정류장`,
        "신분당선 4정거장",
        "강남역 도착",
      ],
      drivingMinutes: 24,
      transitMinutes: 31,
    },
    assignedSchool: {
      name: `${districtName}초등학교`,
      students: 500 + listing.units * 3,
      monthlyEducationCostWon: 78_000,
      afterSchoolPrograms: 18,
      teachers: 42,
    },
    overviewImageUrl: DEMO_COMPLEX_OVERVIEW_URL,
    totalHouseholds,
    totalParkingSpaces: Math.round(totalHouseholds * 1.08),
    recentCompetitionRate: Number((6.4 + (listing.units % 5) * 0.5).toFixed(1)),
    housingTypes: createDemoHousingTypes(listing),
    pastNotices: createDemoPastNotices(listing),
  };
}

function createDemoHousingTypes(listing: DemoListingInput): HousingTypeInfo[] {
  const types = [
    { code: "45A", roomLabel: "투룸", supply: 45.1, exclusive: 33.01, offset: 0 },
    { code: "45B", roomLabel: "투룸", supply: 45.28, exclusive: 33.18, offset: 1_500_000 },
    { code: "55A", roomLabel: "쓰리룸", supply: 55.02, exclusive: 39.72, offset: 9_000_000 },
    { code: "55B", roomLabel: "쓰리룸", supply: 55.2, exclusive: 39.86, offset: 11_000_000 },
  ];
  return types.map((type, index) => ({
    code: type.code,
    roomLabel: type.roomLabel,
    floorPlanUrl: null,
    supplyAreaSquareMeters: type.supply,
    exclusiveAreaSquareMeters: type.exclusive,
    depositWon: listing.depositWon + type.offset,
    monthlyRentWon: listing.monthlyRentWon + index * 10_000,
    convertedDepositWon: listing.depositWon + type.offset + 22_000_000,
    monthlyMaintenanceWon: 92_000 + index * 6_000,
    isDuplex: false,
  }));
}

function createDemoPastNotices(listing: DemoListingInput): PastHousingNotice[] {
  return [
    {
      id: `${listing.id}-past-2025`,
      publishedAt: "2025.10.17",
      title: `${listing.rentalType} 3차 예비입주자 모집`,
      units: 80,
      competitionRate: 7.9,
    },
    {
      id: `${listing.id}-past-2024`,
      publishedAt: "2024.06.03",
      title: "청년·신혼부부 추가모집",
      units: 42,
      competitionRate: 9.1,
    },
    {
      id: `${listing.id}-past-2023`,
      publishedAt: "2023.11.21",
      title: `${listing.rentalType} 예비입주자 모집`,
      units: 65,
      competitionRate: 6.8,
    },
  ];
}

function createDemoFacilities(neighborhood: string): NearbyFacility[] {
  return [
    { kind: "convenience-store", name: `CU ${neighborhood}점`, travelMode: "도보", minutes: 3 },
    { kind: "laundry", name: `런드리24 ${neighborhood}점`, travelMode: "도보", minutes: 5 },
    { kind: "bus-stop", name: `${neighborhood} 주거단지 정류장`, travelMode: "도보", minutes: 4 },
    { kind: "subway", name: `${neighborhood} 인근역`, travelMode: "도보", minutes: 12 },
    { kind: "large-mart", name: "대형마트 성남점", travelMode: "대중교통", minutes: 18 },
  ];
}

type NoticeDocumentListingInput = Omit<
  HousingListing,
  "isDemo" | "dataLabel" | "sourceKind"
>;

type NoticeDocumentComplexInput = Pick<
  HousingComplexDetails,
  | "address"
  | "heatingType"
  | "supplyAreaSquareMeters"
  | "corridorType"
  | "totalHouseholds"
  | "housingTypes"
>;

function noticeDocumentListing(
  listing: NoticeDocumentListingInput,
): HousingListing {
  return {
    ...listing,
    isDemo: true,
    dataLabel: "공고문 기반 예시 데이터",
    sourceKind: "notice-document",
  };
}

function noticeDocumentComplex(
  input: NoticeDocumentComplexInput,
): HousingComplexDetails {
  return {
    ...input,
    photoUrl: DEMO_COMPLEX_PHOTO_URL,
    buildingType: "아파트",
    hasElevator: null,
    annualMoveOutHouseholds: null,
    nearbyFacilities: createNoticeDocumentPlaceholderFacilities(),
    transitRoute: {
      destination: "목적지 미설정(프로토타입)",
      steps: ["공고문에 교통 경로 정보 없음", "지도 API 연동 후 제공 예정"],
      drivingMinutes: 0,
      transitMinutes: 0,
    },
    assignedSchool: {
      name: "배정학교 미확인(프로토타입)",
      students: 0,
      monthlyEducationCostWon: 0,
      afterSchoolPrograms: 0,
      teachers: 0,
    },
    overviewImageUrl: DEMO_COMPLEX_OVERVIEW_URL,
    totalParkingSpaces: 0,
    recentCompetitionRate: null,
    pastNotices: [],
  };
}

function createNoticeDocumentPlaceholderFacilities(): NearbyFacility[] {
  return [
    {
      kind: "convenience-store",
      name: "주변 편의점(프로토타입)",
      travelMode: "도보",
      minutes: 0,
    },
    {
      kind: "bus-stop",
      name: "인근 버스정류장(프로토타입)",
      travelMode: "도보",
      minutes: 0,
    },
  ];
}

export const HOUSING_LISTINGS: readonly HousingListing[] = [
  demoListing({
    id: "demo-wirye-youth-01",
    title: "위례 새솔 청년 행복주택",
    district: "성남시 수정구",
    neighborhood: "창곡동",
    latitude: 37.4698,
    longitude: 127.1444,
    provider: "LH",
    rentalType: "행복주택",
    audience: ["청년", "대학생"],
    areaSquareMeters: 36.21,
    depositWon: 32_400_000,
    monthlyRentWon: 128_000,
    applyStart: "2026-08-10",
    applyEnd: "2026-08-11",
    units: 48,
    transitLabel: "위례중앙광장 정류장 도보 5분",
    eligibilityTags: [
      "homeless",
      "household-youth",
      "size-one",
      "income-under-100",
      "asset-standard",
    ],
    status: "open",
    daysLeft: 3,
  }),
  demoListing({
    id: "demo-wirye-newlywed-02",
    title: "위례 포레나 신혼희망타운",
    district: "성남시 수정구",
    neighborhood: "창곡동",
    latitude: 37.4746,
    longitude: 127.1412,
    provider: "LH",
    rentalType: "신혼희망타운",
    audience: ["신혼부부", "한부모가족"],
    areaSquareMeters: 55.83,
    depositWon: 78_500_000,
    monthlyRentWon: 214_000,
    applyStart: "2026-08-17",
    applyEnd: "2026-08-19",
    units: 72,
    transitLabel: "남위례역 버스 11분",
    eligibilityTags: [
      "homeless",
      "household-newlywed",
      "size-two-plus",
      "income-under-120",
      "asset-standard",
    ],
    status: "upcoming",
    daysLeft: 9,
  }),
  demoListing({
    id: "demo-wirye-national-03",
    title: "위례 센트럴 국민임대",
    district: "성남시 수정구",
    neighborhood: "창곡동",
    latitude: 37.4669,
    longitude: 127.143,
    provider: "LH",
    rentalType: "국민임대",
    audience: ["일반", "고령자"],
    areaSquareMeters: 46.72,
    depositWon: 46_800_000,
    monthlyRentWon: 176_000,
    applyStart: "2026-08-08",
    applyEnd: "2026-08-12",
    units: 35,
    transitLabel: "위례서일로 정류장 도보 3분",
    eligibilityTags: [
      "homeless",
      "household-family",
      "size-two-plus",
      "income-under-70",
      "asset-standard",
    ],
    status: "open",
    daysLeft: 4,
  }),
  demoListing({
    id: "demo-bokjeong-purchase-04",
    title: "복정역 청년 매입임대",
    district: "성남시 수정구",
    neighborhood: "복정동",
    latitude: 37.4587,
    longitude: 127.1279,
    provider: "LH",
    rentalType: "매입임대",
    audience: ["청년"],
    areaSquareMeters: 29.84,
    depositWon: 18_000_000,
    monthlyRentWon: 96_000,
    applyStart: "2026-08-08",
    applyEnd: "2026-08-10",
    units: 16,
    transitLabel: "복정역 도보 7분",
    eligibilityTags: [
      "homeless",
      "household-youth",
      "size-one",
      "income-under-70",
      "asset-low",
    ],
    status: "open",
    daysLeft: 2,
  }),
  demoListing({
    id: "demo-sinheung-integrated-05",
    title: "신흥역 통합공공임대",
    district: "성남시 수정구",
    neighborhood: "신흥동",
    latitude: 37.4409,
    longitude: 127.1463,
    provider: "GH",
    rentalType: "통합공공임대",
    audience: ["청년", "신혼부부", "일반"],
    areaSquareMeters: 44.18,
    depositWon: 51_000_000,
    monthlyRentWon: 198_000,
    applyStart: "2026-08-13",
    applyEnd: "2026-08-14",
    units: 84,
    transitLabel: "신흥역 도보 4분",
    eligibilityTags: [
      "homeless",
      "household-family",
      "size-two-plus",
      "income-under-100",
      "asset-standard",
    ],
    status: "open",
    daysLeft: 6,
  }),
  demoListing({
    id: "demo-taepyeong-jeonse-06",
    title: "태평동 든든전세 예비입주",
    district: "성남시 수정구",
    neighborhood: "태평동",
    latitude: 37.4456,
    longitude: 127.1331,
    provider: "LH",
    rentalType: "전세임대",
    audience: ["일반", "신혼부부"],
    areaSquareMeters: 59.94,
    depositWon: 92_000_000,
    monthlyRentWon: 82_000,
    applyStart: "2026-08-24",
    applyEnd: "2026-08-26",
    units: 22,
    transitLabel: "태평역 도보 10분",
    eligibilityTags: [
      "homeless",
      "household-family",
      "size-two-plus",
      "income-under-120",
      "asset-standard",
    ],
    status: "upcoming",
    daysLeft: 16,
  }),
  demoListing({
    id: "demo-geumgwang-permanent-07",
    title: "금광동 영구임대 예비입주",
    district: "성남시 중원구",
    neighborhood: "금광동",
    latitude: 37.4477,
    longitude: 127.1646,
    provider: "성남도시개발공사",
    rentalType: "영구임대",
    audience: ["고령자", "주거취약계층"],
    areaSquareMeters: 26.37,
    depositWon: 9_800_000,
    monthlyRentWon: 58_000,
    applyStart: "2026-08-07",
    applyEnd: "2026-08-09",
    units: 31,
    transitLabel: "단대오거리역 버스 8분",
    eligibilityTags: [
      "homeless",
      "household-senior",
      "size-one",
      "income-under-70",
      "asset-low",
    ],
    status: "open",
    daysLeft: 1,
  }),
  demoListing({
    id: "demo-eunhaeng-national-08",
    title: "은행주공 국민임대",
    district: "성남시 중원구",
    neighborhood: "은행동",
    latitude: 37.4534,
    longitude: 127.166,
    provider: "LH",
    rentalType: "국민임대",
    audience: ["일반", "고령자"],
    areaSquareMeters: 39.91,
    depositWon: 27_600_000,
    monthlyRentWon: 119_000,
    applyStart: "2026-08-18",
    applyEnd: "2026-08-20",
    units: 45,
    transitLabel: "은행시장 정류장 도보 4분",
    eligibilityTags: [
      "homeless",
      "household-family",
      "size-two-plus",
      "income-under-70",
      "asset-standard",
    ],
    status: "upcoming",
    daysLeft: 10,
  }),
  demoListing({
    id: "demo-yatap-youth-09",
    title: "야탑역 역세권 청년주택",
    district: "성남시 분당구",
    neighborhood: "야탑동",
    latitude: 37.4112,
    longitude: 127.1281,
    provider: "GH",
    rentalType: "행복주택",
    audience: ["청년", "대학생"],
    areaSquareMeters: 31.08,
    depositWon: 28_000_000,
    monthlyRentWon: 142_000,
    applyStart: "2026-08-11",
    applyEnd: "2026-08-13",
    units: 60,
    transitLabel: "야탑역 도보 6분",
    eligibilityTags: [
      "homeless",
      "household-youth",
      "size-one",
      "income-under-100",
      "asset-standard",
    ],
    status: "open",
    daysLeft: 5,
  }),
  demoListing({
    id: "demo-docheon-newlywed-10",
    title: "도촌지구 신혼부부 행복주택",
    district: "성남시 중원구",
    neighborhood: "도촌동",
    latitude: 37.4148,
    longitude: 127.156,
    provider: "LH",
    rentalType: "행복주택",
    audience: ["신혼부부", "한부모가족"],
    areaSquareMeters: 44.83,
    depositWon: 54_000_000,
    monthlyRentWon: 187_000,
    applyStart: "2026-08-20",
    applyEnd: "2026-08-21",
    units: 42,
    transitLabel: "야탑역 버스 14분",
    eligibilityTags: [
      "homeless",
      "household-newlywed",
      "size-two-plus",
      "income-under-100",
      "asset-standard",
    ],
    status: "upcoming",
    daysLeft: 12,
  }),
  demoListing({
    id: "demo-baekhyeon-integrated-11",
    title: "백현마을 통합공공임대",
    district: "성남시 분당구",
    neighborhood: "백현동",
    latitude: 37.3862,
    longitude: 127.1125,
    provider: "GH",
    rentalType: "통합공공임대",
    audience: ["청년", "신혼부부", "일반"],
    areaSquareMeters: 51.24,
    depositWon: 66_000_000,
    monthlyRentWon: 226_000,
    applyStart: "2026-08-09",
    applyEnd: "2026-08-12",
    units: 36,
    transitLabel: "판교역 버스 9분",
    eligibilityTags: [
      "homeless",
      "household-family",
      "size-two-plus",
      "income-under-100",
      "asset-standard",
    ],
    status: "open",
    daysLeft: 4,
  }),
  demoListing({
    id: "demo-pangyo-youth-12",
    title: "판교 봇들마을 청년 행복주택",
    district: "성남시 분당구",
    neighborhood: "삼평동",
    latitude: 37.4007,
    longitude: 127.1174,
    provider: "LH",
    rentalType: "행복주택",
    audience: ["청년"],
    areaSquareMeters: 26.95,
    depositWon: 36_500_000,
    monthlyRentWon: 154_000,
    applyStart: "2026-08-08",
    applyEnd: "2026-08-14",
    units: 27,
    transitLabel: "판교역 도보 12분",
    eligibilityTags: [
      "homeless",
      "household-youth",
      "size-one",
      "income-under-100",
      "asset-standard",
    ],
    status: "open",
    daysLeft: 6,
  }),
  demoListing({
    id: "demo-seohyeon-national-13",
    title: "서현동 국민임대 예비자",
    district: "성남시 분당구",
    neighborhood: "서현동",
    latitude: 37.3851,
    longitude: 127.1234,
    provider: "LH",
    rentalType: "국민임대",
    audience: ["일반", "고령자"],
    areaSquareMeters: 49.33,
    depositWon: 58_000_000,
    monthlyRentWon: 201_000,
    applyStart: "2026-08-31",
    applyEnd: "2026-09-02",
    units: 19,
    transitLabel: "서현역 도보 9분",
    eligibilityTags: [
      "homeless",
      "household-family",
      "size-two-plus",
      "income-under-70",
      "asset-standard",
    ],
    status: "upcoming",
    daysLeft: 23,
  }),
  demoListing({
    id: "demo-jeongja-senior-14",
    title: "정자동 고령자 복지주택",
    district: "성남시 분당구",
    neighborhood: "정자동",
    latitude: 37.3664,
    longitude: 127.1078,
    provider: "LH",
    rentalType: "영구임대",
    audience: ["고령자"],
    areaSquareMeters: 29.62,
    depositWon: 12_400_000,
    monthlyRentWon: 72_000,
    applyStart: "2026-01-01",
    applyEnd: "2026-12-31",
    units: 12,
    transitLabel: "정자역 버스 7분",
    eligibilityTags: [
      "homeless",
      "household-senior",
      "size-one",
      "income-under-70",
      "asset-low",
    ],
    status: "always",
    daysLeft: null,
  }),
  demoListing({
    id: "demo-unjung-jeonse-15",
    title: "운중동 신혼부부 전세임대",
    district: "성남시 분당구",
    neighborhood: "운중동",
    latitude: 37.3909,
    longitude: 127.0771,
    provider: "LH",
    rentalType: "전세임대",
    audience: ["신혼부부"],
    areaSquareMeters: 59.79,
    depositWon: 118_000_000,
    monthlyRentWon: 108_000,
    applyStart: "2026-08-27",
    applyEnd: "2026-08-28",
    units: 14,
    transitLabel: "판교역 버스 18분",
    eligibilityTags: [
      "homeless",
      "household-newlywed",
      "size-two-plus",
      "income-under-120",
      "asset-standard",
    ],
    status: "upcoming",
    daysLeft: 19,
  }),
  demoListing({
    id: "demo-godeung-newlywed-16",
    title: "고등지구 신혼희망 행복주택",
    district: "성남시 수정구",
    neighborhood: "고등동",
    latitude: 37.4278,
    longitude: 127.099,
    provider: "LH",
    rentalType: "행복주택",
    audience: ["신혼부부", "청년"],
    areaSquareMeters: 46.11,
    depositWon: 61_000_000,
    monthlyRentWon: 193_000,
    applyStart: "2026-08-08",
    applyEnd: "2026-08-15",
    units: 56,
    transitLabel: "판교제2테크노밸리 정류장 도보 6분",
    eligibilityTags: [
      "homeless",
      "household-newlywed",
      "size-two-plus",
      "income-under-120",
      "asset-standard",
    ],
    status: "open",
    daysLeft: 7,
  }),
  demoListing({
    id: "demo-dandae-purchase-17",
    title: "단대오거리 청년 매입임대",
    district: "성남시 수정구",
    neighborhood: "단대동",
    latitude: 37.449,
    longitude: 127.1561,
    provider: "성남도시개발공사",
    rentalType: "매입임대",
    audience: ["청년", "대학생"],
    areaSquareMeters: 22.03,
    depositWon: 14_000_000,
    monthlyRentWon: 76_000,
    applyStart: "2026-08-06",
    applyEnd: "2026-08-09",
    units: 9,
    transitLabel: "단대오거리역 도보 5분",
    eligibilityTags: [
      "homeless",
      "household-youth",
      "size-one",
      "income-under-70",
      "asset-low",
    ],
    status: "open",
    daysLeft: 1,
  }),
  demoListing({
    id: "demo-sujin-purchase-18",
    title: "수진역 주거안심 매입임대",
    district: "성남시 수정구",
    neighborhood: "수진동",
    latitude: 37.437,
    longitude: 127.131,
    provider: "GH",
    rentalType: "매입임대",
    audience: ["주거취약계층", "일반"],
    areaSquareMeters: 33.65,
    depositWon: 21_000_000,
    monthlyRentWon: 104_000,
    applyStart: "2026-01-01",
    applyEnd: "2026-12-31",
    units: 8,
    transitLabel: "수진역 도보 6분",
    eligibilityTags: [
      "homeless",
      "household-family",
      "size-one",
      "income-under-70",
      "asset-low",
    ],
    status: "always",
    daysLeft: null,
  }),
  noticeDocumentListing({
    id: "pdf-jeonju-samcheon6",
    sourceDocumentName: "삼천6단지공임50년예비입주자표준모집공고문.pdf",
    title: "전주삼천6단지",
    district: "전주시 완산구",
    neighborhood: "삼천동1가",
    latitude: 35.7974,
    longitude: 127.121,
    provider: "LH",
    rentalType: "50년공공임대주택",
    regionLabel: "전북",
    completedAt: "2000.04",
    audience: ["무주택세대구성원", "예비입주자"],
    areaSquareMeters: 39.51,
    depositWon: 15_071_000,
    monthlyRentWon: 209_670,
    applyStart: "2026-08-14",
    applyEnd: "2026-08-14",
    units: 65,
    unitLabel: "모집 예비자",
    transitLabel: "교통 정보 미확인(공고문 기준)",
    eligibilityTags: [
      "homeless",
      "household-family",
      "size-one",
      "income-under-70",
      "asset-standard",
    ],
    status: "closed",
    daysLeft: null,
    complexDetails: noticeDocumentComplex({
      address: "전북 전주시 완산구 삼천천변1길 9",
      heatingType: "개별난방",
      supplyAreaSquareMeters: 67.94,
      corridorType: "복도식",
      totalHouseholds: 854,
      housingTypes: [
        {
          code: "39.51(17-A)",
          roomLabel: "39㎡형",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 67.94,
          exclusiveAreaSquareMeters: 39.51,
          depositWon: 15_071_000,
          monthlyRentWon: 209_670,
          convertedDepositWon: 40_071_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
        {
          code: "39.63(17-B)",
          roomLabel: "39㎡형",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 68.15,
          exclusiveAreaSquareMeters: 39.63,
          depositWon: 15_115_000,
          monthlyRentWon: 210_080,
          convertedDepositWon: 40_115_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
        {
          code: "39.77(17-C)",
          roomLabel: "39㎡형",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 68.39,
          exclusiveAreaSquareMeters: 39.77,
          depositWon: 15_169_000,
          monthlyRentWon: 210_560,
          convertedDepositWon: 40_169_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
      ],
    }),
  }),
  noticeDocumentListing({
    id: "pdf-gimhae-jinyeong-centumcube",
    sourceDocumentName: "20260806_김해진영2B5블록(센텀큐브)예비입주자모집.pdf",
    title: "김해진영 센텀큐브",
    district: "김해시 진영읍",
    neighborhood: "진영읍",
    latitude: 35.3047,
    longitude: 128.733,
    provider: "LH",
    rentalType: "10년 분양전환 공공임대주택(리츠)",
    regionLabel: "경남",
    completedAt: "2017.12",
    audience: ["무주택세대구성원", "예비입주자"],
    areaSquareMeters: 74.82,
    depositWon: 51_521_000,
    monthlyRentWon: 515_210,
    applyStart: "2026-08-18",
    applyEnd: "2026-08-19",
    units: 65,
    unitLabel: "모집 예비자",
    transitLabel: "교통 정보 미확인(공고문 기준)",
    eligibilityTags: [
      "homeless",
      "household-family",
      "size-one",
      "income-under-120",
      "asset-high",
    ],
    status: "closed",
    daysLeft: null,
    complexDetails: noticeDocumentComplex({
      address: "경상남도 김해시 진영읍 김해대로 461",
      heatingType: "개별난방",
      supplyAreaSquareMeters: 100.6844,
      corridorType: "계단식(프로토타입 보완값)",
      totalHouseholds: 595,
      housingTypes: [
        {
          code: "74A",
          roomLabel: "74㎡형",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 100.6844,
          exclusiveAreaSquareMeters: 74.82,
          depositWon: 51_521_000,
          monthlyRentWon: 515_210,
          convertedDepositWon: 51_521_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
        {
          code: "84A",
          roomLabel: "84A1형",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 113.9663,
          exclusiveAreaSquareMeters: 84.69,
          depositWon: 63_580_000,
          monthlyRentWon: 570_020,
          convertedDepositWon: 63_580_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
        {
          code: "84B",
          roomLabel: "84A2형",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 114.3028,
          exclusiveAreaSquareMeters: 84.94,
          depositWon: 63_580_000,
          monthlyRentWon: 570_020,
          convertedDepositWon: 63_580_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
        {
          code: "84C",
          roomLabel: "84A3형",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 114.3028,
          exclusiveAreaSquareMeters: 84.94,
          depositWon: 63_580_000,
          monthlyRentWon: 570_020,
          convertedDepositWon: 63_580_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
        {
          code: "84D",
          roomLabel: "84B1형",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 114.1951,
          exclusiveAreaSquareMeters: 84.86,
          depositWon: 63_580_000,
          monthlyRentWon: 570_020,
          convertedDepositWon: 63_580_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
        {
          code: "84E",
          roomLabel: "84B2형",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 114.2355,
          exclusiveAreaSquareMeters: 84.89,
          depositWon: 63_580_000,
          monthlyRentWon: 570_020,
          convertedDepositWon: 63_580_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
      ],
    }),
  }),
  noticeDocumentListing({
    id: "pdf-busan-myeongji-happy",
    sourceDocumentName:
      "(210310)부산명지행복주택추가입주자모집공고문(산단형)_공고용수정.pdf",
    title: "부산명지 행복주택",
    district: "부산광역시 강서구",
    neighborhood: "명지동",
    latitude: 35.095,
    longitude: 128.902,
    provider: "LH",
    rentalType: "행복주택(산업단지형)",
    regionLabel: "부산",
    completedAt: "2022.01",
    audience: ["산업단지근로자", "청년", "신혼부부"],
    areaSquareMeters: 16.7,
    depositWon: 12_923_000,
    monthlyRentWon: 66_760,
    applyStart: "2021-03-22",
    applyEnd: "2021-03-25",
    units: 215,
    unitLabel: "공급 세대",
    transitLabel: "교통 정보 미확인(공고문 기준)",
    eligibilityTags: [
      "homeless",
      "household-youth",
      "size-one",
      "income-under-100",
      "asset-standard",
    ],
    status: "closed",
    daysLeft: null,
    complexDetails: noticeDocumentComplex({
      address: "부산광역시 강서구 명지동 3227-2 일원",
      heatingType: "미확인(프로토타입 보완값)",
      supplyAreaSquareMeters: 35.6157,
      corridorType: "미확인(프로토타입 보완값)",
      totalHouseholds: 284,
      housingTypes: [
        {
          code: "16형(빌트인)",
          roomLabel: "원룸",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 35.6157,
          exclusiveAreaSquareMeters: 16.7,
          depositWon: 12_923_000,
          monthlyRentWon: 66_760,
          convertedDepositWon: 12_923_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
        {
          code: "26A형",
          roomLabel: "26㎡형",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 57.0491,
          exclusiveAreaSquareMeters: 26.75,
          depositWon: 20_509_000,
          monthlyRentWon: 105_960,
          convertedDepositWon: 20_509_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
        {
          code: "26B형(주거약자)",
          roomLabel: "26㎡형(주거약자)",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 57.0491,
          exclusiveAreaSquareMeters: 26.75,
          depositWon: 22_922_000,
          monthlyRentWon: 118_430,
          convertedDepositWon: 22_922_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
        {
          code: "36형",
          roomLabel: "36㎡형",
          floorPlanUrl: null,
          supplyAreaSquareMeters: 78.1629,
          exclusiveAreaSquareMeters: 36.65,
          depositWon: 33_732_000,
          monthlyRentWon: 174_280,
          convertedDepositWon: 33_732_000,
          monthlyMaintenanceWon: 0,
          isDuplex: false,
        },
      ],
    }),
  }),
];

export function filterListings(
  listings: readonly HousingListing[],
  filters: SearchFilters,
  viewport?: MapViewport,
  profile: EligibilityProfile = DEFAULT_PROFILE,
): HousingListing[] {
  return listings.filter((listing) => {
    return (
      matchesQuery(listing, filters.query) &&
      matchesSelectedValue(listing.status, filters.statuses) &&
      matchesSelectedValue(listing.rentalType, filters.rentalTypes) &&
      isAtMost(listing.monthlyRentWon, filters.maxMonthlyRentWon) &&
      isAtMost(listing.depositWon, filters.maxDepositWon) &&
      isAtLeast(listing.areaSquareMeters, filters.minAreaSquareMeters) &&
      isAtMost(listing.areaSquareMeters, filters.maxAreaSquareMeters) &&
      matchesSelectedValue(listing.provider, filters.providers) &&
      matchesAudience(listing, filters.audiences) &&
      matchesProfileFilter(listing, filters.profileOnly, profile) &&
      isInsideViewport(listing, viewport)
    );
  });
}

export function eligibilityMatch(
  listing: HousingListing,
  profile: EligibilityProfile,
): EligibilityMatch {
  const matched = listing.eligibilityTags.filter((tag) => {
    return matchesEligibilityTag(tag, profile);
  }).length;

  return { matched, total: listing.eligibilityTags.length };
}

export function sortListings(
  listings: readonly HousingListing[],
  profile: EligibilityProfile,
  savedIds: ReadonlySet<string> | readonly string[],
): HousingListing[] {
  const savedIdSet = savedIds instanceof Set ? savedIds : new Set(savedIds);

  return [...listings].sort((left, right) => {
    return (
      compareSaved(left, right, savedIdSet) ||
      compareEligibility(left, right, profile) ||
      compareStatus(left, right) ||
      compareDeadline(left, right) ||
      left.monthlyRentWon - right.monthlyRentWon ||
      left.title.localeCompare(right.title, "ko")
    );
  });
}

export function formatMoney(amountWon: number): string {
  const safeAmount = Math.max(0, Math.round(amountWon));
  if (safeAmount === 0) {
    return "0원";
  }

  if (safeAmount < 10_000) {
    return `${safeAmount.toLocaleString("ko-KR")}원`;
  }

  if (safeAmount < 100_000_000) {
    return `${formatManWon(safeAmount)}만 원`;
  }

  const eokWon = Math.floor(safeAmount / 100_000_000);
  const remainderWon = safeAmount % 100_000_000;
  if (remainderWon < 10_000) {
    return `${eokWon.toLocaleString("ko-KR")}억 원`;
  }

  return `${eokWon.toLocaleString("ko-KR")}억 ${formatManWon(remainderWon)}만 원`;
}

export function clusterListings(
  listings: readonly HousingListing[],
  zoom: number,
): HousingCluster[] {
  if (zoom >= 15) {
    return listings.map(toSingleListingCluster);
  }

  const groups = new Map<string, HousingListing[]>();
  listings.forEach((listing) => {
    const regionName = listingRegionName(listing);
    const group = groups.get(regionName) ?? [];
    group.push(listing);
    groups.set(regionName, group);
  });

  return [...groups.entries()].map(([regionName, group]) => {
    return toGroupedCluster(regionName, group, zoom);
  });
}

function matchesQuery(listing: HousingListing, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    listing.title,
    listing.district,
    listing.neighborhood,
    listing.provider,
    listing.rentalType,
    listing.transitLabel,
    ...listing.audience,
  ];
  return searchableValues.some((value) => {
    return value.toLocaleLowerCase("ko-KR").includes(normalizedQuery);
  });
}

function matchesSelectedValue<T>(value: T, selected: readonly T[]): boolean {
  return selected.length === 0 || selected.includes(value);
}

function matchesAudience(
  listing: HousingListing,
  selectedAudiences: readonly string[],
): boolean {
  if (selectedAudiences.length === 0) {
    return true;
  }

  return selectedAudiences.some((audience) => listing.audience.includes(audience));
}

function isAtMost(value: number, maximum: number | null): boolean {
  return maximum === null || value <= maximum;
}

function isAtLeast(value: number, minimum: number | null): boolean {
  return minimum === null || value >= minimum;
}

function matchesProfileFilter(
  listing: HousingListing,
  profileOnly: boolean,
  profile: EligibilityProfile,
): boolean {
  return !profileOnly || eligibilityMatch(listing, profile).matched >= 4;
}

function isInsideViewport(
  listing: HousingListing,
  viewport?: MapViewport,
): boolean {
  if (!viewport) {
    return true;
  }

  const insideLatitude =
    listing.latitude >= viewport.south && listing.latitude <= viewport.north;
  const insideLongitude = viewport.east >= viewport.west
    ? listing.longitude >= viewport.west && listing.longitude <= viewport.east
    : listing.longitude >= viewport.west || listing.longitude <= viewport.east;
  return insideLatitude && insideLongitude;
}

function matchesEligibilityTag(
  tag: EligibilityTag,
  profile: EligibilityProfile,
): boolean {
  if (tag === "homeless") {
    return profile.homeless;
  }

  if (tag.startsWith("household-")) {
    return tag === `household-${profile.householdType}`;
  }

  if (tag === "size-one") {
    return profile.householdSize === 1;
  }

  if (tag === "size-two-plus") {
    return profile.householdSize >= 2;
  }

  if (tag === "size-three-plus") {
    return profile.householdSize >= 3;
  }

  if (tag.startsWith("income-")) {
    return matchesIncomeTag(tag, profile.incomeBand);
  }

  return matchesAssetTag(tag, profile.assetBand);
}

function matchesIncomeTag(tag: EligibilityTag, incomeBand: IncomeBand): boolean {
  const ranks: Record<IncomeBand, number> = {
    under70: 0,
    under100: 1,
    under120: 2,
  };
  const maximumRanks: Partial<Record<EligibilityTag, number>> = {
    "income-under-70": 0,
    "income-under-100": 1,
    "income-under-120": 2,
  };
  const maximumRank = maximumRanks[tag];
  return maximumRank !== undefined && ranks[incomeBand] <= maximumRank;
}

function matchesAssetTag(tag: EligibilityTag, assetBand: AssetBand): boolean {
  const ranks: Record<AssetBand, number> = {
    low: 0,
    standard: 1,
    high: 2,
  };
  const maximumRanks: Partial<Record<EligibilityTag, number>> = {
    "asset-low": 0,
    "asset-standard": 1,
    "asset-high": 2,
  };
  const maximumRank = maximumRanks[tag];
  return maximumRank !== undefined && ranks[assetBand] <= maximumRank;
}

function compareSaved(
  left: HousingListing,
  right: HousingListing,
  savedIds: ReadonlySet<string>,
): number {
  return Number(savedIds.has(right.id)) - Number(savedIds.has(left.id));
}

function compareEligibility(
  left: HousingListing,
  right: HousingListing,
  profile: EligibilityProfile,
): number {
  const leftMatch = eligibilityMatch(left, profile);
  const rightMatch = eligibilityMatch(right, profile);
  const leftRatio = leftMatch.total === 0 ? 0 : leftMatch.matched / leftMatch.total;
  const rightRatio = rightMatch.total === 0
    ? 0
    : rightMatch.matched / rightMatch.total;
  return rightRatio - leftRatio;
}

function compareStatus(left: HousingListing, right: HousingListing): number {
  const statusRanks: Record<ListingStatus, number> = {
    open: 0,
    upcoming: 1,
    always: 2,
    closed: 3,
  };
  return statusRanks[left.status] - statusRanks[right.status];
}

function compareDeadline(left: HousingListing, right: HousingListing): number {
  return (left.daysLeft ?? Number.POSITIVE_INFINITY) -
    (right.daysLeft ?? Number.POSITIVE_INFINITY);
}

function formatManWon(amountWon: number): string {
  const manWon = amountWon / 10_000;
  return manWon.toLocaleString("ko-KR", {
    maximumFractionDigits: Number.isInteger(manWon) ? 0 : 1,
  });
}

function toSingleListingCluster(listing: HousingListing): HousingCluster {
  return {
    id: `listing-${listing.id}`,
    lat: listing.latitude,
    lng: listing.longitude,
    regionName: listingRegionName(listing),
    count: 1,
    listingIds: [listing.id],
  };
}

function toGroupedCluster(
  regionName: string,
  listings: HousingListing[],
  zoom: number,
): HousingCluster {
  const latitudeTotal = listings.reduce((sum, listing) => {
    return sum + listing.latitude;
  }, 0);
  const longitudeTotal = listings.reduce((sum, listing) => {
    return sum + listing.longitude;
  }, 0);
  return {
    id: `cluster-${Math.floor(zoom)}-${regionName}`,
    lat: latitudeTotal / listings.length,
    lng: longitudeTotal / listings.length,
    regionName,
    count: listings.length,
    listingIds: listings.map(({ id }) => id),
  };
}

function listingRegionName(listing: HousingListing): string {
  const districtTokens = listing.district.trim().split(/\s+/);
  const municipality = districtTokens.find((token) => {
    return /(특별자치시|특별시|광역시|시|군)$/.test(token);
  });
  if (municipality) return municipality;

  const district = districtTokens.find((token) => token.endsWith("구"));
  if (district) return district;

  const regionTokens = listing.regionLabel.trim().split(/\s+/);
  return regionTokens[regionTokens.length - 1] || "지역";
}
