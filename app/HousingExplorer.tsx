"use client";

import {
  Bell,
  BellRing,
  Bookmark,
  Check,
  ChevronDown,
  CircleAlert,
  Heart,
  Home,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HousingComplexDetailPanel } from "./HousingComplexDetailPanel";
import { HousingMap } from "./HousingMap";
import { HousingNoticeDetailPanel } from "./HousingNoticeDetailPanel";
import {
  formatNoticeDate,
  HOUSING_NOTICES,
  noticeDeadlineContext,
  noticeDeadlineLabel,
  noticeStatusLabel,
  type HousingNotice,
} from "./housing-notice-data";
import {
  DEFAULT_FILTERS,
  DEFAULT_PROFILE,
  filterListings,
  formatMoney,
  HOUSING_LISTINGS,
  sortListings,
  type EligibilityProfile,
  type HousingListing,
  type MapViewport,
  type SearchFilters,
} from "./housing-data";

const SAVED_STORAGE_KEY = "toadzip:saved-listings";
const SAVED_NOTICE_STORAGE_KEY = "toadzip:saved-notices";
const ALERT_STORAGE_KEY = "toadzip:listing-alerts";
const PROFILE_STORAGE_KEY = "toadzip:eligibility-profile";
const PROTOTYPE_VARIANTS = ["A", "B", "C"] as const;

type PrototypeVariant = (typeof PROTOTYPE_VARIANTS)[number];

interface FilterSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  active?: boolean;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  active = false,
}: FilterSelectProps) {
  return (
    <label className={`filter-select ${active ? "is-active" : ""}`}>
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} aria-hidden="true" />
    </label>
  );
}

function listingStatus(listing: HousingListing) {
  if (listing.status === "upcoming") {
    return {
      label: "모집예정",
      deadline: listing.daysLeft === null ? null : `D-${listing.daysLeft}`,
    };
  }
  if (listing.status === "always") {
    return { label: "상시모집", deadline: null };
  }
  return {
    label: "접수중",
    deadline: listing.daysLeft === null ? null : `D-${listing.daysLeft}`,
  };
}

function profileLabel(profile: EligibilityProfile) {
  const labels = {
    youth: "청년",
    newlywed: "신혼부부",
    family: "일반가구",
    senior: "고령자",
  };
  return `${labels[profile.householdType]} · ${profile.householdSize}인 · ${profile.homeless ? "무주택" : "주택 보유"}`;
}

