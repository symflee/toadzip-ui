"use client";

import {
  Bookmark,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { type KeyboardEvent } from "react";
import {
  formatNoticeDate,
  noticeDeadlineContext,
  noticeDeadlineLabel,
  noticeStatusLabel,
  type HousingNotice,
} from "./housing-notice-data";

export type NoticeCardVariant = "A" | "B" | "C";

interface HousingNoticeCardProps {
  notice: HousingNotice;
  variant?: NoticeCardVariant;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onSave: () => void;
}

export function HousingNoticeCard({
  notice,
  variant = "A",
  selected,
  saved,
  onSelect,
  onSave,
}: HousingNoticeCardProps) {
  const status = noticeStatusLabel(notice.status);
  const recruitment = noticeRecruitmentLabel(notice.recruitmentKind);
  const deadlineAria = noticeDeadlineAccessibleLabel(notice);

  if (variant === "B") {
    return (
      <NoticeCardB
        notice={notice}
        status={status}
        deadlineAria={deadlineAria}
        recruitment={recruitment}
        selected={selected}
        saved={saved}
        onSelect={onSelect}
        onSave={onSave}
      />
    );
  }

  if (variant === "C") {
    return (
      <NoticeCardC
        notice={notice}
        status={status}
        deadlineAria={deadlineAria}
        recruitment={recruitment}
        selected={selected}
        saved={saved}
        onSelect={onSelect}
        onSave={onSave}
      />
    );
  }

  const deadline = noticeDeadlineLabel(notice);
  const deadlineContext = noticeDeadlineContext();

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect();
  };

  return (
    <article
      className={`notice-card notice-card--${variant.toLowerCase()} ${selected ? "is-selected" : ""}`}
      data-variant={variant}
      data-status={notice.status}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-current={selected ? "true" : undefined}
      aria-label={`${notice.title}, ${status}, ${deadline}`}
    >
      <NoticeCardA
        notice={notice}
        status={status}
        deadline={deadline}
        deadlineContext={deadlineContext}
        deadlineAria={deadlineAria}
        recruitment={recruitment}
        saved={saved}
        onSelect={onSelect}
        onSave={onSave}
      />
    </article>
  );
}

function NoticeCardC({
  notice,
  status,
  deadlineAria,
  recruitment,
  selected,
  saved,
  onSelect,
  onSave,
}: NoticeCardContentProps & { selected: boolean }) {
  const unit = noticeUnitPresentation(notice);
  const deadline = noticeRemainingDeadlinePresentation(notice);
  const source = noticeSourceLabel(notice);
  const urgent = noticeHasUrgentDeadline(notice);
  return (
    <article
      className={`notice-card notice-card--c ${selected ? "is-selected" : ""}`}
      data-variant="C"
      data-status={notice.status}
      data-urgency={urgent ? "urgent" : undefined}
      aria-current={selected ? "true" : undefined}
      aria-label={`${notice.title}, ${status}, ${deadline.value}`}
    >
      <div className="notice-card-c__summary" data-card-zone="summary">
        <header className="notice-card-c__title-row" data-summary-row="title">
          <h3>{notice.title}</h3>
          <NoticeBookmark notice={notice} saved={saved} onSave={onSave} />
        </header>

        <div className="notice-card-c__signal" data-summary-row="signal">
          <NoticeStatus notice={notice} status={status} />
          <p className="notice-card-c__deadline" aria-label={deadlineAria}>
            <span>{deadline.label}</span>
            <strong>{deadline.value}</strong>
          </p>
        </div>

        <div className="notice-card-c__context" data-summary-row="context">
          <p className="notice-card-c__classification">
            <span>{notice.rentalType}</span>
            <i aria-hidden="true">·</i>
            <span>{recruitment}</span>
          </p>
          <p className="notice-card-c__location">
            <span>{notice.region}</span>
            <i aria-hidden="true">·</i>
            <strong>{notice.provider}</strong>
          </p>
        </div>

        <div className="notice-card-c__decision" data-summary-row="decision">
          <dl className="notice-card-c__period" data-summary-group="period">
            <div>
              <dt>접수기간</dt>
              <dd>
                <span><time dateTime={notice.applyStart}>{formatNoticeDate(notice.applyStart)}</time>부터</span>
                <span><time dateTime={notice.applyEnd}>{formatNoticeDate(notice.applyEnd)}</time>까지</span>
              </dd>
            </div>
          </dl>
          <dl className="notice-card-c__supply" data-summary-group="supply">
            <div className="notice-card-c__metric">
              <dt>공급 단지</dt>
              <dd>{notice.details.supplyComplexes.length}곳</dd>
            </div>
            <div className="notice-card-c__metric">
              <dt>{unit.label}</dt>
              <dd>{unit.value}</dd>
            </div>
          </dl>
        </div>

        <footer className="notice-card-c__footer" data-summary-row="meta">
          <p className="notice-card-c__meta">
            {source && (
              <>
                <span>{source}</span>
                <i aria-hidden="true">·</i>
              </>
            )}
            <span>{noticeViewLabel(notice)}</span>
          </p>
        </footer>

        <button
          className="notice-card-c__primary-action"
          type="button"
          aria-label={`${notice.title} 상세 보기`}
          onClick={onSelect}
        >
          <span className="sr-only">상세 보기</span>
        </button>
      </div>
    </article>
  );
}

