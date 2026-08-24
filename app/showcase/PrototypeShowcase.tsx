"use client";

import {
  ArrowLeft,
  Building2,
  FileText,
  LayoutList,
  MapPin,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PanelsTopLeft,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { HousingComplexDetailPanel } from "../HousingComplexDetailPanel";
import { HousingListingCard } from "../HousingListingCard";
import {
  HousingMapClusterPreview,
  HousingMapMarkerPreview,
} from "../HousingMap";
import { HousingNoticeCard } from "../HousingNoticeCard";
import { HousingNoticeDetailPanel } from "../HousingNoticeDetailPanel";
import { HousingNoticeDetailPanelB } from "../HousingNoticeDetailPanelB";
import { HousingTopBar } from "../HousingTopBar";
import { HOUSING_NOTICES, type HousingNotice } from "../housing-notice-data";
import {
  DEFAULT_PROFILE,
  HOUSING_LISTINGS,
  type HousingListing,
  type ListingStatus,
} from "../housing-data";
import { ShowcaseHistory } from "./ShowcaseHistory";
import { HorizontalScrollControls } from "./HorizontalScrollControls";
import {
  RegisteredShowcaseDesigns,
  ShowcaseSourceActions,
  type CreateDesignAction,
} from "./RegisteredShowcaseDesigns";
import { getShowcaseDesignSourceUrl } from "./showcase-design-paths";
import type { ShowcaseDesignPage } from "./showcase-design-types";
import {
  getCurrentPrototypeSlots,
  type ShowcaseVariant,
  type ShowcaseView,
} from "./showcase-version-registry";

export type { ShowcaseView } from "./showcase-version-registry";

export const SHOWCASE_VIEWS = [
  {
    id: "notice-card",
    index: "01",
    title: "공고 목록 카드 UI",
    description: "공고 한 건의 정보 우선순위와 카드 구성을 비교합니다.",
    href: "/showcase",
    icon: PanelsTopLeft,
  },
  {
    id: "notice-list",
    index: "02",
    title: "공고 목록 UI",
    description: "검색부터 공고 카드 목록까지 한 화면의 흐름을 비교합니다.",
    href: "/showcase/notice-list",
    icon: LayoutList,
  },
  {
    id: "notice-detail",
    index: "03",
    title: "공고 상세 UI",
    description: "공고 핵심 정보, 자격, 일정, 공급 단지 구성을 비교합니다.",
    href: "/showcase/notice-detail",
    icon: FileText,
  },
  {
    id: "complex-card",
    index: "04",
    title: "단지 목록 카드 UI",
    description: "단지 한 곳의 위치, 임대 조건과 모집 상태 구성을 비교합니다.",
    href: "/showcase/complex-card",
    icon: Building2,
  },
  {
    id: "complex-list",
    index: "05",
    title: "단지 목록 UI",
    description: "검색, 필터, 조건 요약과 단지 카드 목록의 흐름을 비교합니다.",
    href: "/showcase/complex-list",
    icon: LayoutList,
  },
  {
    id: "complex-detail",
    index: "06",
    title: "단지 상세 UI",
    description: "단지 기본 정보부터 주택형, 주변 환경까지 상세 구성을 비교합니다.",
    href: "/showcase/complex-detail",
    icon: FileText,
  },
  {
    id: "map-marker",
    index: "07",
    title: "지도 마커 UI",
    description: "모집 상태별 단지 마커, 선택 상태와 지역 클러스터를 비교합니다.",
    href: "/showcase/map-marker",
    icon: MapPin,
  },
  {
    id: "top-bar",
    index: "08",
    title: "상단 바 UI",
    description: "브랜드, 전체 시안 선택, 요소 비교와 저장 진입 영역을 비교합니다.",
    href: "/showcase/top-bar",
    icon: Menu,
  },
] as const;

const SHOWCASE_NOTICE = HOUSING_NOTICES.find((notice) => {
  return notice.sourceKind === "prototype" && notice.status === "open";
}) ?? HOUSING_NOTICES[0];

const SHOWCASE_LISTING = HOUSING_LISTINGS.find((listing) => {
  return listing.sourceKind === "prototype" && listing.status === "open";
}) ?? HOUSING_LISTINGS[0];

interface PrototypeShowcaseProps {
  view: ShowcaseView;
  registeredDesignPage?: ShowcaseDesignPage;
  createRegisteredDesign?: CreateDesignAction;
}

export function PrototypeShowcase({
  view,
  registeredDesignPage,
  createRegisteredDesign,
}: PrototypeShowcaseProps) {
  const activeView = SHOWCASE_VIEWS.find((item) => item.id === view) ?? SHOWCASE_VIEWS[0];
  const currentSlots = getCurrentPrototypeSlots(view);
  const [selectedNoticeId, setSelectedNoticeId] = useState(SHOWCASE_NOTICE?.id ?? "");
  const [savedNoticeIds, setSavedNoticeIds] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!SHOWCASE_NOTICE || !SHOWCASE_LISTING) return null;

  const toggleSavedNotice = (noticeId: string) => {
    setSavedNoticeIds((current) => {
      const next = new Set(current);
      if (next.has(noticeId)) {
        next.delete(noticeId);
        return next;
      }
      next.add(noticeId);
      return next;
    });
  };
  const comparisonLabel = view === "notice-card"
    ? "현재 공고 목록 카드 시안"
    : `${activeView.title} 현재 시안`;
  const comparisonRegionLabel = view === "notice-card"
    ? "현재 공고 목록 카드 시안 A, B 비교"
    : `${activeView.title} A, B, C 비교`;
  const comparisonId = `prototype-comparison-${view}`;

  return (
    <main
      className="prototype-showcase"
      aria-label="UI 시안 보드"
      data-sidebar-collapsed={sidebarCollapsed}
    >
      <aside
        id="prototype-showcase-sidebar"
        className="prototype-showcase__sidebar"
        aria-label="시안 페이지"
      >
        <Link className="prototype-showcase__brand" href="/" aria-label="시안 보드 홈">
          <span className="brand__mark"><PanelsTopLeft size={20} /></span>
          <span className="prototype-showcase__brand-label">
            <small>TOADZIP WIREFRAME</small>
            <strong>시안 보드</strong>
          </span>
        </Link>

        <button
          className="prototype-showcase__sidebar-toggle"
          type="button"
          aria-controls="prototype-showcase-sidebar"
          aria-expanded={!sidebarCollapsed}
          aria-label={sidebarCollapsed ? "시안 메뉴 펼치기" : "시안 메뉴 접기"}
          title={sidebarCollapsed ? "시안 메뉴 펼치기" : "시안 메뉴 접기"}
          onClick={() => setSidebarCollapsed((current) => !current)}
        >
          {sidebarCollapsed
            ? <PanelLeftOpen size={17} aria-hidden="true" />
            : <PanelLeftClose size={17} aria-hidden="true" />}
        </button>

        <div className="prototype-showcase__intro">
          <span>전체 UI 요소</span>
          <p>단지, 공고, 지도와 공통 영역을 한곳에서 검토합니다.</p>
        </div>

        <nav
          id="prototype-showcase-navigation"
          className="prototype-showcase__nav"
          aria-label="UI 시안 목록"
        >
          {SHOWCASE_VIEWS.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeView.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.title}
                title={item.title}
              >
                <span className="prototype-showcase__nav-icon"><Icon size={17} /></span>
                <span>
                  <small>{item.index}</small>
                  <strong>{item.title}</strong>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="prototype-showcase__sidebar-note">
          <strong>A / B / C</strong>
          <span>현재 구현과 새 제안을 비교하고, 교체된 시안은 화면별 과거 시안에서 변경 순서대로 보관합니다.</span>
        </div>
      </aside>

      <section
        className="prototype-showcase__content"
        role="region"
        aria-label={`${activeView.title} 시안 내용`}
        tabIndex={0}
      >
        <header className="prototype-showcase__header">
          <div>
            <span className="eyebrow">UI COMPARISON</span>
            <h1>{activeView.title}</h1>
            <p>{activeView.description}</p>
          </div>
          <Link className="prototype-showcase__back" href="/">
            <ArrowLeft size={16} /> 지도 화면으로
          </Link>
        </header>

        <div className="prototype-showcase__notice" role="note">
          <Sparkles size={16} />
          {view === "notice-card" && (
            <p>
              <strong>시안 B</strong>는{" "}
              <span>시안 C의 제목 우선 구조에서 북마크를 줄이고 지역과 공급 관심 조건을 묶은 관심 조건 브리프</span>
              입니다. 이전 B/C와 직전 C는 아래 과거 시안에서 변경 순서대로 확인할 수 있습니다.
            </p>
          )}
          {view === "notice-detail" && (
            <p>
              <strong>시안 B</strong>는 개인화 판정을 제외하고, 고정 헤더·단지 비교·주택형 카드와 평면도 모달에 집중한 공고 상세안입니다.
            </p>
          )}
          {view !== "notice-card" && view !== "notice-detail" && (
            <p><strong>시안 A</strong>에는 현재 UI를 넣었습니다. B와 C는 다음 제안을 위해 비워뒀어요.</p>
          )}
        </div>

        <section
          className="prototype-existing-designs"
          aria-labelledby={`existing-designs-${view}`}
        >
          <header className="prototype-existing-designs__header">
            <span>PRODUCT DESIGN ARCHIVE</span>
            <h2 id={`existing-designs-${view}`}>기존 시안</h2>
            <p>현재 React UI와 변경 이력을 보존하고, 대표 상태의 정적 HTML/CSS 전달본을 함께 제공합니다.</p>
          </header>

          <div className="prototype-comparison-shell">
            <HorizontalScrollControls label={comparisonLabel} targetId={comparisonId} />
            <section
              id={comparisonId}
              className={`prototype-comparison ${view === "notice-card" ? "prototype-comparison--notice-current" : ""}`}
              aria-label={comparisonRegionLabel}
              tabIndex={0}
            >
              {currentSlots.map(({ variant, revision }) => (
                <article
                  className="prototype-variant-column"
                  key={variant}
                  aria-label={`시안 ${variant}`}
                  data-has-design={revision !== null}
                  tabIndex={0}
                >
                  <header className="prototype-variant-column__header">
                    <span>시안 {variant}</span>
                    <b>{revision?.statusLabel ?? "빈 자리"}</b>
                  </header>
                  <div className={`prototype-variant-stage prototype-variant-stage--${view}`}>
                    {revision && (
                      <CurrentPrototype
                        view={view}
                        variant={variant}
                        notice={SHOWCASE_NOTICE}
                        listing={SHOWCASE_LISTING}
                        selectedNoticeId={selectedNoticeId}
                        savedNoticeIds={savedNoticeIds}
                        onSelectNotice={setSelectedNoticeId}
                        onSaveNotice={toggleSavedNotice}
                      />
                    )}
                    {!revision && <EmptyPrototypeSlot variant={variant} />}
                  </div>
                  {revision && (
                    <div className="prototype-variant-source">
                      <ShowcaseSourceActions
                        title={`${activeView.title} 시안 ${variant}`}
                        fileName={revision.id}
                        sourceUrl={getShowcaseDesignSourceUrl("builtin", revision.id)}
                      />
                    </div>
                  )}
                </article>
              ))}
            </section>
          </div>
          <ShowcaseHistory
            view={view}
            viewTitle={activeView.title}
            notice={SHOWCASE_NOTICE}
          />
        </section>

        <RegisteredShowcaseDesigns
          viewId={view}
          viewTitle={activeView.title}
          initialPage={registeredDesignPage}
          createDesign={createRegisteredDesign}
        />
      </section>
    </main>
  );
}

