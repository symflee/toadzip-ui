import {
  Building2,
  BusFront,
  MapPin,
  Navigation,
  School,
  ShoppingCart,
  Store,
  TrainFront,
  WashingMachine,
  X,
} from "lucide-react";
import { type CSSProperties, type ReactNode, useState } from "react";
import {
  type HousingTypeInfo,
  type HousingListing,
  type NearbyFacility,
  type NearbyFacilityKind,
} from "./housing-data";

interface HousingComplexDetailPanelProps {
  listing: HousingListing;
  onClose: () => void;
  onOpenNotice: () => void;
}

export function HousingComplexDetailPanel({
  listing,
  onClose,
  onOpenNotice,
}: HousingComplexDetailPanelProps) {
  const details = listing.complexDetails;
  const defaultHousingCode = details.housingTypes.at(-1)?.code ?? "";
  const [selectedHousingCode, setSelectedHousingCode] = useState(defaultHousingCode);
  const selectedHousingType = details.housingTypes.find(
    (housingType) => housingType.code === selectedHousingCode,
  );
  return (
    <aside
      className="complex-detail-panel"
      aria-label={`${listing.title} 단지 상세 정보`}
    >
      <header className="complex-detail-panel__header">
        <div>
          <span>단지 상세 정보</span>
          <strong>{listing.title}</strong>
        </div>
        <button type="button" aria-label="단지 상세 닫기" onClick={onClose}>
          <X size={19} />
        </button>
      </header>

      <div className="complex-detail-panel__scroll">
        <section
          className="complex-detail-hero"
          role="img"
          aria-label={`${listing.title} 단지사진`}
          style={{
            "--complex-detail-image": `url("${details.photoUrl}")`,
          } as CSSProperties}
        >
          <span>단지사진</span>
        </section>

        <section className="complex-detail-identity">
          <p className="complex-detail-identity__type">
            <Building2 size={16} />
            <strong>{listing.provider}</strong>
            <span aria-hidden="true" />
            {listing.rentalType}
          </p>
          <h2>{listing.title}</h2>
          <p className="complex-detail-identity__address">
            <MapPin size={16} /> {details.address}
          </p>
        </section>

        <RecruitmentSummary listing={listing} onOpenNotice={onOpenNotice} />

        <DetailSection
          title="단지 기본 정보"
          description="건물 특성과 단지 규모를 한눈에 확인하세요."
        >
          <dl className="complex-detail-facts">
            <DetailFact term="단지명" value={listing.title} wide />
            <DetailFact term="공급기관" value={listing.provider} />
            <DetailFact term="상세주소" value={details.address} wide />
            <DetailFact term="임대종류" value={listing.rentalType} />
            <DetailFact term="준공일자" value={listing.completedAt ?? "정보 확인 중"} />
            <DetailFact term="건물형태" value={details.buildingType} />
            <DetailFact term="엘리베이터" value={details.hasElevator ? "있음" : "없음"} />
            <DetailFact term="난방종류" value={details.heatingType} />
            <DetailFact term="공급 면적" value={`${details.supplyAreaSquareMeters}㎡`} />
            <DetailFact term="복도유형" value={details.corridorType} />
            <DetailFact
              term="1년 퇴거자 수"
              value={formatHouseholds(details.annualMoveOutHouseholds)}
            />
            <DetailFact term="총세대수" value={`${formatNumber(details.totalHouseholds)}세대`} />
            <DetailFact
              term="총주차대수(세대당)"
              value={formatParkingSpaces(
                details.totalParkingSpaces,
                details.totalHouseholds,
              )}
            />
          </dl>
        </DetailSection>

        {selectedHousingType && (
          <HousingTypeSection
            housingTypes={details.housingTypes}
            selectedHousingType={selectedHousingType}
            onSelect={setSelectedHousingCode}
          />
        )}

        <DetailSection title="단지 조감도">
          <div
            className="complex-overview-image"
            role="img"
            aria-label={`${listing.title} 단지 조감도`}
            style={{
              "--complex-overview-image": `url("${details.overviewImageUrl}")`,
            } as CSSProperties}
          />
        </DetailSection>

        <DetailSection
          title="주변 생활 시설"
          description="단지를 기준으로 시설별 예상 이동 시간을 표시합니다."
        >
          <ul className="nearby-facility-list">
            {details.nearbyFacilities.map((facility) => (
              <FacilityRow key={facility.kind} facility={facility} />
            ))}
          </ul>
        </DetailSection>

        <DetailSection
          title="교통 정보"
          description="자주 가는 목적지까지의 간단한 경로입니다."
        >
          <div className="transit-route-card">
            <div className="transit-route-card__destination">
              <span>목적지</span>
              <strong>{details.transitRoute.destination}</strong>
              <Navigation size={18} />
            </div>
            <ol className="transit-route-card__steps">
              {details.transitRoute.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="transit-route-card__times">
              <span>자동차 {details.transitRoute.drivingMinutes}분</span>
              <span>대중교통 {details.transitRoute.transitMinutes}분</span>
            </div>
          </div>
        </DetailSection>

        <DetailSection
          title="배정 학교 정보"
          description="배정 가능 학교의 주요 지표를 정리했습니다."
        >
          <div className="assigned-school">
            <div className="assigned-school__name">
              <School size={19} />
              <strong>{details.assignedSchool.name}</strong>
            </div>
            <dl className="assigned-school__metrics">
              <DetailFact
                term="학생수"
                value={`${formatNumber(details.assignedSchool.students)}명`}
              />
              <DetailFact
                term="교육비"
                value={`월 ${formatWon(details.assignedSchool.monthlyEducationCostWon)}`}
              />
              <DetailFact
                term="방과후 프로그램 수"
                value={`${details.assignedSchool.afterSchoolPrograms}개`}
              />
              <DetailFact
                term="교사 수"
                value={`${details.assignedSchool.teachers}명`}
              />
            </dl>
          </div>
        </DetailSection>

        <DetailSection
          title="과거 모집 공고"
          description="이전 모집 규모와 경쟁률 변화를 함께 확인하세요."
        >
          <ul className="past-notice-list">
            {details.pastNotices.map((notice) => (
              <li key={notice.id}>
                <div>
                  <time>{notice.publishedAt}</time>
                  <strong>{notice.title}</strong>
                  <span>
                    {notice.units}호 · 경쟁률 {formatCompetitionRate(notice.competitionRate)}
                  </span>
                </div>
                <b>마감</b>
              </li>
            ))}
          </ul>
        </DetailSection>
      </div>
    </aside>
  );
}

function RecruitmentSummary({
  listing,
  onOpenNotice,
}: {
  listing: HousingListing;
  onOpenNotice: () => void;
}) {
  const competitionRate = listing.complexDetails.recentCompetitionRate;
  const deadline = deadlinePresentation(listing);
  return (
    <DetailSection
      title="모집 요약 정보"
      description="공고문에서 지원 판단에 필요한 내용만 정리했어요."
    >
      <div className="recruitment-summary-card">
        <div className="recruitment-summary-card__deadline">
          <span
            className="recruitment-summary-card__status-pill"
            aria-label={`공고 상태 ${noticeStatusLabel(listing)}`}
          >
            {noticeStatusLabel(listing)}
          </span>
          <span className="recruitment-summary-card__deadline-copy">
            <small>{deadline.context}</small>
            {deadline.dateTime && (
              <time dateTime={deadline.dateTime}>{deadline.dateLabel}</time>
            )}
            {!deadline.dateTime && <time>{deadline.dateLabel}</time>}
          </span>
          <strong aria-label={deadline.accessibleLabel}>{deadline.label}</strong>
        </div>
        <dl className="recruitment-summary-card__facts">
          <div className="recruitment-summary-card__fact--wide">
            <dt>접수 기간</dt>
            <dd>{formatDateRange(listing.applyStart, listing.applyEnd)}</dd>
          </div>
          <div>
            <dt>공고 대상</dt>
            <dd>{listing.audience.join(" · ")}</dd>
          </div>
          <div>
            <dt>가장 최근 경쟁률</dt>
            <dd>{competitionRate === null ? "정보 확인 중" : `${competitionRate} : 1`}</dd>
          </div>
        </dl>
        <button type="button" onClick={onOpenNotice}>
          공고상세 페이지 바로가기
        </button>
      </div>
    </DetailSection>
  );
}

function HousingTypeSection({
  housingTypes,
  selectedHousingType,
  onSelect,
}: {
  housingTypes: readonly HousingTypeInfo[];
  selectedHousingType: HousingTypeInfo;
  onSelect: (code: string) => void;
}) {
  return (
    <DetailSection
      title="주택형 정보"
      description="주택형을 선택하면 평면도와 상세 조건이 함께 바뀝니다."
    >
      <div className="housing-type-tabs" role="tablist" aria-label="주택형 선택">
        {housingTypes.map((housingType) => (
          <button
            key={housingType.code}
            type="button"
            role="tab"
            aria-selected={housingType.code === selectedHousingType.code}
            aria-controls="selected-housing-type"
            onClick={() => onSelect(housingType.code)}
          >
            {housingType.code}
          </button>
        ))}
      </div>
      <div
        id="selected-housing-type"
        className="housing-type-panel"
        role="tabpanel"
        aria-label={`${selectedHousingType.code} 주택형 상세`}
      >
        <div className="housing-type-panel__heading">
          <strong>평면도</strong>
          <span>{selectedHousingType.code} · {selectedHousingType.roomLabel}</span>
        </div>
        <FloorPlan housingType={selectedHousingType} />
        <h4>선택 주택형 상세</h4>
        <dl className="housing-type-facts">
          <DetailFact term="주택형" value={selectedHousingType.code} />
          <DetailFact term="공급 면적" value={`${selectedHousingType.supplyAreaSquareMeters}㎡`} />
          <DetailFact term="전용 면적" value={`${selectedHousingType.exclusiveAreaSquareMeters}㎡`} />
          <DetailFact term="임대보증금" value={formatWon(selectedHousingType.depositWon)} />
          <DetailFact term="월세" value={`월 ${formatWon(selectedHousingType.monthlyRentWon)}`} />
          <DetailFact term="전환 보증금" value={formatWon(selectedHousingType.convertedDepositWon)} />
          <DetailFact
            term="관리비"
            value={`월 평균 ${formatWon(selectedHousingType.monthlyMaintenanceWon)}`}
          />
          <DetailFact term="복층여부" value={selectedHousingType.isDuplex ? "복층" : "해당 없음"} />
        </dl>
        <p className="housing-type-panel__notice">
          금액과 입주 일정은 선택 주택형 기준이며 공고문을 함께 확인해주세요.
        </p>
      </div>
    </DetailSection>
  );
}

function FloorPlan({ housingType }: { housingType: HousingTypeInfo }) {
  const background = housingType.floorPlanUrl
    ? { "--floor-plan-image": `url("${housingType.floorPlanUrl}")` } as CSSProperties
    : undefined;
  return (
    <div
      className={`floor-plan-preview ${housingType.floorPlanUrl ? "has-image" : ""}`}
      role="img"
      aria-label={`${housingType.code} 평면도`}
      style={background}
    >
      {!housingType.floorPlanUrl && (
        <>
          <span className="floor-plan-room floor-plan-room--bed-one">침실 1</span>
          <span className="floor-plan-room floor-plan-room--living">거실</span>
          <span className="floor-plan-room floor-plan-room--kitchen">주방</span>
          <span className="floor-plan-room floor-plan-room--bed-two">침실 2</span>
          <span className="floor-plan-room floor-plan-room--bath">욕실</span>
          <span className="floor-plan-room floor-plan-room--balcony">발코니</span>
        </>
      )}
    </div>
  );
}

function noticeStatusLabel(listing: HousingListing) {
  if (listing.status === "upcoming") return "모집예정";
  if (listing.status === "always") return "상시모집";
  return "접수중";
}

function deadlineLabel(listing: HousingListing) {
  if (listing.daysLeft === null) return "상시";
  return `D-${listing.daysLeft}`;
}

function deadlinePresentation(listing: HousingListing) {
  if (listing.status === "always" || listing.daysLeft === null) {
    return {
      context: "상시 모집",
      label: "상시",
      dateLabel: "별도 마감일 없음",
      dateTime: null,
      accessibleLabel: "상시 모집",
    };
  }
  const upcoming = listing.status === "upcoming";
  const context = upcoming ? "접수 시작까지" : "접수 마감까지";
  const dateTime = upcoming ? listing.applyStart : listing.applyEnd;
  const dateSuffix = upcoming ? "시작" : "마감";
  return {
    context,
    label: deadlineLabel(listing),
    dateLabel: `${dateTime.replaceAll("-", ".")} ${dateSuffix}`,
    dateTime,
    accessibleLabel: `${context} ${listing.daysLeft}일`,
  };
}

function formatDateRange(start: string, end: string) {
  return `${start.replaceAll("-", ".")} – ${end.replaceAll("-", ".")}`;
}

function formatCompetitionRate(value: number | null) {
  if (value === null) return "정보 확인 중";
  return `${value} : 1`;
}

function DetailSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="complex-detail-section">
      <div className="complex-detail-section__heading">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  );
}