function ListingCard({
  listing,
  selected,
  hovered,
  saved,
  alerted,
  cardRef,
  onSelect,
  onHover,
  onSave,
  onAlert,
  onOpenNotice,
}: {
  listing: HousingListing;
  selected: boolean;
  hovered: boolean;
  saved: boolean;
  alerted: boolean;
  cardRef: (node: HTMLElement | null) => void;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
  onSave: () => void;
  onAlert: () => void;
  onOpenNotice: () => void;
}) {
  const status = listingStatus(listing);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect();
  };

  return (
    <article
      ref={cardRef}
      className={`listing-card ${selected ? "is-selected" : ""} ${hovered ? "is-hovered" : ""}`}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      aria-label={`${listing.title}, ${listing.areaSquareMeters}제곱미터, 월 ${formatMoney(listing.monthlyRentWon)}`}
    >
      <div
        className="listing-card__media"
        role="img"
        aria-label={`${listing.title} 단지 이미지`}
        style={{
          "--listing-image": `url("${listing.complexDetails.photoUrl}")`,
        } as CSSProperties}
      >
        <div className="listing-card__media-badges">
          <span className={`status-badge status-badge--${listing.status}`}>
            {status.label}
          </span>
          {status.deadline && (
            <span className="deadline-badge">{status.deadline}</span>
          )}
        </div>
      </div>

      <section className="listing-card__summary">
        <div className="listing-card__summary-topline">
          <p className="listing-card__location">
            {listing.regionLabel} {listing.district}
          </p>
          <button
            className={`icon-button save-button listing-card__bookmark ${saved ? "is-saved" : ""}`}
            type="button"
            aria-label={saved ? `${listing.title} 저장 해제` : `${listing.title} 저장`}
            aria-pressed={saved}
            onClick={(event) => {
              event.stopPropagation();
              onSave();
            }}
          >
            <Bookmark size={21} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        <h3>{listing.title}</h3>
        <p className="listing-card__operator">
          <strong>{listing.provider}</strong>
          <span aria-hidden="true" />
          <strong>{listing.rentalType}</strong>
        </p>

        <div className="listing-card__tags">
          <span>전용 {listing.areaSquareMeters}㎡</span>
          <span>
            {listing.completedAt ? `준공 ${listing.completedAt}` : "준공 정보 확인 중"}
          </span>
        </div>
      </section>

      <aside className="listing-card__conditions" aria-label="주요 임대 조건">
        <p className="listing-card__conditions-title">주요 임대 조건</p>
        <div className="listing-card__condition">
          <span>임대보증금</span>
          <strong>{formatMoney(listing.depositWon)}</strong>
        </div>
        <div className="listing-card__condition listing-card__condition--monthly">
          <span>월 임대료</span>
          <strong>{formatMoney(listing.monthlyRentWon)}</strong>
        </div>
        {listing.status === "upcoming" && (
          <button
            type="button"
            className={`alert-button listing-card__action ${alerted ? "is-alerted" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              onAlert();
            }}
          >
            {alerted ? <BellRing size={15} /> : <Bell size={15} />}
            {alerted ? "알림 설정됨" : "공고 알림"}
          </button>
        )}
        {listing.status !== "upcoming" && (
          <button
            type="button"
            className="listing-primary-action listing-card__action"
            onClick={(event) => {
              event.stopPropagation();
              onOpenNotice();
            }}
          >
            공고 확인
          </button>
        )}
      </aside>
    </article>
  );
}

function NoticeCard({
  notice,
  selected,
  saved,
  onSelect,
  onSave,
}: {
  notice: HousingNotice;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onSave: () => void;
}) {
  const status = noticeStatusLabel(notice.status);
  const deadline = noticeDeadlineLabel(notice);
  const deadlineContext = noticeDeadlineContext();
  const recruitment = notice.recruitmentKind === "reserve" ? "예비입주자" : "신규입주자";
  const deadlineAria = notice.daysLeft === null
    ? "상시 모집"
    : `${deadlineContext}까지 ${notice.daysLeft}일`;
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect();
  };

  return (
    <article
      className={`notice-card ${selected ? "is-selected" : ""}`}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-current={selected ? "true" : undefined}
      aria-label={`${notice.title}, ${status}, ${deadline}`}
    >
      <div className="notice-card__topline">
        <div className="notice-card__classification">
          <span className="notice-card__rental-type">{notice.rentalType}</span>
          <span className="notice-card__recruitment">{recruitment}</span>
        </div>
        <button
          className={`icon-button notice-card__bookmark ${saved ? "is-saved" : ""}`}
          type="button"
          aria-label={saved ? `${notice.title} 공고 저장 해제` : `${notice.title} 공고 저장`}
          aria-pressed={saved}
          onClick={(event) => {
            event.stopPropagation();
            onSave();
          }}
        >
          <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <h3>{notice.title}</h3>

      <p className="notice-card__source">
        <MapPin size={13} aria-hidden="true" />
        <span>{notice.region}</span>
        <i aria-hidden="true" />
        <strong>{notice.provider}</strong>
      </p>

      <div className="notice-card__deadline">
        <div className="notice-card__status-group">
          <span className={`notice-card__status notice-card__status--${notice.status}`}>
            {status}
          </span>
          {notice.revision === "corrected" && (
            <span className="notice-card__revision">정정공고중</span>
          )}
        </div>
        <p aria-label={deadlineAria}>
          <span>{deadlineContext}</span>
          <strong>{deadline}</strong>
        </p>
      </div>

      <dl className="notice-card__facts">
        <div className="notice-card__period">
          <dt>접수기간</dt>
          <dd>
            <time dateTime={notice.applyStart}>{formatNoticeDate(notice.applyStart)}</time>
            <span aria-hidden="true"> – </span>
            <time dateTime={notice.applyEnd}>{formatNoticeDate(notice.applyEnd)}</time>
          </dd>
        </div>
        <div>
          <dt>모집 호수</dt>
          <dd>{notice.units.toLocaleString("ko-KR")}호</dd>
        </div>
        <div>
          <dt>조회수</dt>
          <dd>{notice.viewCount.toLocaleString("ko-KR")}</dd>
        </div>
      </dl>
    </article>
  );
}

function EmptyResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="empty-results">
      <span className="empty-results__icon">
        <Search size={23} />
      </span>
      <h3>조건에 맞는 집을 찾지 못했어요</h3>
      <p>월 임대료나 면적 조건을 조금 넓히면 더 많은 집을 볼 수 있어요.</p>
      <button type="button" onClick={onReset}>
        <RotateCcw size={16} /> 필터 초기화
      </button>
    </div>
  );
}

function ListingFilterSheet({
  filters,
  resultCount,
  onChange,
  onReset,
  onClose,
}: {
  filters: SearchFilters;
  resultCount: number;
  onChange: (updates: Partial<SearchFilters>) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const statusValue = filters.statuses.length === 0
    ? "all"
    : filters.statuses.length === 2
      ? "active"
      : filters.statuses[0];
  const rentalValue = filters.rentalTypes[0] ?? "all";
  const providerValue = filters.providers[0] ?? "all";
  const audienceValue = filters.audiences[0] ?? "all";

  return (
    <aside
      id="listing-filter-sheet"
      className="list-filter-sheet"
      role="dialog"
      aria-modal="false"
      aria-labelledby="listing-filter-title"
    >
      <header className="list-filter-sheet__header">
        <div>
          <span>단지 목록</span>
          <h2 id="listing-filter-title">검색 필터</h2>
        </div>
        <div className="list-filter-sheet__header-actions">
          <button type="button" className="list-filter-sheet__reset" onClick={onReset}>
            <RotateCcw size={14} /> 초기화
          </button>
          <button type="button" className="list-filter-sheet__close" onClick={onClose} aria-label="검색 필터 닫기">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="list-filter-sheet__body">
        <div className="list-filter-sheet__grid">
          <FilterField label="모집 상태">
            <FilterSelect
              label="모집 상태"
              value={statusValue}
              active={statusValue !== "active"}
              options={[
                { value: "active", label: "모집중 + 모집예정" },
                { value: "open", label: "모집중" },
                { value: "upcoming", label: "모집예정" },
                { value: "always", label: "상시모집" },
                { value: "all", label: "모든 상태" },
              ]}
              onChange={(value) =>
                onChange({
                  statuses: value === "all"
                    ? []
                    : value === "active"
                      ? ["open", "upcoming"]
                      : [value as HousingListing["status"]],
                })
              }
            />
          </FilterField>
          <FilterField label="임대 유형">
            <FilterSelect
              label="임대 유형"
              value={rentalValue}
              active={rentalValue !== "all"}
              options={[
                { value: "all", label: "전체 임대유형" },
                { value: "행복주택", label: "행복주택" },
                { value: "매입임대", label: "청년매입임대" },
                { value: "국민임대", label: "국민임대" },
                { value: "영구임대", label: "영구임대" },
              ]}
              onChange={(value) => onChange({ rentalTypes: value === "all" ? [] : [value] })}
            />
          </FilterField>
          <FilterField label="월 임대료">
            <FilterSelect
              label="월 임대료"
              value={String(filters.maxMonthlyRentWon ?? 0)}
              active={filters.maxMonthlyRentWon !== null}
              options={[
                { value: "0", label: "제한 없음" },
                { value: "100000", label: "월 10만원 이하" },
                { value: "200000", label: "월 20만원 이하" },
                { value: "300000", label: "월 30만원 이하" },
                { value: "400000", label: "월 40만원 이하" },
              ]}
              onChange={(value) => onChange({ maxMonthlyRentWon: value === "0" ? null : Number(value) })}
            />
          </FilterField>
          <FilterField label="보증금">
            <FilterSelect
              label="보증금"
              value={String(filters.maxDepositWon ?? 0)}
              active={filters.maxDepositWon !== null}
              options={[
                { value: "0", label: "제한 없음" },
                { value: "10000000", label: "1천만원 이하" },
                { value: "30000000", label: "3천만원 이하" },
                { value: "50000000", label: "5천만원 이하" },
                { value: "100000000", label: "1억원 이하" },
              ]}
              onChange={(value) => onChange({ maxDepositWon: value === "0" ? null : Number(value) })}
            />
          </FilterField>
          <FilterField label="최소 면적">
            <FilterSelect
              label="최소 면적"
              value={String(filters.minAreaSquareMeters ?? 0)}
              active={filters.minAreaSquareMeters !== null}
              options={[
                { value: "0", label: "제한 없음" },
                { value: "26", label: "26㎡ 이상" },
                { value: "36", label: "36㎡ 이상" },
                { value: "46", label: "46㎡ 이상" },
                { value: "59", label: "59㎡ 이상" },
              ]}
              onChange={(value) => onChange({ minAreaSquareMeters: value === "0" ? null : Number(value) })}
            />
          </FilterField>
          <FilterField label="공급 기관">
            <FilterSelect
              label="공급 기관"
              value={providerValue}
              active={providerValue !== "all"}
              options={[
                { value: "all", label: "전체 공급기관" },
                { value: "LH", label: "LH" },
                { value: "GH", label: "GH" },
                { value: "성남도시개발공사", label: "성남시" },
              ]}
              onChange={(value) => onChange({ providers: value === "all" ? [] : [value] })}
            />
          </FilterField>
          <FilterField label="입주 대상">
            <FilterSelect
              label="입주 대상"
              value={audienceValue}
              active={audienceValue !== "all"}
              options={[
                { value: "all", label: "전체 입주대상" },
                { value: "청년", label: "청년" },
                { value: "신혼부부", label: "신혼부부" },
                { value: "일반", label: "일반가구" },
                { value: "고령자", label: "고령자" },
              ]}
              onChange={(value) => onChange({ audiences: value === "all" ? [] : [value] })}
            />
          </FilterField>
          <button
            type="button"
            className={`profile-filter list-filter-sheet__wide ${filters.profileOnly ? "is-active" : ""}`}
            aria-pressed={filters.profileOnly}
            onClick={() => onChange({ profileOnly: !filters.profileOnly })}
          >
            <Sparkles size={16} /> 내 조건 4개 이상 일치
          </button>
        </div>
      </div>

      <footer className="list-filter-sheet__footer">
        <button type="button" onClick={onClose}>{resultCount}건 결과 보기</button>
      </footer>
    </aside>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="list-filter-field">
      <span>{label}</span>
      {children}
    </div>
  );
}

function countActiveFilters(filters: SearchFilters) {
  const usesDefaultStatuses = filters.statuses.length === DEFAULT_FILTERS.statuses.length
    && DEFAULT_FILTERS.statuses.every((status) => filters.statuses.includes(status));
  return [
    !usesDefaultStatuses,
    filters.rentalTypes.length > 0,
    filters.maxMonthlyRentWon !== null,
    filters.maxDepositWon !== null,
    filters.minAreaSquareMeters !== null,
    filters.providers.length > 0,
    filters.audiences.length > 0,
    filters.profileOnly,
  ].filter(Boolean).length;
}

function EligibilityPanel({
  profile,
  onApply,
  onClose,
}: {
  profile: EligibilityProfile;
  onApply: (profile: EligibilityProfile) => void;
  onClose: () => void;
}) {
  const [draftProfile, setDraftProfile] = useState(profile);
  const dialogRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const update = <Key extends keyof EligibilityProfile>(
    key: Key,
    value: EligibilityProfile[Key],
  ) => setDraftProfile((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    });
    return () => {
      window.cancelAnimationFrame(focusFrame);
      returnFocusRef.current?.focus();
    };
  }, []);

  const trapFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      "button:not(:disabled), select:not(:disabled), input:not(:disabled)",
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const wrapBackward = event.shiftKey && document.activeElement === first;
    const wrapForward = !event.shiftKey && document.activeElement === last;
    if (!wrapBackward && !wrapForward) return;
    event.preventDefault();
    if (wrapBackward) last.focus();
    if (wrapForward) first.focus();
  };

  return (
    <div
      className="sheet-layer"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="eligibility-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="eligibility-title"
        aria-describedby="eligibility-description"
        onKeyDown={trapFocus}
      >
        <div className="sheet-header">
          <div>
            <span className="eyebrow">30초 조건 설정</span>
            <h2 id="eligibility-title">나에게 맞는 공공임대 찾기</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="닫기">
            <X size={21} />
          </button>
        </div>

        <div className="eligibility-sheet__scroll">
          <div className="sheet-notice" id="eligibility-description">
            <CircleAlert size={18} />
            <p>
              빠른 비교를 위한 간편 조건입니다. 실제 신청 자격은 반드시 원문 공고에서
              확인해 주세요.
            </p>
          </div>

          <div className="profile-form">
          <fieldset>
            <legend>가구 유형</legend>
            <div className="segmented-grid segmented-grid--four">
              {[
                ["youth", "청년"],
                ["newlywed", "신혼부부"],
                ["family", "일반가구"],
                ["senior", "고령자"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={draftProfile.householdType === value ? "is-selected" : ""}
                  aria-pressed={draftProfile.householdType === value}
                  onClick={() =>
                    update("householdType", value as EligibilityProfile["householdType"])
                  }
                >
                  {draftProfile.householdType === value && <Check size={15} />}
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>가구원 수</legend>
            <div className="segmented-grid segmented-grid--five">
              {[1, 2, 3, 4, 5].map((size) => (
                <button
                  type="button"
                  key={size}
                  className={draftProfile.householdSize === size ? "is-selected" : ""}
                  aria-pressed={draftProfile.householdSize === size}
                  onClick={() => update("householdSize", size)}
                >
                  {size === 5 ? "5인+" : `${size}인`}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>주택 보유 여부</legend>
            <div className="segmented-grid segmented-grid--two">
              <button
                type="button"
                className={draftProfile.homeless ? "is-selected" : ""}
                aria-pressed={draftProfile.homeless}
                onClick={() => update("homeless", true)}
              >
                무주택
              </button>
              <button
                type="button"
                className={!draftProfile.homeless ? "is-selected" : ""}
                aria-pressed={!draftProfile.homeless}
                onClick={() => update("homeless", false)}
              >
                주택 보유
              </button>
            </div>
          </fieldset>

          <label className="form-select-row">
            <span>월평균 소득 구간</span>
            <select
              value={draftProfile.incomeBand}
              onChange={(event) =>
                update("incomeBand", event.target.value as EligibilityProfile["incomeBand"])
              }
            >
              <option value="under70">기준 중위소득 70% 이하</option>
              <option value="under100">기준 중위소득 100% 이하</option>
              <option value="under120">기준 중위소득 120% 이하</option>
            </select>
          </label>

          <label className="form-select-row">
            <span>자산 구간</span>
            <select
              value={draftProfile.assetBand}
              onChange={(event) =>
                update("assetBand", event.target.value as EligibilityProfile["assetBand"])
              }
            >
              <option value="low">낮음</option>
              <option value="standard">공고 기준 이내</option>
              <option value="high">공고 기준 초과 가능</option>
            </select>
          </label>
          </div>

          <div className="sheet-summary">
            <Sparkles size={18} />
            <div>
              <strong>{profileLabel(draftProfile)}</strong>
              <span>조건이 바뀌면 추천 순서와 일치도가 함께 바뀝니다.</span>
            </div>
          </div>
        </div>

        <footer className="eligibility-sheet__footer">
          <button
            type="button"
            className="primary-sheet-action"
            onClick={() => onApply(draftProfile)}
          >
            이 조건에 맞는 집 보기
          </button>
        </footer>
      </section>
    </div>
  );
}

export function HousingExplorer() {
  const [prototypeVariant, setPrototypeVariant] = useState<PrototypeVariant>("A");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [profile, setProfile] = useState<EligibilityProfile>(DEFAULT_PROFILE);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedNoticeIds, setSavedNoticeIds] = useState<Set<string>>(new Set());
  const [alertIds, setAlertIds] = useState<Set<string>>(new Set());
  const [savedOnly, setSavedOnly] = useState(false);
  const [resultView, setResultView] = useState<"complexes" | "notices">("complexes");
  const [noticeQuery, setNoticeQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeViewport, setActiveViewport] = useState<MapViewport | undefined>();
  const [pendingViewport, setPendingViewport] = useState<MapViewport | null>(null);
  const [tileError, setTileError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const mapInitialized = useRef(false);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const storedSaved = window.localStorage.getItem(SAVED_STORAGE_KEY);
      const storedSavedNotices = window.localStorage.getItem(SAVED_NOTICE_STORAGE_KEY);
      const storedAlerts = window.localStorage.getItem(ALERT_STORAGE_KEY);
      const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedSaved) setSavedIds(new Set(JSON.parse(storedSaved) as string[]));
      if (storedSavedNotices) {
        setSavedNoticeIds(new Set(JSON.parse(storedSavedNotices) as string[]));
      }
      if (storedAlerts) setAlertIds(new Set(JSON.parse(storedAlerts) as string[]));
      if (storedProfile) setProfile(JSON.parse(storedProfile) as EligibilityProfile);
    });
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (profileOpen) {
        setProfileOpen(false);
        return;
      }
      if (filterPanelOpen) {
        setFilterPanelOpen(false);
        return;
      }
      if (selectedNoticeId) {
        setSelectedNoticeId(null);
        return;
      }
      setSelectedId(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [filterPanelOpen, profileOpen, selectedNoticeId]);

  useEffect(() => {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const filteredListings = useMemo(() => {
    const filtered = filterListings(HOUSING_LISTINGS, filters, activeViewport, profile);
    const visible = savedOnly
      ? filtered.filter((listing) => savedIds.has(listing.id))
      : filtered;
    return sortListings(visible, profile, savedIds);
  }, [activeViewport, filters, profile, savedIds, savedOnly]);

  const filteredNotices = useMemo(() => {
    const query = noticeQuery.trim().toLowerCase();
    if (!query) return HOUSING_NOTICES;
    return HOUSING_NOTICES.filter((notice) => {
      const recruitment = notice.recruitmentKind === "reserve" ? "예비입주자" : "신규입주자";
      const complexKeywords = notice.details.supplyComplexes.flatMap((complex) => {
        return [complex.name, complex.address];
      });
      return [
        notice.title,
        notice.region,
        notice.provider,
        notice.rentalType,
        recruitment,
        ...complexKeywords,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [noticeQuery]);

  const visibleSelectedId = filteredListings.some((listing) => listing.id === selectedId)
    ? selectedId
    : null;
  const selectedListing = HOUSING_LISTINGS.find(
    (listing) => listing.id === visibleSelectedId,
  ) ?? null;
  const selectedNotice = resultView === "notices"
    ? filteredNotices.find((notice) => notice.id === selectedNoticeId) ?? null
    : null;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters((current) => ({ ...current, ...updates }));
  };

  const selectListing = (id: string, scroll = true) => {
    setResultView("complexes");
    setSelectedNoticeId(null);
    setSelectedId(id);
    if (!scroll) return;
    window.requestAnimationFrame(() => {
      cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const selectResultView = (view: "complexes" | "notices") => {
    setResultView(view);
    if (view === "notices") {
      setSelectedId(null);
      setFilterPanelOpen(false);
      return;
    }
    setSelectedNoticeId(null);
  };

  const selectNotice = (id: string) => {
    setResultView("notices");
    setSelectedId(null);
    setSelectedNoticeId(id);
  };

  const updateNoticeQuery = (query: string) => {
    setNoticeQuery(query);
    setSelectedNoticeId(null);
  };

  const toggleStoredId = (
    id: string,
    values: Set<string>,
    setValues: (next: Set<string>) => void,
    storageKey: string,
    messages: [string, string],
  ) => {
    const next = new Set(values);
    const removing = next.has(id);
    if (removing) next.delete(id);
    if (!removing) next.add(id);
    setValues(next);
    window.localStorage.setItem(storageKey, JSON.stringify([...next]));
    showToast(removing ? messages[0] : messages[1]);
  };

  const handleViewportChange = (viewport: MapViewport) => {
    if (!mapInitialized.current) {
      mapInitialized.current = true;
      setActiveViewport(viewport);
      return;
    }
    setPendingViewport(viewport);
  };

  const applyPendingViewport = () => {
    if (!pendingViewport) return;
    setActiveViewport(pendingViewport);
    setPendingViewport(null);
    showToast("이 지도 영역의 매물로 새로 찾았어요.");
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSavedOnly(false);
    setActiveViewport(undefined);
    setPendingViewport(null);
    setFilterPanelOpen(false);
  };
  const activeFilterCount = countActiveFilters(filters);

  return (
    <main className="app-shell" data-prototype-variant={prototypeVariant}>
      <header className="top-header">
        <a className="brand" href="#top" aria-label="두꺼비집 홈">
          <span className="brand__mark"><Home size={21} strokeWidth={2.5} /></span>
          <span className="brand__name">두꺼비집</span>
          <span className="brand__tagline">공공임대 지도</span>
        </a>

        <fieldset
          className="prototype-variant-selector"
          role="radiogroup"
          aria-label="와이어프레임 시안"
        >
          <legend className="sr-only">와이어프레임 시안</legend>
          <span className="prototype-variant-selector__label" aria-hidden="true">
            시안
          </span>
          {PROTOTYPE_VARIANTS.map((variant) => (
            <label key={variant}>
              <input
                className="sr-only"
                type="radio"
                name="prototype-variant"
                value={variant}
                checked={prototypeVariant === variant}
                onChange={() => setPrototypeVariant(variant)}
                aria-label={`시안 ${variant}`}
              />
              <span>{variant}</span>
            </label>
          ))}
        </fieldset>

        <nav className="header-actions" aria-label="사용자 메뉴">
          <button
            type="button"
            className={`header-button ${savedOnly ? "is-active" : ""}`}
            onClick={() => setSavedOnly((current) => !current)}
            aria-pressed={savedOnly}
          >
            <Heart size={18} fill={savedOnly ? "currentColor" : "none"} />
            저장한 집
            {savedIds.size > 0 && <span className="header-count">{savedIds.size}</span>}
          </button>
        </nav>
      </header>

      <div className={`workspace ${selectedListing || selectedNotice ? "has-detail" : ""}`} id="top">
        <section className="results-panel" aria-label="공공임대 검색 결과">
          <h1 className="sr-only">
            {resultView === "complexes" ? "단지 목록" : "공고 목록"}
          </h1>

          <nav className="result-view-tabs" aria-label="목록 종류" role="tablist">
            <button
              id="complex-list-tab"
              type="button"
              role="tab"
              aria-controls="complex-list-panel"
              aria-selected={resultView === "complexes"}
              onClick={() => selectResultView("complexes")}
            >
              단지 목록
            </button>
            <button
              id="notice-list-tab"
              type="button"
              role="tab"
              aria-controls="notice-list-panel"
              aria-selected={resultView === "notices"}
              onClick={() => selectResultView("notices")}
            >
              공고 목록
            </button>
          </nav>

          <div className={`results-search-row ${resultView === "notices" ? "is-search-only" : ""}`}>
            <label className="results-search">
              <Search size={18} aria-hidden="true" />
              {resultView === "complexes" && (
                <input
                  type="search"
                  value={filters.query}
                  onChange={(event) => updateFilters({ query: event.target.value })}
                  placeholder="지역·역·단지명 검색"
                  aria-label="단지 검색"
                />
              )}
              {resultView === "notices" && (
                <input
                  type="search"
                  value={noticeQuery}
                  onChange={(event) => updateNoticeQuery(event.target.value)}
                  placeholder="공고명·지역·기관 검색"
                  aria-label="공고 검색"
                />
              )}
              {resultView === "complexes" && filters.query && (
                <button
                  type="button"
                  aria-label="단지 검색어 지우기"
                  onClick={() => updateFilters({ query: "" })}
                >
                  <X size={16} />
                </button>
              )}
              {resultView === "notices" && noticeQuery && (
                <button
                  type="button"
                  aria-label="공고 검색어 지우기"
                  onClick={() => updateNoticeQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </label>
            {resultView === "complexes" && (
              <button
                type="button"
                className="results-filter-trigger"
                aria-label={`검색 필터 열기${activeFilterCount ? `, ${activeFilterCount}개 적용 중` : ""}`}
                aria-expanded={filterPanelOpen}
                aria-controls="listing-filter-sheet"
                onClick={() => setFilterPanelOpen(true)}
              >
                <SlidersHorizontal size={16} />
                <span>필터</span>
                {activeFilterCount > 0 && (
                  <b className="results-filter-trigger__count">{activeFilterCount}</b>
                )}
              </button>
            )}
          </div>

          <div className="profile-condition-strip" role="group" aria-label="적용 중인 입주 조건">
            <Sparkles size={14} />
            <strong>{profileLabel(profile)} 기준</strong>
            <button type="button" onClick={() => setProfileOpen(true)}>조건 수정</button>
          </div>

          <div className="results-toolbar">
            {resultView === "complexes" && (
              <>
                <span>{pendingViewport ? "지도 영역이 바뀌었어요" : "현재 지도 영역 기준"}</span>
                <span className="results-toolbar__separator" />
                <span>모집예정 포함</span>
              </>
            )}
            {resultView === "notices" && (
              <>
                <span>공고 검색 결과 {filteredNotices.length}건</span>
                <span className="results-toolbar__separator" />
                <span>접수예정 포함</span>
              </>
            )}
          </div>

          {filterPanelOpen && resultView === "complexes" && (
            <ListingFilterSheet
              filters={filters}
              resultCount={filteredListings.length}
              onChange={updateFilters}
              onReset={resetFilters}
              onClose={() => setFilterPanelOpen(false)}
            />
          )}

          {resultView === "complexes" && (
            <div
              id="complex-list-panel"
              className="listing-scroll"
              role="tabpanel"
              aria-labelledby="complex-list-tab"
              aria-live="polite"
            >
              {filteredListings.length === 0 && <EmptyResults onReset={resetFilters} />}
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  selected={visibleSelectedId === listing.id}
                  hovered={hoveredId === listing.id}
                  saved={savedIds.has(listing.id)}
                  alerted={alertIds.has(listing.id)}
                  cardRef={(node) => { cardRefs.current[listing.id] = node; }}
                  onSelect={() => selectListing(listing.id, false)}
                  onHover={(hovering) => setHoveredId(hovering ? listing.id : null)}
                  onSave={() =>
                    toggleStoredId(
                      listing.id,
                      savedIds,
                      setSavedIds,
                      SAVED_STORAGE_KEY,
                      ["저장을 해제했어요.", "관심 주택에 저장했어요."],
                    )
                  }
                  onAlert={() =>
                    toggleStoredId(
                      listing.id,
                      alertIds,
                      setAlertIds,
                      ALERT_STORAGE_KEY,
                      ["공고 알림을 해제했어요.", "공고가 올라오면 알려드릴게요."],
                    )
                  }
                  onOpenNotice={() =>
                    showToast("프로토타입에서는 원문 공고 연결을 준비 중이에요.")
                  }
                />
              ))}
            </div>
          )}

          {resultView === "notices" && (
            <div
              id="notice-list-panel"
              className="listing-scroll"
              role="tabpanel"
              aria-labelledby="notice-list-tab"
            >
              {filteredNotices.length === 0 && (
                <div className="empty-results">
                  <span className="empty-results__icon"><Search size={23} /></span>
                  <h3>검색한 공고를 찾지 못했어요</h3>
                  <p>공고명, 지역 또는 공급기관 검색어를 확인해 주세요.</p>
                  <button type="button" onClick={() => updateNoticeQuery("")}>
                    <RotateCcw size={16} /> 공고 검색어 지우기
                  </button>
                </div>
              )}
              {filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  selected={selectedNotice?.id === notice.id}
                  saved={savedNoticeIds.has(notice.id)}
                  onSelect={() => selectNotice(notice.id)}
                  onSave={() =>
                    toggleStoredId(
                      notice.id,
                      savedNoticeIds,
                      setSavedNoticeIds,
                      SAVED_NOTICE_STORAGE_KEY,
                      ["공고 저장을 해제했어요.", "관심 공고에 저장했어요."],
                    )
                  }
                />
              ))}
            </div>
          )}

        </section>

        <section className="map-panel" aria-label="지도 검색 영역">
          <HousingMap
            listings={filteredListings}
            selectedId={visibleSelectedId}
            hoveredId={hoveredId}
            onSelect={(id) => selectListing(id)}
            onHover={setHoveredId}
            onViewportChange={handleViewportChange}
            onTileError={() => setTileError(true)}
            onLocationError={() => showToast("위치 권한 없이도 성남·위례 지도를 계속 볼 수 있어요.")}
          />

          <div className="map-topbar">
            <div
              className="map-area-pill"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`현재 지도 영역 경기 성남시, 검색 결과 ${filteredListings.length}건`}
            >
              <MapPin size={16} />
              <strong>경기 성남시</strong>
              <span className="map-area-pill__separator" aria-hidden="true">|</span>
              <b>{filteredListings.length}건</b>
            </div>
            <button type="button" className="map-layer-button">
              <SlidersHorizontal size={16} /> 생활 인프라
            </button>
          </div>

          {pendingViewport && (
            <button type="button" className="research-map-button" onClick={applyPendingViewport}>
              <RotateCcw size={16} /> 이 지역에서 다시 찾기
            </button>
          )}

          {tileError && (
            <div className="map-error" role="status">
              <CircleAlert size={17} /> 지도 배경을 불러오지 못했지만 목록과 핀은 계속 사용할 수 있어요.
              <button type="button" aria-label="안내 닫기" onClick={() => setTileError(false)}>
                <X size={16} />
              </button>
            </div>
          )}

          <div className="map-legend" aria-label="지도 핀 범례">
            <span><i className="legend-dot legend-dot--open" /> 모집중</span>
            <span><i className="legend-dot legend-dot--upcoming" /> 모집예정</span>
            <span><i className="legend-dot legend-dot--closing" /> 마감 임박</span>
          </div>

          {selectedListing && (
            <HousingComplexDetailPanel
              key={selectedListing.id}
              listing={selectedListing}
              onClose={() => setSelectedId(null)}
              onOpenNotice={() =>
                showToast("프로토타입에서는 원문 공고 연결을 준비 중이에요.")
              }
            />
          )}

          {selectedNotice && (
            <HousingNoticeDetailPanel
              key={selectedNotice.id}
              notice={selectedNotice}
              profile={profile}
              onClose={() => setSelectedNoticeId(null)}
              onOpenPdf={() =>
                showToast("프로토타입 공고문 PDF 연결을 준비 중이에요.")
              }
              onOpenSource={() =>
                showToast("프로토타입 공고 원문 링크 연결을 준비 중이에요.")
              }
            />
          )}
        </section>
      </div>

      {profileOpen && (
        <EligibilityPanel
          profile={profile}
          onClose={() => setProfileOpen(false)}
          onApply={(nextProfile) => {
            setProfile(nextProfile);
            updateFilters({ profileOnly: true });
            setProfileOpen(false);
            showToast("내 조건과 가까운 집만 모아봤어요.");
          }}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