function CurrentPrototype({
  view,
  variant,
  notice,
  listing,
  selectedNoticeId,
  savedNoticeIds,
  onSelectNotice,
  onSaveNotice,
}: {
  view: ShowcaseView;
  variant: ShowcaseVariant;
  notice: HousingNotice;
  listing: HousingListing;
  selectedNoticeId: string;
  savedNoticeIds: Set<string>;
  onSelectNotice: (noticeId: string) => void;
  onSaveNotice: (noticeId: string) => void;
}) {
  if (view === "notice-card") {
    return (
      <div className="prototype-card-preview">
        <HousingNoticeCard
          notice={notice}
          variant={variant}
          selected={false}
          saved={savedNoticeIds.has(notice.id)}
          onSelect={() => onSelectNotice(notice.id)}
          onSave={() => onSaveNotice(notice.id)}
        />
      </div>
    );
  }

  if (view === "notice-list") {
    return (
      <NoticeListPrototype
        selectedNoticeId={selectedNoticeId}
        savedNoticeIds={savedNoticeIds}
        onSelectNotice={onSelectNotice}
        onSaveNotice={onSaveNotice}
      />
    );
  }

  if (view === "notice-detail") {
    if (variant === "B") {
      return (
        <HousingNoticeDetailPanelB
          notice={notice}
          embedded
          saved={savedNoticeIds.has(notice.id)}
          onClose={() => undefined}
          onToggleSave={() => onSaveNotice(notice.id)}
          onOpenPdf={() => undefined}
          onOpenSource={() => undefined}
          onOpenComplex={() => undefined}
        />
      );
    }
    return (
      <HousingNoticeDetailPanel
        notice={notice}
        profile={DEFAULT_PROFILE}
        embedded
        onClose={() => undefined}
        onOpenPdf={() => undefined}
        onOpenSource={() => undefined}
        onOpenComplex={() => undefined}
      />
    );
  }

  if (view === "complex-card") return <ComplexCardPrototype listing={listing} />;
  if (view === "complex-list") return <ComplexListPrototype />;
  if (view === "complex-detail") return <ComplexDetailPrototype listing={listing} />;
  if (view === "map-marker") return <MapMarkerPrototype />;
  if (view === "top-bar") return <TopBarPrototype />;

  return (
    <ComplexCardPrototype listing={listing} />
  );
}