function DetailFact({
  term,
  value,
  wide = false,
}: {
  term: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`detail-fact ${wide ? "detail-fact--wide" : ""}`}>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function FacilityRow({ facility }: { facility: NearbyFacility }) {
  return (
    <li>
      <span className="nearby-facility-list__icon">
        {facilityIcon(facility.kind)}
      </span>
      <span>
        <strong>{facility.name}</strong>
        <small>{facilityLabel(facility.kind)}</small>
      </span>
      <b>{facility.travelMode} {facility.minutes}분</b>
    </li>
  );
}

function facilityIcon(kind: NearbyFacilityKind) {
  if (kind === "laundry") return <WashingMachine size={18} />;
  if (kind === "bus-stop") return <BusFront size={18} />;
  if (kind === "subway") return <TrainFront size={18} />;
  if (kind === "large-mart") return <ShoppingCart size={18} />;
  return <Store size={18} />;
}

function facilityLabel(kind: NearbyFacilityKind) {
  const labels: Record<NearbyFacilityKind, string> = {
    "convenience-store": "편의점",
    laundry: "세탁소",
    "bus-stop": "버스정류장",
    subway: "지하철역",
    "large-mart": "대형마트",
  };
  return labels[kind];
}

function formatHouseholds(value: number | null) {
  if (value === null) return "정보 확인 중";
  return `${formatNumber(value)}세대`;
}

function formatParkingSpaces(totalParkingSpaces: number, totalHouseholds: number) {
  if (totalHouseholds <= 0) {
    return `${formatNumber(totalParkingSpaces)}대 (정보 확인 중)`;
  }
  const spacesPerHousehold = (totalParkingSpaces / totalHouseholds).toLocaleString(
    "ko-KR",
    { minimumFractionDigits: 1, maximumFractionDigits: 1 },
  );
  return `${formatNumber(totalParkingSpaces)}대 (${spacesPerHousehold}대)`;
}

function formatWon(value: number) {
  return `${formatNumber(value / 10_000)}만원`;
}

function formatNumber(value: number) {
  return value.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}