function NoticeCardA({
  notice,
  status,
  deadline,
  deadlineContext,
  deadlineAria,
  recruitment,
  saved,
  onSave,
}: NoticeCardContentProps) {
  const unit = noticeUnitPresentation(notice);
  return (
    <>
      <div className="notice-card__topline">
        <div className="notice-card__classification">
          <span className="notice-card__rental-type">{notice.rentalType}</span>
          <span className="notice-card__recruitment">{recruitment}</span>
        </div>
        <NoticeBookmark notice={notice} saved={saved} onSave={onSave} />
      </div>
      <h3>{notice.title}</h3>
      <NoticeLocation notice={notice} />
      <div className="notice-card__deadline">
        <NoticeStatus notice={notice} status={status} />
        <p aria-label={deadlineAria}>
          <span>{deadlineContext}</span>
          <strong>{deadline}</strong>
        </p>
      </div>
      <dl className="notice-card__facts">
        <NoticePeriod notice={notice} className="notice-card__period" />
        <div><dt>{unit.label}</dt><dd>{unit.value}</dd></div>
        <div><dt>조회수</dt><dd>{notice.viewCount.toLocaleString("ko-KR")}</dd></div>
      </dl>
    </>
  );
}

function NoticeCardB({
  notice,
  status,
  deadlineAria,
  recruitment,
  selected,
  saved,
  onSelect,
  onSave,
}: NoticeCardContentProps & { selected: boolean }) {
  const unit = noticeUnitPresentation(notice);
  const deadline = noticeRemainingDeadlinePresentation(notice);
  const source = noticeSourceLabel(notice);
  const urgent = noticeHasUrgentDeadline(notice);
  return (
    <article
      className={`notice-card notice-card--b ${selected ? "is-selected" : ""}`}
      data-variant="B"
      data-status={notice.status}
      data-urgency={urgent ? "urgent" : undefined}
      aria-current={selected ? "true" : undefined}
      aria-label={`${notice.title}, ${status}, ${deadline.value}`}
    >
      <div className="notice-card-b__summary" data-card-zone="summary">
        <header className="notice-card-b__title-row" data-summary-row="title">
          <h3>{notice.title}</h3>
          <NoticeBookmark notice={notice} saved={saved} onSave={onSave} compact />
        </header>

        <div className="notice-card-b__signal" data-summary-row="signal">
          <NoticeStatus notice={notice} status={status} />
          <p className="notice-card-b__deadline" aria-label={deadlineAria}>
            <span>{deadline.label}</span>
            <strong>{deadline.value}</strong>
          </p>
        </div>

        <div className="notice-card-b__context" data-summary-row="context">
          <p
            className="notice-card-b__region"
            data-context-group="region"
            aria-label={`관심 지역 ${notice.region}`}
          >
            {notice.region}
          </p>
          <p
            className="notice-card-b__interest"
            data-context-group="interest"
            aria-label={`공급 관심 조건 ${notice.provider} ${notice.rentalType} ${recruitment}`}
          >
            <strong>{notice.provider}</strong>
            <i aria-hidden="true">·</i>
            <span>{notice.rentalType}</span>
            <i aria-hidden="true">·</i>
            <span>{recruitment}</span>
          </p>
        </div>

        <div className="notice-card-b__decision" data-summary-row="decision">
          <dl className="notice-card-b__period" data-summary-group="period">
            <div>
              <dt>접수기간</dt>
              <dd>
                <span><time dateTime={notice.applyStart}>{formatNoticeDate(notice.applyStart)}</time>부터</span>
                <span><time dateTime={notice.applyEnd}>{formatNoticeDate(notice.applyEnd)}</time>까지</span>
              </dd>
            </div>
          </dl>
          <dl className="notice-card-b__supply" data-summary-group="supply">
            <div className="notice-card-b__metric">
              <dt>공급 단지</dt>
              <dd>{notice.details.supplyComplexes.length}곳</dd>
            </div>
            <div className="notice-card-b__metric">
              <dt>{unit.label}</dt>
              <dd>{unit.value}</dd>
            </div>
          </dl>
        </div>

        <footer className="notice-card-b__footer" data-summary-row="meta">
          <p className="notice-card-b__meta">
            {source && (
              <>
                <span>{source}</span>
                <i aria-hidden="true">·</i>
              </>
            )}
            <span>{noticeViewLabel(notice)}</span>
          </p>
        </footer>

        <button
          className="notice-card-b__primary-action"
          type="button"
          aria-label={`${notice.title} 상세 보기`}
          onClick={onSelect}
        >
          <span className="sr-only">상세 보기</span>
        </button>
      </div>
    </article>
  );
}

