import {
  Bookmark,
  Building2,
  ExternalLink,
  FileText,
  MapPin,
  X,
  ZoomIn,
} from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  formatNoticeDate,
  noticeDeadlineLabel,
  noticeStatusLabel,
  type HousingNotice,
  type NoticeHousingType,
  type NoticeSupplyComplex,
} from "./housing-notice-data";

interface HousingNoticeDetailPanelBProps {
  notice: HousingNotice;
  embedded?: boolean;
  saved: boolean;
  onClose: () => void;
  onToggleSave: () => void;
  onOpenPdf: () => void;
  onOpenSource: () => void;
  onOpenComplex: (complexId: string) => void;
}

interface FloorPlanSelection {
  complex: NoticeSupplyComplex;
  housingType: NoticeHousingType;
}

export function HousingNoticeDetailPanelB({
  notice,
  embedded = false,
  saved,
  onClose,
  onToggleSave,
  onOpenPdf,
  onOpenSource,
  onOpenComplex,
}: HousingNoticeDetailPanelBProps) {
  const complexes = notice.details.supplyComplexes;
  const [selectedComplexId, setSelectedComplexId] = useState(complexes[0]?.id ?? "");
  const [floorPlan, setFloorPlan] = useState<FloorPlanSelection | null>(null);
  const selectedComplex = complexes.find((complex) => {
    return complex.id === selectedComplexId;
  }) ?? complexes[0];
  const suppliedUnits = complexes.reduce((total, complex) => {
    return total + complex.suppliedHouseholds;
  }, 0);

  return (
    <aside
      className={`complex-detail-panel notice-detail-b ${embedded ? "is-showcase" : ""}`}
      aria-label={`${notice.title} 공고 상세 시안 B`}
    >
      <StickyHeader notice={notice} embedded={embedded} onClose={onClose} />

      <div
        className="notice-detail-b__scroll"
        role="region"
        aria-label={`${notice.title} 공고 상세 시안 B 내용`}
        tabIndex={0}
      >
        <NoticeIntro
          notice={notice}
          saved={saved}
          onToggleSave={onToggleSave}
        />
        <CoreInformation
          notice={notice}
          suppliedUnits={suppliedUnits}
        />
        <AudienceSection notice={notice} />
        <ScheduleSection notice={notice} />
        <ComplexComparison
          notice={notice}
          complexes={complexes}
          suppliedUnits={suppliedUnits}
          onOpenComplex={onOpenComplex}
        />
        {selectedComplex && (
          <HousingTypeComparison
            complexes={complexes}
            selectedComplex={selectedComplex}
            onSelectComplex={setSelectedComplexId}
            onOpenFloorPlan={(housingType) => {
              setFloorPlan({ complex: selectedComplex, housingType });
            }}
          />
        )}
      </div>

      <DocumentActions
        notice={notice}
        onOpenPdf={onOpenPdf}
        onOpenSource={onOpenSource}
      />
      {floorPlan && (
        <FloorPlanDialog
          selection={floorPlan}
          onClose={() => setFloorPlan(null)}
        />
      )}
    </aside>
  );
}

