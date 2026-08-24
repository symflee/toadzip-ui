import {
  Building2,
  Check,
  CircleAlert,
  ExternalLink,
  FileText,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import { type CSSProperties, type ReactNode, useState } from "react";
import {
  formatNoticeDate,
  noticeDeadlineContext,
  noticeDeadlineLabel,
  noticeStatusLabel,
  type HousingNotice,
  type NoticeHousingType,
  type NoticeScheduleStep,
  type NoticeSupplyComplex,
  type NoticeSupplyKind,
} from "./housing-notice-data";
import { type EligibilityProfile, type EligibilityTag } from "./housing-data";

interface HousingNoticeDetailPanelProps {
  notice: HousingNotice;
  profile: EligibilityProfile;
  embedded?: boolean;
  onClose: () => void;
  onOpenPdf: () => void;
  onOpenSource: () => void;
  onOpenComplex: (complexId: string) => void;
}

type SupplyFilter = "all" | NoticeSupplyKind;
type EligibilityState = "matched" | "mismatch" | "review";

interface EligibilityCriterion {
  label: string;
  requirement: string;
  userValue: string;
  state: EligibilityState;
}

interface HousingTypeEntry {
  key: string;
  complexName: string;
  housingType: NoticeHousingType;
}

export function HousingNoticeDetailPanel({
  notice,
  profile,
  embedded = false,
  onClose,
  onOpenPdf,
  onOpenSource,
  onOpenComplex,
}: HousingNoticeDetailPanelProps) {
  const supplyComplexes = notice.details.supplyComplexes;
  const [selectedComplexId, setSelectedComplexId] = useState(
    supplyComplexes[0]?.id ?? "",
  );
  const selectedComplex = supplyComplexes.find((complex) => {
    return complex.id === selectedComplexId;
  }) ?? supplyComplexes[0];
  const housingTypeEntries = selectedComplex
    ? housingTypeEntriesForComplex(selectedComplex)
    : [];
  const [supplyFilter, setSupplyFilter] = useState<SupplyFilter>("all");
  const [selectedHousingKey, setSelectedHousingKey] = useState(
    housingTypeEntries[0]?.key ?? "",
  );
  const selectedEntry = housingTypeEntries.find((entry) => {
    return entry.key === selectedHousingKey;
  }) ?? housingTypeEntries[0];
  const filteredEntries = housingTypeEntries.filter((entry) => {
    if (supplyFilter === "all") return true;
    return entry.housingType.supplyKind === supplyFilter;
  });
  const criteria = eligibilityCriteria(notice, profile);
  const supplyHouseholds = notice.details.supplyComplexes.reduce((total, complex) => {
    return total + complex.suppliedHouseholds;
  }, 0);
  const newSupplyUnits = supplyUnitsByKind(housingTypeEntries, "new");
  const resupplyUnits = supplyUnitsByKind(housingTypeEntries, "resupply");

  const chooseComplex = (complexId: string) => {
    const complex = supplyComplexes.find((item) => item.id === complexId);
    if (!complex) return;
    const entries = housingTypeEntriesForComplex(complex);
    setSelectedComplexId(complexId);
    setSupplyFilter("all");
    setSelectedHousingKey(entries[0]?.key ?? "");
  };

  const chooseSupplyFilter = (filter: SupplyFilter) => {
    setSupplyFilter(filter);
    const firstVisible = housingTypeEntries.find((entry) => {
      if (filter === "all") return true;
      return entry.housingType.supplyKind === filter;
    });
    if (firstVisible) setSelectedHousingKey(firstVisible.key);
  };

  return (
    <aside
      className={`complex-detail-panel notice-detail-panel ${embedded ? "is-showcase" : ""}`}
      aria-label={`${notice.title} 공고 상세 정보`}
    >
      <header className="complex-detail-panel__header">
        <div>
          <span>공고 상세 정보</span>
          <strong>{notice.title}</strong>
        </div>
        {!embedded && (
          <button type="button" aria-label="공고 상세 닫기" onClick={onClose}>
            <X size={19} />
          </button>
        )}
      </header>

      <div
        className="complex-detail-panel__scroll notice-detail-panel__scroll"
        role="region"
        aria-label={`${notice.title} 공고 상세 내용`}
        tabIndex={0}
      >
        <section className="notice-detail-identity">
          <div className="notice-detail-identity__badges">
            <span className="notice-detail-badge notice-detail-badge--type">
              {notice.rentalType}
            </span>
            <span className={`notice-detail-badge notice-detail-badge--${notice.status}`}>
              {noticeStatusLabel(notice.status)}
            </span>
            {notice.revision === "corrected" && (
              <span className="notice-detail-badge notice-detail-badge--corrected">
                정정공고중
              </span>
            )}
          </div>
          <h2>{notice.title}</h2>
          <p className="notice-detail-identity__source">
            <Building2 size={15} aria-hidden="true" />
            <strong>{notice.provider}</strong>
            <span aria-hidden="true" />
            {notice.region}
          </p>
          <p className="notice-detail-identity__address">
            <MapPin size={15} aria-hidden="true" /> {notice.details.address}
          </p>
        </section>

        <NoticeDetailSection title="공고 핵심 정보">
          <div className="notice-detail-deadline">
            <span>{noticeDeadlineContext()}</span>
            <strong aria-label={deadlineAccessibleLabel(notice)}>
              {noticeDeadlineLabel(notice)}
            </strong>
            <time dateTime={notice.applyEnd}>
              {formatNoticeDate(notice.applyEnd)}
            </time>
          </div>
          <dl className="notice-detail-facts">
            <NoticeDetailFact term="유형" value={notice.rentalType} />
            <NoticeDetailFact term="공사" value={notice.provider} />
            <NoticeDetailFact term="지역" value={notice.region} />
            <NoticeDetailFact
              term="조회수"
              value={`${notice.viewCount.toLocaleString("ko-KR")}회`}
            />
            <NoticeDetailFact
              term="게시일"
              value={formatNoticeDate(notice.publishedAt)}
            />
            <NoticeDetailFact
              term="접수기간"
              value={formatDateRange(notice.applyStart, notice.applyEnd)}
              wide
            />
          </dl>
        </NoticeDetailSection>

        <NoticeDetailSection
          title="공고 대상"
          description="공고문에 기재된 주요 신청 대상을 정리했습니다."
        >
          <div className="notice-audience-chips">
            {notice.details.audiences.map((audience) => (
              <span key={audience}>{audience}</span>
            ))}
          </div>
        </NoticeDetailSection>

        <NoticeDetailSection
          title="내 조건으로 본 신청자격"
          description={`${profileSummary(profile)} 기준의 간편 비교입니다.`}
        >
          <EligibilitySummary criteria={criteria} />
        </NoticeDetailSection>

        <NoticeDetailSection
          title="상세 공급 일정"
          description={notice.details.moveInNote}
        >
          <ol className="notice-schedule">
            {notice.details.schedule.map((step) => (
              <ScheduleStep key={step.id} step={step} />
            ))}
          </ol>
        </NoticeDetailSection>

        <NoticeDetailSection title="공급 요약">
          <dl className="notice-supply-stats">
            <NoticeDetailFact
              term="공급 단지수"
              value={`${notice.details.supplyComplexes.length}곳`}
            />
            <NoticeDetailFact
              term={notice.unitLabel}
              value={formatUnits(supplyHouseholds, notice.unitLabel)}
            />
          </dl>
        </NoticeDetailSection>

        <NoticeDetailSection
          title="공급 단지별 공고 요약"
          description={`총 ${supplyComplexes.length}개 단지 · ${formatUnits(supplyHouseholds, notice.unitLabel)}`}
        >
          <div className="notice-complex-list">
            {supplyComplexes.map((complex) => {
              const selected = complex.id === selectedComplex?.id;
              const entries = housingTypeEntriesForComplex(complex);
              const newUnits = supplyUnitsByKind(entries, "new");
              const resupplyUnitsForComplex = supplyUnitsByKind(entries, "resupply");
              return (
                <article
                  className={`notice-complex-card ${selected ? "is-selected" : ""}`}
                  aria-label={`${complex.name} 공고 공급 요약`}
                  key={complex.id}
                >
                  <div
                    className="notice-complex-card__image"
                    role="img"
                    aria-label={`${complex.name} 조감도`}
                    style={{
                      "--notice-complex-image": `url("${complex.overviewImageUrl}")`,
                    } as CSSProperties}
                  />
                  <div className="notice-complex-card__body">
                    <h4>{complex.name}</h4>
                    <p>{complex.address}</p>
                    <dl>
                      <NoticeDetailFact
                        term="총 세대 수"
                        value={`${complex.totalHouseholds.toLocaleString("ko-KR")}세대`}
                      />
                      <NoticeDetailFact
                        term={complex.unitLabel}
                        value={formatUnits(complex.suppliedHouseholds, complex.unitLabel)}
                      />
                      <NoticeDetailFact term="신규공급" value={`${newUnits}호`} />
                      <NoticeDetailFact
                        term="재공급"
                        value={`${resupplyUnitsForComplex}호`}
                      />
                    </dl>
                    <div className="notice-complex-card__actions">
                      <button
                        className="notice-complex-card__select"
                        type="button"
                        aria-label={`${complex.name} 주택형 보기`}
                        aria-pressed={selected}
                        onClick={() => chooseComplex(complex.id)}
                      >
                        {selected ? "선택한 단지" : "이 단지 주택형 보기"}
                      </button>
                      <button
                        className="notice-complex-card__detail"
                        type="button"
                        aria-label={`${complex.name} 단지 상세 보기`}
                        onClick={() => onOpenComplex(complex.id)}
                      >
                        단지 상세 보기
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </NoticeDetailSection>

        {selectedComplex && (
          <NoticeDetailSection
            title="공급대상(주택형)"
            description={`${selectedComplex.name} · 신규공급 ${newSupplyUnits}호 · 재공급 ${resupplyUnits}호`}
          >
            <div className="notice-supply-filter" role="tablist" aria-label="공급 구분 선택">
              {[
                ["all", "전체"],
                ["new", "신규공급"],
                ["resupply", "재공급"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={supplyFilter === value}
                  onClick={() => chooseSupplyFilter(value as SupplyFilter)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="notice-supply-table-wrap">
              <table
                className="notice-supply-table"
                aria-label={`${selectedComplex.name} 공급대상 주택형 표`}
              >
                <thead>
                  <tr>
                    <th scope="col">구분</th>
                    <th scope="col">주택형</th>
                    <th scope="col">전용</th>
                    <th scope="col">금회</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr
                      key={entry.key}
                      className={entry.key === selectedHousingKey ? "is-selected" : ""}
                    >
                      <td>
                        <span className={`supply-kind supply-kind--${entry.housingType.supplyKind}`}>
                          {supplyKindLabel(entry.housingType.supplyKind)}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          aria-pressed={entry.key === selectedHousingKey}
                          onClick={() => setSelectedHousingKey(entry.key)}
                        >
                          {entry.housingType.code}
                        </button>
                      </td>
                      <td>{entry.housingType.exclusiveAreaSquareMeters}㎡</td>
                      <td>{entry.housingType.units}호</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NoticeDetailSection>
        )}

        {selectedEntry && (
          <NoticeHousingTypeSection
            entries={housingTypeEntries}
            selectedEntry={selectedEntry}
            unitLabel={selectedComplex?.unitLabel ?? "공급 세대"}
            onSelect={setSelectedHousingKey}
          />
        )}
      </div>

      <footer className="notice-detail-documents">
        <div>
          <span>공고문</span>
          <small title={notice.details.documentName}>{notice.details.documentName}</small>
        </div>
        <nav aria-label="공고문 바로가기">
          <button type="button" onClick={onOpenPdf}>
            <FileText size={16} aria-hidden="true" /> PDF 보기
          </button>
          <button type="button" onClick={onOpenSource}>
            <ExternalLink size={16} aria-hidden="true" /> 공고문 링크
          </button>
        </nav>
      </footer>
    </aside>
  );
}

function EligibilitySummary({
  criteria,
}: {
  criteria: readonly EligibilityCriterion[];
}) {
  const matched = criteria.filter((criterion) => criterion.state === "matched").length;
  const mismatched = criteria.filter((criterion) => criterion.state === "mismatch").length;
  const review = criteria.filter((criterion) => criterion.state === "review").length;
  return (
    <div className="notice-eligibility">
      <div className="notice-eligibility__summary">
        <Sparkles size={18} aria-hidden="true" />
        <div>
          <span>{matched}개 조건 일치{review > 0 ? ` · ${review}개 확인 필요` : ""}</span>
          <strong>{mismatched === 0 ? "신청 가능성이 높아요" : "일부 조건을 확인해 주세요"}</strong>
        </div>
      </div>
      <ul className="notice-eligibility__list">
        {criteria.map((criterion) => (
          <li key={criterion.label} className={`is-${criterion.state}`}>
            <span className="notice-eligibility__icon">
              {criterion.state === "matched" ? <Check size={14} /> : <CircleAlert size={14} />}
            </span>
            <div>
              <strong>{criterion.label}</strong>
              <span>{criterion.requirement}</span>
              <small>{criterion.userValue}</small>
            </div>
          </li>
        ))}
      </ul>
      <p className="notice-eligibility__notice">
        간편 비교 결과이며 최종 신청자격은 반드시 공고문에서 확인해 주세요.
      </p>
    </div>
  );
}

function ScheduleStep({ step }: { step: NoticeScheduleStep }) {
  const date = formatScheduleDate(step);
  return (
    <li
      className={`notice-schedule__step is-${step.status}`}
      aria-label={`${date} | ${step.label}`}
      aria-current={step.status === "current" ? "step" : undefined}
    >
      <time dateTime={step.startAt}>{date}</time>
      <span className="notice-schedule__separator" aria-hidden="true">|</span>
      <strong>{step.label}</strong>
    </li>
  );
}

function NoticeHousingTypeSection({
  entries,
  selectedEntry,
  unitLabel,
  onSelect,
}: {
  entries: readonly HousingTypeEntry[];
  selectedEntry: HousingTypeEntry;
  unitLabel: NoticeSupplyComplex["unitLabel"];
  onSelect: (key: string) => void;
}) {
  const housingType = selectedEntry.housingType;
  return (
    <NoticeDetailSection
      title="주택형 정보"
      description={`${selectedEntry.complexName}의 주택형을 선택하면 평면도와 임대조건이 바뀝니다.`}
    >
      <div
        className="notice-housing-tabs"
        role="tablist"
        aria-label={`${selectedEntry.complexName} 공고 주택형 선택`}
      >
        {entries.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={entry.key === selectedEntry.key}
            onClick={() => onSelect(entry.key)}
          >
            {entry.housingType.code}
          </button>
        ))}
      </div>
      <div
        className="notice-housing-panel"
        role="tabpanel"
        aria-label={`${selectedEntry.complexName} ${housingType.code} 공고 주택형 상세`}
      >
        <div className="notice-floor-plan-modes" role="tablist" aria-label="평면도 보기 방식">
          <button type="button" role="tab" aria-selected="true">2D 평면도</button>
          <button type="button" role="tab" aria-selected="false" disabled>
            3D 평면도 준비 중
          </button>
        </div>
        <NoticeFloorPlan housingType={housingType} />
        <p className="notice-housing-panel__complex">{selectedEntry.complexName}</p>
        <dl className="notice-housing-facts">
          <NoticeDetailFact
            term="주택형명"
            value={`${housingType.code} · ${housingType.roomLabel}`}
            wide
          />
          <NoticeDetailFact
            term={unitLabel === "모집 예비자" ? "금회 모집 예비자" : "금회 공급 세대수"}
            value={formatUnits(housingType.units, unitLabel)}
          />
          <NoticeDetailFact
            term="전용면적"
            value={`${housingType.exclusiveAreaSquareMeters}㎡`}
          />
          <NoticeDetailFact term="보증금" value={formatWon(housingType.depositWon)} />
          <NoticeDetailFact
            term="월임대료"
            value={`월 ${formatWon(housingType.monthlyRentWon)}`}
          />
        </dl>
      </div>
    </NoticeDetailSection>
  );
}

function NoticeFloorPlan({ housingType }: { housingType: NoticeHousingType }) {
  const background = housingType.floorPlanUrl
    ? { "--floor-plan-image": `url("${housingType.floorPlanUrl}")` } as CSSProperties
    : undefined;
  return (
    <div
      className={`floor-plan-preview notice-floor-plan ${housingType.floorPlanUrl ? "has-image" : ""}`}
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

function NoticeDetailSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="notice-detail-section">
      <div className="notice-detail-section__heading">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  );
}

function NoticeDetailFact({
  term,
  value,
  wide = false,
}: {
  term: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`notice-detail-fact ${wide ? "notice-detail-fact--wide" : ""}`}>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function eligibilityCriteria(
  notice: HousingNotice,
  profile: EligibilityProfile,
): EligibilityCriterion[] {
  const tags = notice.details.eligibilityTags;
  const criteria = [
    householdCriterion(tags, profile),
    homelessCriterion(tags, profile),
    householdSizeCriterion(tags, profile),
    incomeCriterion(tags, profile),
    assetCriterion(tags, profile),
  ];
  const extraAudiences = notice.details.audiences.filter((audience) => {
    return audience === "대학생" || audience === "한부모가족";
  });
  if (extraAudiences.length === 0) return criteria;
  return [
    ...criteria,
    {
      label: "세부 신분",
      requirement: `${extraAudiences.join(" · ")} 여부 확인`,
      userValue: "내 조건에 등록되지 않은 정보예요.",
      state: "review",
    },
  ];
}

function householdCriterion(
  tags: readonly EligibilityTag[],
  profile: EligibilityProfile,
): EligibilityCriterion {
  const household = householdProfile(profile);
  return {
    label: "가구 유형",
    requirement: `${household.label} 대상 공고`,
    userValue: `내 조건: ${household.label}`,
    state: tags.includes(household.tag) ? "matched" : "mismatch",
  };
}

function homelessCriterion(
  tags: readonly EligibilityTag[],
  profile: EligibilityProfile,
): EligibilityCriterion {
  const requiresHomeless = tags.includes("homeless");
  return {
    label: "무주택 여부",
    requirement: requiresHomeless ? "무주택 세대구성원" : "별도 제한 없음",
    userValue: `내 조건: ${profile.homeless ? "무주택" : "주택 보유"}`,
    state: !requiresHomeless || profile.homeless ? "matched" : "mismatch",
  };
}

function householdSizeCriterion(
  tags: readonly EligibilityTag[],
  profile: EligibilityProfile,
): EligibilityCriterion {
  const sizeTag = tags.find((tag) => tag.startsWith("size-"));
  const minimumSize = sizeTag === "size-three-plus" ? 3 : sizeTag === "size-two-plus" ? 2 : 1;
  return {
    label: "가구원 수",
    requirement: minimumSize === 1 ? "1인 이상" : `${minimumSize}인 이상`,
    userValue: `내 조건: ${profile.householdSize}인`,
    state: profile.householdSize >= minimumSize ? "matched" : "mismatch",
  };
}

function incomeCriterion(
  tags: readonly EligibilityTag[],
  profile: EligibilityProfile,
): EligibilityCriterion {
  const required = incomeRequirement(tags);
  const profileValue = { under70: 70, under100: 100, under120: 120 }[profile.incomeBand];
  return {
    label: "소득 구간",
    requirement: `기준 중위소득 ${required}% 이하`,
    userValue: `내 조건: ${profileValue}% 이하`,
    state: profileValue <= required ? "matched" : "mismatch",
  };
}

function assetCriterion(
  tags: readonly EligibilityTag[],
  profile: EligibilityProfile,
): EligibilityCriterion {
  const required = assetRequirement(tags);
  const ranks = { low: 1, standard: 2, high: 3 };
  const labels = { low: "낮음", standard: "공고 기준 이내", high: "기준 초과 가능" };
  return {
    label: "자산 구간",
    requirement: `공고 기준: ${labels[required]}`,
    userValue: `내 조건: ${labels[profile.assetBand]}`,
    state: ranks[profile.assetBand] <= ranks[required] ? "matched" : "mismatch",
  };
}

function householdProfile(profile: EligibilityProfile) {
  const values = {
    youth: { label: "청년", tag: "household-youth" },
    newlywed: { label: "신혼부부", tag: "household-newlywed" },
    family: { label: "일반가구", tag: "household-family" },
    senior: { label: "고령자", tag: "household-senior" },
  } as const;
  return values[profile.householdType];
}

function incomeRequirement(tags: readonly EligibilityTag[]) {
  if (tags.includes("income-under-70")) return 70;
  if (tags.includes("income-under-100")) return 100;
  return 120;
}

function assetRequirement(tags: readonly EligibilityTag[]) {
  if (tags.includes("asset-low")) return "low" as const;
  if (tags.includes("asset-standard")) return "standard" as const;
  return "high" as const;
}

function profileSummary(profile: EligibilityProfile) {
  return `${householdProfile(profile).label} · ${profile.householdSize}인 · ${profile.homeless ? "무주택" : "주택 보유"}`;
}

function deadlineAccessibleLabel(notice: HousingNotice) {
  if (notice.status === "closed") return "접수 마감 완료";
  if (notice.daysLeft === null) return "상시 모집";
  return `${noticeDeadlineContext()}까지 ${notice.daysLeft}일`;
}

function formatDateRange(start: string, end: string) {
  return `${formatNoticeDate(start)} – ${formatNoticeDate(end)}`;
}

function formatScheduleDate(step: NoticeScheduleStep) {
  if (step.id === "move-in") return `${step.startAt.slice(0, 7).replace("-", ".")}`;
  if (!step.endAt) return formatNoticeDate(step.startAt);
  return formatDateRange(step.startAt, step.endAt);
}

function supplyUnitsByKind(entries: readonly HousingTypeEntry[], kind: NoticeSupplyKind) {
  return entries.reduce((total, entry) => {
    if (entry.housingType.supplyKind !== kind) return total;
    return total + entry.housingType.units;
  }, 0);
}

function housingTypeEntriesForComplex(complex: NoticeSupplyComplex): HousingTypeEntry[] {
  return complex.housingTypes.map((housingType) => ({
    key: `${complex.id}:${housingType.code}`,
    complexName: complex.name,
    housingType,
  }));
}

function supplyKindLabel(kind: NoticeSupplyKind) {
  return kind === "new" ? "신규" : "재공급";
}

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatUnits(
  units: number,
  label: NoticeSupplyComplex["unitLabel"],
) {
  if (label === "모집 예비자") return `${units.toLocaleString("ko-KR")}명`;
  if (label === "공급 세대") return `${units.toLocaleString("ko-KR")}세대`;
  return `${units.toLocaleString("ko-KR")}호`;
}
