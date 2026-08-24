"use client";

import { FileText, Home, LayoutList, Rows3, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { HousingNoticeDetailPanel } from "./HousingNoticeDetailPanel";
import { HousingNoticeCard as NoticeCard } from "./HousingNoticeCard";
import { HOUSING_NOTICES } from "./housing-notice-data";
import { DEFAULT_PROFILE } from "./housing-data";

export type CatalogPage = "notice-card" | "notice-list" | "notice-detail";
type Variant = "A" | "B" | "C";

const VARIANTS: Variant[] = ["A", "B", "C"];
const PAGE_INFORMATION: Record<CatalogPage, { title: string; description: string }> = {
  "notice-card": {
    title: "공고 목록 카드 UI",
    description: "공고 목록에서 반복해 사용하는 카드 단위 시안을 비교합니다.",
  },
  "notice-list": {
    title: "공고 목록 UI",
    description: "검색, 조건 요약과 공고 카드를 포함한 목록 화면 시안을 비교합니다.",
  },
  "notice-detail": {
    title: "공고 상세 UI",
    description: "공고 핵심 정보부터 공급 정보까지 이어지는 상세 화면 시안을 비교합니다.",
  },
};

const CATALOG_LINKS: { page: CatalogPage; href: string; icon: ReactNode }[] = [
  { page: "notice-card", href: "/notice-card", icon: <Rows3 size={18} /> },
  { page: "notice-list", href: "/notice-list", icon: <LayoutList size={18} /> },
  { page: "notice-detail", href: "/notice-detail", icon: <FileText size={18} /> },
];

export function PrototypeCatalog({ activePage }: { activePage: CatalogPage }) {
  const information = PAGE_INFORMATION[activePage];
  return (
    <main className="prototype-catalog">
      <CatalogSidebar activePage={activePage} />
      <section className="catalog-content">
        <header className="catalog-page-header">
          <p>두꺼비집 UI 시안</p>
          <h1>{information.title}</h1>
          <span>{information.description}</span>
        </header>

        <section
          className="catalog-variant-grid"
          aria-label={`${information.title} 시안 비교`}
        >
          {VARIANTS.map((variant) => {
            const hasDesign = variant === "A"
              || activePage === "notice-card";
            return (
              <VariantFrame key={variant} variant={variant} hasDesign={hasDesign}>
                {hasDesign && <ExistingDesign page={activePage} variant={variant} />}
              </VariantFrame>
            );
          })}
        </section>
      </section>
    </main>
  );
}

function CatalogSidebar({ activePage }: { activePage: CatalogPage }) {
  return (
    <aside className="catalog-sidebar">
      <Link className="catalog-brand" href="/" aria-label="두꺼비집 지도 프로토타입">
        <span><Home size={20} strokeWidth={2.5} /></span>
        <strong>두꺼비집</strong>
      </Link>
      <div className="catalog-sidebar__heading">
        <span>WIREFRAMES</span>
        <h2>UI 시안 보관함</h2>
      </div>
      <nav className="catalog-navigation" aria-label="UI 시안 페이지">
        {CATALOG_LINKS.map((link) => (
          <Link
            key={link.page}
            href={link.href}
            aria-current={activePage === link.page ? "page" : undefined}
          >
            <span aria-hidden="true">{link.icon}</span>
            {PAGE_INFORMATION[link.page].title}
          </Link>
        ))}
      </nav>
      <p className="catalog-sidebar__note">
        팀과 함께 화면 단위로 시안을 비교하고 의견을 모으는 공간입니다.
      </p>
    </aside>
  );
}

function VariantFrame({
  variant,
  hasDesign,
  children,
}: {
  variant: Variant;
  hasDesign: boolean;
  children: ReactNode;
}) {
  return (
    <article className="catalog-variant" role="group" aria-label={`시안 ${variant}`}>
      <header className="catalog-variant__header">
        <div>
          <span>VARIANT</span>
          <h2>시안 {variant}</h2>
        </div>
        <strong className={hasDesign ? "is-ready" : ""}>
          {hasDesign ? "작성됨" : "비어 있음"}
        </strong>
      </header>
      <div className="catalog-variant__canvas">
        {hasDesign && children}
        {!hasDesign && <EmptyVariant />}
      </div>
    </article>
  );
}

function EmptyVariant() {
  return (
    <div className="catalog-empty-variant">
      <span aria-hidden="true" />
      <strong>등록된 시안이 없습니다</strong>
      <p>새 시안이 정해지면 이 영역에 배치합니다.</p>
    </div>
  );
}

function ExistingDesign({ page, variant }: { page: CatalogPage; variant: Variant }) {
  if (page === "notice-card") return <NoticeCardShowcase variant={variant} />;
  if (page === "notice-list") return <NoticeListShowcase />;
  return <NoticeDetailShowcase />;
}

function NoticeCardShowcase({ variant }: { variant: Variant }) {
  const [selected, setSelected] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div className="catalog-card-preview">
      <NoticeCard
        notice={HOUSING_NOTICES[0]}
        variant={variant}
        selected={selected}
        saved={saved}
        onSelect={() => setSelected((current) => !current)}
        onSave={() => setSaved((current) => !current)}
      />
    </div>
  );
}

function NoticeListShowcase() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const notices = useMemo(() => filterNotices(query), [query]);
  const toggleSaved = (id: string) => {
    setSavedIds((current) => nextSavedIds(current, id));
  };

  return (
    <section className="catalog-notice-list" aria-label="작성된 공고 목록 시안">
      <nav className="result-view-tabs" aria-label="목록 종류" role="tablist">
        <button type="button" role="tab" aria-selected="false">단지 목록</button>
        <button type="button" role="tab" aria-selected="true">공고 목록</button>
      </nav>
      <div className="results-search-row is-search-only">
        <label className="results-search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="공고명·지역·기관 검색"
            aria-label="공고 검색"
          />
        </label>
      </div>
      <div className="profile-condition-strip" role="group" aria-label="적용 중인 입주 조건">
        <Sparkles size={14} aria-hidden="true" />
        <strong>청년 · 1인 · 무주택 기준</strong>
        <button type="button">조건 수정</button>
      </div>
      <div className="results-toolbar">
        <span>공고 검색 결과 {notices.length}건</span>
        <span className="results-toolbar__separator" />
        <span>접수예정 포함</span>
      </div>
      <div className="listing-scroll">
        {notices.map((notice) => (
          <NoticeCard
            key={notice.id}
            notice={notice}
            selected={notice.id === selectedId}
            saved={savedIds.has(notice.id)}
            onSelect={() => setSelectedId(notice.id)}
            onSave={() => toggleSaved(notice.id)}
          />
        ))}
      </div>
    </section>
  );
}

function NoticeDetailShowcase() {
  const notice = HOUSING_NOTICES[0];
  return (
    <div className="catalog-detail-preview">
      <HousingNoticeDetailPanel
        notice={notice}
        profile={DEFAULT_PROFILE}
        embedded
        onClose={() => undefined}
        onOpenPdf={() => undefined}
        onOpenSource={() => undefined}
        onOpenComplex={() => undefined}
      />
    </div>
  );
}

function filterNotices(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return HOUSING_NOTICES;
  return HOUSING_NOTICES.filter((notice) => {
    return [notice.title, notice.region, notice.provider, notice.rentalType].some((value) => {
      return value.toLowerCase().includes(normalized);
    });
  });
}

function nextSavedIds(current: Set<string>, id: string) {
  const next = new Set(current);
  if (next.has(id)) {
    next.delete(id);
    return next;
  }
  next.add(id);
  return next;
}