function StickyHeader({
  notice,
  embedded,
  onClose,
}: {
  notice: HousingNotice;
  embedded: boolean;
  onClose: () => void;
}) {
  return (
    <header className="notice-detail-b__header">
      <div className="notice-detail-b__header-main">
        <div className="notice-detail-b__header-context">
          <span>{notice.rentalType}</span>
          <span className={`is-${notice.status}`}>{noticeStatusLabel(notice.status)}</span>
          {notice.revision === "corrected" && (
            <span className="is-corrected">정정공고중</span>
          )}
        </div>
        <h2 title={notice.title}>{notice.title}</h2>
      </div>
      <div className="notice-detail-b__header-actions">
        <span
          className="notice-detail-b__header-dday"
          aria-label={deadlineAccessibleLabel(notice)}
        >
          {noticeDeadlineLabel(notice)}
        </span>
        {!embedded && (
          <button type="button" aria-label="공고 상세 닫기" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}

function NoticeIntro({
  notice,
  saved,
  onToggleSave,
}: {
  notice: HousingNotice;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const firstComplex = notice.details.supplyComplexes[0];
  const remainingComplexes = notice.details.supplyComplexes.length - 1;
  return (
    <section className="notice-detail-b__intro" aria-label="공고 요약">
      <div className="notice-detail-b__intro-copy">
        <div>
          <Building2 size={15} aria-hidden="true" />
          <strong>{notice.provider}</strong>
          <span aria-hidden="true" />
          <b>{notice.region}</b>
        </div>
        {firstComplex && (
          <p>
            <MapPin size={15} aria-hidden="true" />
            <span>{firstComplex.name}</span>
            {remainingComplexes > 0 && <em>외 {remainingComplexes}곳</em>}
          </p>
        )}
      </div>
      <button
        className="notice-detail-b__save"
        type="button"
        aria-label={saved ? "공고 저장 해제" : "공고 저장"}
        aria-pressed={saved}
        onClick={onToggleSave}
      >
        <Bookmark size={15} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
        {saved ? "저장됨" : "공고 저장"}
      </button>
    </section>
  );
}

function CoreInformation({
  notice,
  suppliedUnits,
}: {
  notice: HousingNotice;
  suppliedUnits: number;
}) {
  return (
    <DetailSection title="공고 핵심 정보">
      <div className="notice-detail-b__deadline">
        <div>
          <span>접수 마감</span>
          <time dateTime={notice.applyEnd}>{formatNoticeDate(notice.applyEnd)}</time>
        </div>
        <strong aria-label={deadlineAccessibleLabel(notice)}>
          {noticeDeadlineLabel(notice)}
        </strong>
      </div>
      <dl className="notice-detail-b__core-facts">
        <CompactFact
          term="접수기간"
          value={formatDateRange(notice.applyStart, notice.applyEnd)}
        />
        <CompactFact
          term="공급 규모"
          value={`${notice.details.supplyComplexes.length}개 단지 · ${formatUnits(suppliedUnits, notice.unitLabel)}`}
        />
        <CompactFact term="지역" value={notice.region} />
        <CompactFact term="공사" value={notice.provider} />
      </dl>
      <div className="notice-detail-b__meta">
        <span>게시 {formatNoticeDate(notice.publishedAt)}</span>
        <span>{viewCountLabel(notice)}</span>
      </div>
    </DetailSection>
  );
}

function AudienceSection({ notice }: { notice: HousingNotice }) {
  return (
    <DetailSection
      title="신청 대상"
      description="세부 소득·자산 기준과 최종 신청자격은 공고문에서 확인해 주세요."
    >
      <div className="notice-detail-b__audiences">
        {notice.details.audiences.map((audience) => (
          <span key={audience}>{audience}</span>
        ))}
      </div>
    </DetailSection>
  );
}

function ScheduleSection({ notice }: { notice: HousingNotice }) {
  const hasMoveInStep = notice.details.schedule.some((step) => {
    return step.id === "move-in";
  });
  return (
    <DetailSection title="접수 일정">
      <ol className="notice-detail-b__schedule">
        {notice.details.schedule.map((step) => (
          <li
            className={`is-${step.status}`}
            key={step.id}
            aria-current={step.status === "current" ? "step" : undefined}
          >
            <strong>{step.label}</strong>
            <time dateTime={step.startAt}>{formatScheduleRange(step.startAt, step.endAt)}</time>
            {step.status === "current" && <span>현재 단계</span>}
          </li>
        ))}
        {!hasMoveInStep && (
          <li className="is-upcoming">
            <strong>입주 예정</strong>
            <span>{notice.details.moveInNote || "미정"}</span>
          </li>
        )}
      </ol>
    </DetailSection>
  );
}

function ComplexComparison({
  notice,
  complexes,
  suppliedUnits,
  onOpenComplex,
}: {
  notice: HousingNotice;
  complexes: readonly NoticeSupplyComplex[];
  suppliedUnits: number;
  onOpenComplex: (complexId: string) => void;
}) {
  return (
    <DetailSection
      title="단지 비교"
      description="주소와 주택형별 면적·임대조건 범위를 한눈에 비교합니다."
      aside={`${complexes.length}개 단지 · ${formatUnits(suppliedUnits, notice.unitLabel)}`}
    >
      <div className="notice-detail-b__complex-list">
        {complexes.map((complex) => (
          <article
            className="notice-detail-b__complex-card"
            aria-label={`${complex.name} 단지 비교`}
            key={complex.id}
          >
            <div
              className="notice-detail-b__complex-image"
              role="img"
              aria-label={`${complex.name} 조감도`}
              style={{
                "--notice-detail-b-complex-image": `url("${complex.overviewImageUrl}")`,
              } as CSSProperties}
            />
            <div className="notice-detail-b__complex-body">
              <div className="notice-detail-b__complex-heading">
                <div>
                  <strong>{complex.name}</strong>
                  <span>{notice.rentalType}</span>
                </div>
                <button
                  type="button"
                  aria-label={`${complex.name} 단지 상세 보기`}
                  onClick={() => onOpenComplex(complex.id)}
                >
                  단지 상세
                </button>
              </div>
              <p className="notice-detail-b__complex-region">{notice.region}</p>
              <p className="notice-detail-b__complex-address">{complex.address}</p>
              <div className="notice-detail-b__complex-counts">
                <span>총 <b>{complex.totalHouseholds.toLocaleString("ko-KR")}세대</b></span>
                <span>{complex.unitLabel} <b>{formatUnits(complex.suppliedHouseholds, complex.unitLabel)}</b></span>
              </div>
            </div>
            <dl className="notice-detail-b__complex-ranges">
              <CompactFact term="전용면적" value={areaRange(complex.housingTypes)} />
              <CompactFact term="보증금" value={moneyRange(complex.housingTypes, "depositWon")} />
              <CompactFact term="월 임대료" value={moneyRange(complex.housingTypes, "monthlyRentWon", true)} />
            </dl>
          </article>
        ))}
      </div>
    </DetailSection>
  );
}

function HousingTypeComparison({
  complexes,
  selectedComplex,
  onSelectComplex,
  onOpenFloorPlan,
}: {
  complexes: readonly NoticeSupplyComplex[];
  selectedComplex: NoticeSupplyComplex;
  onSelectComplex: (complexId: string) => void;
  onOpenFloorPlan: (housingType: NoticeHousingType) => void;
}) {
  const panelId = `notice-detail-b-types-${selectedComplex.id}`;
  return (
    <DetailSection
      title="주택형 비교"
      description="단지를 고른 뒤 공급 구분·면적·공급량·비용을 같은 열에서 비교하세요."
    >
      <div
        className="notice-detail-b__complex-tabs"
        role="tablist"
        aria-label="주택형을 볼 단지 선택"
      >
        {complexes.map((complex) => (
          <button
            key={complex.id}
            id={`notice-detail-b-tab-${complex.id}`}
            type="button"
            role="tab"
            aria-controls={panelId}
            aria-selected={complex.id === selectedComplex.id}
            tabIndex={complex.id === selectedComplex.id ? 0 : -1}
            onClick={() => onSelectComplex(complex.id)}
            onKeyDown={(event) => handleComplexTabKeyDown(event, complexes, onSelectComplex)}
          >
            <span>{complex.name}</span>
            <b>{formatUnits(complex.suppliedHouseholds, complex.unitLabel)}</b>
          </button>
        ))}
      </div>
      <div
        className="notice-detail-b__types"
        id={panelId}
        role="tabpanel"
        aria-labelledby={`notice-detail-b-tab-${selectedComplex.id}`}
      >
        <div className="notice-detail-b__type-columns" aria-hidden="true">
          <span>공급 구분</span>
          <span>전용면적</span>
          <span>{selectedComplex.unitLabel}</span>
          <span>보증금</span>
          <span>월세</span>
        </div>
        <div className="notice-detail-b__type-list">
          {selectedComplex.housingTypes.map((housingType) => (
            <article
              className="notice-detail-b__type-card"
              aria-label={`${selectedComplex.name} ${housingType.code} 주택형`}
              key={`${selectedComplex.id}-${housingType.code}-${housingType.supplyKind}`}
            >
              <div className="notice-detail-b__type-heading">
                <div>
                  <strong>{housingType.code}</strong>
                  <span>{housingType.roomLabel}</span>
                </div>
                <button
                  type="button"
                  aria-label={`${selectedComplex.name} ${housingType.code} 평면도 보기`}
                  onClick={() => onOpenFloorPlan(housingType)}
                >
                  <ZoomIn size={14} aria-hidden="true" /> 평면도 보기
                </button>
              </div>
              <dl className="notice-detail-b__type-metrics">
                <CompactFact
                  term="공급 구분"
                  value={housingType.supplyKind === "new" ? "신규공급" : "재공급"}
                  tone={housingType.supplyKind}
                />
                <CompactFact
                  term="전용면적"
                  value={`${formatArea(housingType.exclusiveAreaSquareMeters)}㎡`}
                />
                <CompactFact
                  term={selectedComplex.unitLabel}
                  value={formatUnits(housingType.units, selectedComplex.unitLabel)}
                />
                <CompactFact term="보증금" value={compactWon(housingType.depositWon)} />
                <CompactFact term="월세" value={compactWon(housingType.monthlyRentWon, true)} />
              </dl>
            </article>
          ))}
        </div>
      </div>
    </DetailSection>
  );
}

function DocumentActions({
  notice,
  onOpenPdf,
  onOpenSource,
}: {
  notice: HousingNotice;
  onOpenPdf: () => void;
  onOpenSource: () => void;
}) {
  const pdfPending = !notice.details.pdfUrl;
  const sourcePending = !notice.details.sourceUrl;
  const linkStatus = [
    pdfPending ? "PDF 링크 확인 중" : "PDF 연결됨",
    sourcePending ? "원문 링크 확인 중" : "원문 연결됨",
  ].join(" · ");
  return (
    <footer className="notice-detail-b__documents">
      <div>
        <FileText size={16} aria-hidden="true" />
        <span>
          <strong>공고문</strong>
          <small title={notice.details.documentName}>{notice.details.documentName}</small>
          <em>{linkStatus}</em>
        </span>
      </div>
      <nav aria-label="공고문 바로가기">
        <button type="button" disabled={pdfPending} onClick={onOpenPdf}>
          <FileText size={15} aria-hidden="true" /> PDF 보기
        </button>
        <button type="button" disabled={sourcePending} onClick={onOpenSource}>
          <ExternalLink size={15} aria-hidden="true" /> 공고문 링크
        </button>
      </nav>
    </footer>
  );
}

function FloorPlanDialog({
  selection,
  onClose,
}: {
  selection: FloorPlanSelection;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = `notice-detail-b-plan-${selection.complex.id}-${selection.housingType.code}`;
  const { housingType } = selection;

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", closeOnEscape);
      returnFocusRef.current?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="notice-detail-b__modal-layer"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="notice-detail-b__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={trapDialogFocus}
      >
        <header>
          <div>
            <span>{selection.complex.name}</span>
            <h2 id={titleId}>{housingType.code} 평면도</h2>
          </div>
          <button type="button" aria-label="평면도 닫기" onClick={onClose}>
            <X size={19} aria-hidden="true" />
          </button>
        </header>
        <div className="notice-detail-b__modal-status">
          <span>{housingType.floorPlanUrl ? "2D 평면도 제공" : "2D 프로토타입 예시"}</span>
          <span>{housingType.floorPlan3dUrl ? "3D 평면도 제공" : "3D 평면도 정보 없음"}</span>
        </div>
        <dl className="notice-detail-b__modal-summary">
          <CompactFact
            term="공급 구분"
            value={housingType.supplyKind === "new" ? "신규공급" : "재공급"}
          />
          <CompactFact
            term="전용면적"
            value={`${formatArea(housingType.exclusiveAreaSquareMeters)}㎡`}
          />
          <CompactFact
            term={selection.complex.unitLabel}
            value={formatUnits(housingType.units, selection.complex.unitLabel)}
          />
          <CompactFact term="보증금" value={compactWon(housingType.depositWon)} />
          <CompactFact term="월세" value={compactWon(housingType.monthlyRentWon, true)} />
        </dl>
        <FloorPlanPreview housingType={housingType} />
      </section>
    </div>
  );
}

function FloorPlanPreview({ housingType }: { housingType: NoticeHousingType }) {
  const imageStyle = housingType.floorPlanUrl
    ? { "--notice-detail-b-plan-image": `url("${housingType.floorPlanUrl}")` } as CSSProperties
    : undefined;
  return (
    <div
      className={`notice-detail-b__plan ${housingType.floorPlanUrl ? "has-image" : ""}`}
      role="img"
      aria-label={`${housingType.code} 주택형 2D 평면도`}
      style={imageStyle}
    >
      {!housingType.floorPlanUrl && (
        <>
          <span className="is-bedroom">침실</span>
          <span className="is-living">거실</span>
          <span className="is-kitchen">주방</span>
          <span className="is-bath">욕실</span>
          <span className="is-balcony">발코니</span>
        </>
      )}
    </div>
  );
}

function DetailSection({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description?: string;
  aside?: string;
  children: ReactNode;
}) {
  return (
    <section className="notice-detail-b__section">
      <div className="notice-detail-b__section-heading">
        <div>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        {aside && <span>{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function CompactFact({
  term,
  value,
  tone,
}: {
  term: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className={tone ? `is-${tone}` : undefined}>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function handleComplexTabKeyDown(
  event: ReactKeyboardEvent<HTMLButtonElement>,
  complexes: readonly NoticeSupplyComplex[],
  onSelect: (complexId: string) => void,
) {
  const currentIndex = complexes.findIndex((complex) => {
    return complex.id === event.currentTarget.id.replace("notice-detail-b-tab-", "");
  });
  const nextIndex = tabIndexForKey(event.key, currentIndex, complexes.length);
  if (nextIndex === null) return;
  event.preventDefault();
  const nextComplex = complexes[nextIndex];
  if (!nextComplex) return;
  onSelect(nextComplex.id);
  event.currentTarget.parentElement
    ?.querySelectorAll<HTMLButtonElement>("[role='tab']")[nextIndex]
    ?.focus();
}

function tabIndexForKey(key: string, currentIndex: number, length: number) {
  if (key === "Home") return 0;
  if (key === "End") return length - 1;
  if (key === "ArrowRight") return (currentIndex + 1) % length;
  if (key === "ArrowLeft") return (currentIndex - 1 + length) % length;
  return null;
}

function trapDialogFocus(event: ReactKeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return;
  const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
    "button:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const wrapsBackward = event.shiftKey && document.activeElement === first;
  const wrapsForward = !event.shiftKey && document.activeElement === last;
  if (!wrapsBackward && !wrapsForward) return;
  event.preventDefault();
  if (wrapsBackward) last.focus();
  if (wrapsForward) first.focus();
}

function formatDateRange(start: string, end: string) {
  return `${formatNoticeDate(start)} – ${formatNoticeDate(end)}`;
}

function formatScheduleRange(start: string, end: string | null) {
  if (!end || start === end) return formatNoticeDate(start);
  return formatDateRange(start, end);
}

function formatUnits(
  units: number,
  label: NoticeSupplyComplex["unitLabel"] | HousingNotice["unitLabel"],
) {
  const formatted = units.toLocaleString("ko-KR");
  if (label === "모집 예비자") return `${formatted}명`;
  if (label === "모집 호수") return `${formatted}호`;
  return `${formatted}세대`;
}

function viewCountLabel(notice: HousingNotice) {
  if (notice.sourceKind === "notice-document" && notice.viewCount === 0) {
    return "조회 정보 확인 중";
  }
  return `조회 ${notice.viewCount.toLocaleString("ko-KR")}`;
}

function areaRange(housingTypes: readonly NoticeHousingType[]) {
  const values = housingTypes.map((housingType) => housingType.exclusiveAreaSquareMeters);
  if (!values.length) return "정보 확인 중";
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) return `${formatArea(minimum)}㎡`;
  return `${formatArea(minimum)}–${formatArea(maximum)}㎡`;
}

function moneyRange(
  housingTypes: readonly NoticeHousingType[],
  key: "depositWon" | "monthlyRentWon",
  monthly = false,
) {
  const values = housingTypes.map((housingType) => housingType[key]);
  if (!values.length) return "정보 확인 중";
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const prefix = monthly ? "월 " : "";
  if (minimum === maximum) return `${prefix}${tenThousandWon(minimum)}만원`;
  return `${prefix}${tenThousandWon(minimum)}–${tenThousandWon(maximum)}만원`;
}

function compactWon(value: number, monthly = false) {
  const prefix = monthly ? "월 " : "";
  return `${prefix}${tenThousandWon(value)}만원`;
}

function tenThousandWon(value: number) {
  return (value / 10_000).toLocaleString("ko-KR", {
    maximumFractionDigits: 1,
  });
}

function formatArea(value: number) {
  return value.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
}

function deadlineAccessibleLabel(notice: HousingNotice) {
  if (notice.status === "closed") return "접수 마감";
  if (notice.daysLeft === null) return "상시 모집";
  if (notice.daysLeft === 0) return "접수 마감일";
  return `접수 마감까지 ${notice.daysLeft}일`;
}