function NoticeListPrototype({
  selectedNoticeId,
  savedNoticeIds,
  onSelectNotice,
  onSaveNotice,
}: {
  selectedNoticeId: string;
  savedNoticeIds: Set<string>;
  onSelectNotice: (noticeId: string) => void;
  onSaveNotice: (noticeId: string) => void;
}) {
  const notices = HOUSING_NOTICES.filter((notice) => {
    return notice.sourceKind === "prototype";
  }).slice(0, 3);

  return (
    <section className="showcase-notice-list" aria-label="현재 공고 목록 시안">
      <nav className="result-view-tabs" aria-label="목록 종류" role="tablist">
        <button type="button" role="tab" aria-selected="false">단지 목록</button>
        <button type="button" role="tab" aria-selected="true">공고 목록</button>
      </nav>
      <div className="results-search-row is-search-only">
        <label className="results-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            readOnly
            value=""
            placeholder="공고명·지역·기관 검색"
            aria-label="공고 검색 시안"
          />
        </label>
      </div>
      <div className="profile-condition-strip" role="group" aria-label="입주 조건 시안">
        <Sparkles size={14} />
        <strong>청년 · 1인 · 무주택 기준</strong>
        <button type="button">조건 수정</button>
      </div>
      <div className="results-toolbar">
        <span>공고 검색 결과 {HOUSING_NOTICES.length}건</span>
        <span className="results-toolbar__separator" />
        <span>접수예정 포함</span>
      </div>
      <div
        className="listing-scroll"
        role="region"
        aria-label="공고 카드 스크롤"
        tabIndex={0}
      >
        {notices.map((notice) => (
          <HousingNoticeCard
            key={notice.id}
            notice={notice}
            selected={selectedNoticeId === notice.id}
            saved={savedNoticeIds.has(notice.id)}
            onSelect={() => onSelectNotice(notice.id)}
            onSave={() => onSaveNotice(notice.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ComplexCardPrototype({ listing }: { listing: HousingListing }) {
  const [selected, setSelected] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [saved, setSaved] = useState(false);
  const [alerted, setAlerted] = useState(false);
  return (
    <div className="prototype-card-preview showcase-compact-listing">
      <HousingListingCard
        listing={listing}
        selected={selected}
        hovered={hovered}
        saved={saved}
        alerted={alerted}
        onSelect={() => setSelected((current) => !current)}
        onHover={setHovered}
        onSave={() => setSaved((current) => !current)}
        onAlert={() => setAlerted((current) => !current)}
        onOpenNotice={() => undefined}
      />
    </div>
  );
}

function ComplexListPrototype() {
  const listings = HOUSING_LISTINGS.filter((listing) => {
    return listing.sourceKind === "prototype";
  }).slice(0, 3);
  const [selectedId, setSelectedId] = useState(listings[0]?.id ?? "");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [alertedIds, setAlertedIds] = useState<Set<string>>(new Set());

  return (
    <section
      className="showcase-complex-list showcase-compact-listing"
      aria-label="현재 단지 목록 시안"
    >
      <nav className="result-view-tabs" aria-label="목록 종류" role="tablist">
        <button type="button" role="tab" aria-selected="true">단지 목록</button>
        <button type="button" role="tab" aria-selected="false">공고 목록</button>
      </nav>
      <div className="results-search-row">
        <label className="results-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            readOnly
            value=""
            placeholder="지역·역·단지명 검색"
            aria-label="단지 검색 시안"
          />
        </label>
        <button
          type="button"
          className="results-filter-trigger"
          aria-label="검색 필터 열기"
          aria-expanded="false"
        >
          <SlidersHorizontal size={16} />
          <span>필터</span>
        </button>
      </div>
      <div className="profile-condition-strip" role="group" aria-label="입주 조건 시안">
        <Sparkles size={14} />
        <strong>청년 · 1인 · 무주택 기준</strong>
        <button type="button">조건 수정</button>
      </div>
      <div className="results-toolbar">
        <span>현재 지도 영역 기준</span>
        <span className="results-toolbar__separator" />
        <span>모집예정 포함</span>
      </div>
      <div
        className="listing-scroll"
        role="region"
        aria-label="단지 카드 스크롤"
        tabIndex={0}
      >
        {listings.map((listing) => (
          <HousingListingCard
            key={listing.id}
            listing={listing}
            selected={selectedId === listing.id}
            hovered={hoveredId === listing.id}
            saved={savedIds.has(listing.id)}
            alerted={alertedIds.has(listing.id)}
            onSelect={() => setSelectedId(listing.id)}
            onHover={(hovering) => setHoveredId(hovering ? listing.id : null)}
            onSave={() => setSavedIds((current) => toggleId(current, listing.id))}
            onAlert={() => setAlertedIds((current) => toggleId(current, listing.id))}
            onOpenNotice={() => undefined}
          />
        ))}
      </div>
    </section>
  );
}

function ComplexDetailPrototype({ listing }: { listing: HousingListing }) {
  return (
    <HousingComplexDetailPanel
      listing={listing}
      embedded
      onClose={() => undefined}
      onOpenNotice={() => undefined}
    />
  );
}

function MapMarkerPrototype() {
  const markerListings = (["open", "upcoming", "always", "closed"] as const).map(
    (status) => ({ status, listing: findListingByStatus(status) }),
  );
  return (
    <section className="prototype-marker-preview" aria-label="현재 지도 마커 시안">
      {markerListings.map(({ status, listing }) => (
        <div className="prototype-marker-preview__item" key={status}>
          <span>{markerStatusLabel(status)}</span>
          <HousingMapMarkerPreview
            listing={listing}
            ariaLabel={`${markerStatusLabel(status)} 지도 마커`}
          />
        </div>
      ))}
      <div className="prototype-marker-preview__item">
        <span>선택 상태</span>
        <HousingMapMarkerPreview
          listing={findListingByStatus("open")}
          selected
          ariaLabel="선택된 지도 마커"
        />
      </div>
      <div className="prototype-marker-preview__item">
        <span>지역 클러스터</span>
        <HousingMapClusterPreview regionName="성남시" count={16} />
      </div>
    </section>
  );
}

function TopBarPrototype() {
  const [savedOnly, setSavedOnly] = useState(false);
  return (
    <section
      className="prototype-topbar-preview"
      aria-label="현재 상단 바 시안"
      tabIndex={0}
    >
      <HousingTopBar
        mapPrototypeVariant="A"
        mapPrototypeOpen={false}
        savedOnly={savedOnly}
        savedCount={0}
        onOpenMapPrototype={() => undefined}
        onToggleSaved={() => setSavedOnly((current) => !current)}
      />
    </section>
  );
}

function findListingByStatus(status: ListingStatus) {
  return HOUSING_LISTINGS.find((listing) => listing.status === status) ?? SHOWCASE_LISTING!;
}

function markerStatusLabel(status: ListingStatus) {
  if (status === "open") return "접수중";
  if (status === "upcoming") return "모집예정";
  if (status === "always") return "상시모집";
  return "접수마감";
}

function toggleId(current: Set<string>, id: string) {
  const next = new Set(current);
  if (next.has(id)) {
    next.delete(id);
    return next;
  }
  next.add(id);
  return next;
}

function EmptyPrototypeSlot({ variant }: { variant: ShowcaseVariant }) {
  return (
    <div className="prototype-empty-slot">
      <span>{variant}</span>
      <strong>시안 자리</strong>
      <p>새 구성이 정리되면 이 칸에 현재 UI와 같은 크기로 배치합니다.</p>
    </div>
  );
}
