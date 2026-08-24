"use client";

import { Heart, Home, PanelsTopLeft } from "lucide-react";
import Link from "next/link";

interface HousingTopBarProps {
  mapPrototypeVariant: string;
  mapPrototypeOpen: boolean;
  savedOnly: boolean;
  savedCount: number;
  onOpenMapPrototype: () => void;
  onToggleSaved: () => void;
}

export function HousingTopBar({
  mapPrototypeVariant,
  mapPrototypeOpen,
  savedOnly,
  savedCount,
  onOpenMapPrototype,
  onToggleSaved,
}: HousingTopBarProps) {
  return (
    <header className="top-header">
      <a className="brand" href="#top" aria-label="두꺼비집 홈">
        <span className="brand__mark"><Home size={21} strokeWidth={2.5} /></span>
        <span className="brand__name">두꺼비집</span>
        <span className="brand__tagline">공공임대 지도</span>
      </a>

      <button
        type="button"
        className="prototype-review-trigger"
        onClick={onOpenMapPrototype}
        aria-haspopup="dialog"
        aria-expanded={mapPrototypeOpen}
        aria-label={`지도 전체 시안 보기, 현재 시안 ${mapPrototypeVariant}`}
      >
        <span>지도 전체 시안</span>
        <b aria-hidden="true">시안 {mapPrototypeVariant}</b>
      </button>

      <nav className="header-actions" aria-label="헤더 바로가기">
        <Link
          className="header-button prototype-board-link"
          href="/showcase"
          aria-label="요소 UI 비교"
        >
          <PanelsTopLeft size={17} aria-hidden="true" />
          <span>요소 UI 비교</span>
        </Link>
        <button
          type="button"
          className={`header-button ${savedOnly ? "is-active" : ""}`}
          onClick={onToggleSaved}
          aria-pressed={savedOnly}
        >
          <Heart size={18} fill={savedOnly ? "currentColor" : "none"} />
          저장한 집
          {savedCount > 0 && <span className="header-count">{savedCount}</span>}
        </button>
      </nav>
    </header>
  );
}