interface NoticeCardContentProps {
  notice: HousingNotice;
  status: string;
  deadline?: string;
  deadlineContext?: string;
  deadlineAria: string;
  recruitment: string;
  saved: boolean;
  onSelect: () => void;
  onSave: () => void;
}

function NoticeStatus({ notice, status }: { notice: HousingNotice; status: string }) {
  return (
    <div className="notice-card__status-group">
      <span className={`notice-card__status notice-card__status--${notice.status}`}>{status}</span>
      {notice.revision === "corrected" && (
        <span className="notice-card__revision">정정공고중</span>
      )}
    </div>
  );
}

function NoticeBookmark({
  notice,
  saved,
  onSave,
  compact = false,
}: Pick<NoticeCardContentProps, "notice" | "saved" | "onSave"> & { compact?: boolean }) {
  return (
    <button
      className={`icon-button notice-card__bookmark ${compact ? "notice-card__bookmark--compact" : ""} ${saved ? "is-saved" : ""}`}
      type="button"
      data-control-size={compact ? "32" : undefined}
      aria-label={saved ? `${notice.title} 공고 저장 해제` : `${notice.title} 공고 저장`}
      aria-pressed={saved}
      onClick={(event) => {
        event.stopPropagation();
        onSave();
      }}
    >
      <Bookmark size={compact ? 17 : 20} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}

function NoticeLocation({ notice }: { notice: HousingNotice }) {
  return (
    <p className="notice-card__source">
      <MapPin size={13} aria-hidden="true" />
      <span>{notice.region}</span><i aria-hidden="true" /><strong>{notice.provider}</strong>
    </p>
  );
}

function NoticePeriod({
  notice,
  className,
  icon = false,
}: {
  notice: HousingNotice;
  className?: string;
  icon?: boolean;
}) {
  return (
    <div className={className}>
      <dt>{icon && <CalendarDays size={15} aria-hidden="true" />}접수기간</dt>
      <dd>
        <time dateTime={notice.applyStart}>{formatNoticeDate(notice.applyStart)}</time>
        <span aria-hidden="true"> – </span>
        <time dateTime={notice.applyEnd}>{formatNoticeDate(notice.applyEnd)}</time>
      </dd>
    </div>
  );
}

export function noticeRecruitmentLabel(kind: HousingNotice["recruitmentKind"]) {
  if (kind === "reserve") return "예비입주자";
  if (kind === "additional") return "추가모집";
  return "신규입주자";
}

function noticeDeadlineAccessibleLabel(notice: HousingNotice) {
  if (notice.status === "closed") return "접수 마감 완료";
  if (notice.status === "always") return "상시 모집";
  if (notice.daysLeft === null) return "접수 마감일 정보 확인 중";
  return `${noticeDeadlineContext()}까지 ${notice.daysLeft}일`;
}

function noticeUnitPresentation(notice: HousingNotice) {
  const units = notice.units.toLocaleString("ko-KR");
  if (notice.unitLabel === "모집 예비자") {
    return { label: "모집 예비자 수", value: `${units}명` };
  }
  if (notice.unitLabel === "모집 호수") {
    return { label: "모집 호수", value: `${units}호` };
  }
  return { label: "공급 세대수", value: `${units}세대` };
}

function noticeRemainingDeadlinePresentation(notice: HousingNotice) {
  if (notice.status === "closed") return { label: "접수", value: "종료" };
  if (notice.status === "always") return { label: "접수", value: "상시" };
  if (notice.daysLeft === null) return { label: "마감일", value: "확인 중" };
  return { label: "접수 마감까지", value: `${notice.daysLeft}일` };
}

function noticeHasUrgentDeadline(notice: HousingNotice) {
  if (notice.status !== "open") return false;
  if (notice.daysLeft === null) return false;
  return notice.daysLeft >= 0 && notice.daysLeft <= 3;
}

function noticeSourceLabel(notice: HousingNotice) {
  if (notice.sourceKind === "notice-document") return "공고문 기반";
  return null;
}

function noticeViewLabel(notice: HousingNotice) {
  if (notice.sourceKind === "notice-document" && notice.viewCount === 0) {
    return "조회 정보 확인 중";
  }
  return `조회 ${notice.viewCount.toLocaleString("ko-KR")}`;
}
