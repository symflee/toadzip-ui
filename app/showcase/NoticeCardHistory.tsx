import {
  Bookmark,
  Building2,
  CalendarDays,
  ChevronRight,
  Eye,
  UsersRound,
} from "lucide-react";
import { type ComponentType } from "react";
import {
  formatNoticeDate,
  noticeDeadlineLabel,
  noticeStatusLabel,
  type HousingNotice,
} from "../housing-notice-data";

export const NOTICE_CARD_HISTORY_PREVIEWS: Readonly<
  Record<string, ComponentType<{ notice: HousingNotice }>>
> = {
  "b-01": ArchivedNoticeCardB01,
  "c-01": ArchivedNoticeCardC01,
  "b-02": ArchivedNoticeCardB02,
  "b-03": ArchivedNoticeCardB03,
  c: ArchivedNoticeCardC,
};

function ArchivedNoticeCardB01({ notice }: { notice: HousingNotice }) {
  const unit = archivedUnit(notice);
  return (
    <article
      className="archived-notice-card archived-notice-card--b01"
      data-status={notice.status}
      aria-label={archivedCardLabel(notice, noticeDeadlineLabel(notice))}
    >
      <header className="archive-b01__signal">
        <ArchivedStatus notice={notice} />
        <ArchivedDeadline label="접수 마감" value={noticeDeadlineLabel(notice)} />
        <ArchivedBookmark size={36} />
      </header>
      <div className="archive-b01__body">
        <h4>{notice.title}</h4>
        <p className="archive-b01__classification">
          <span>{notice.rentalType}</span><i aria-hidden="true" />
          <span>{archivedRecruitment(notice)}</span>
          <em>{archivedSource(notice)}</em>
        </p>
        <ArchivedLocation notice={notice} />
        <dl className="archive-b01__facts">
          <ArchivedPeriod notice={notice} icon />
          <div>
            <dt><UsersRound size={15} aria-hidden="true" />{unit.label}</dt>
            <dd>{unit.value}</dd>
          </div>
        </dl>
        <footer className="archive-b01__footer">
          <p>
            <span><Building2 size={14} aria-hidden="true" />공급 단지 {notice.details.supplyComplexes.length}곳</span>
            <span><Eye size={14} aria-hidden="true" />{archivedView(notice)}</span>
          </p>
          <ArchivedDetailLabel />
        </footer>
      </div>
    </article>
  );
}

function ArchivedNoticeCardC01({ notice }: { notice: HousingNotice }) {
  const unit = archivedUnit(notice);
  return (
    <article
      className="archived-notice-card archived-notice-card--c01"
      data-status={notice.status}
      data-urgency={archivedUrgent(notice) ? "urgent" : undefined}
      aria-label={archivedCardLabel(notice, noticeDeadlineLabel(notice))}
    >
      <header className="archive-c01__signal">
        <ArchivedStatus notice={notice} />
        <ArchivedDeadline label="접수 마감" value={noticeDeadlineLabel(notice)} />
        <ArchivedBookmark size={44} />
      </header>
      <h4>{notice.title}</h4>
      <ArchivedClassification notice={notice} />
      <ArchivedLocation notice={notice} />
      <dl className="archive-c01__facts">
        <ArchivedPeriod notice={notice} className="archive-c01__period" />
        <div className="archive-c01__metric"><dt>{unit.label}</dt><dd>{unit.value}</dd></div>
        <div className="archive-c01__metric archive-c01__metric--complexes">
          <dt className="sr-only">공급 단지수</dt>
          <dd>공급 단지 {notice.details.supplyComplexes.length}곳</dd>
        </div>
      </dl>
      <footer className="archive-c01__footer">
        <p><span>{archivedSource(notice)}</span><i aria-hidden="true">·</i><span>{archivedView(notice)}</span></p>
        <ArchivedDetailLabel />
      </footer>
    </article>
  );
}

function ArchivedNoticeCardB02({ notice }: { notice: HousingNotice }) {
  const unit = archivedUnit(notice);
  return (
    <article
      className="archived-notice-card archived-notice-card--b02"
      data-status={notice.status}
      aria-label={archivedCardLabel(notice, noticeDeadlineLabel(notice))}
    >
      <div className="archive-b02__anchor">
        <ArchivedStatus notice={notice} />
        <ArchivedDeadline label="접수 마감" value={noticeDeadlineLabel(notice)} />
      </div>
      <div className="archive-b02__summary">
        <ArchivedContext notice={notice} />
        <div className="archive-b02__title-row"><h4>{notice.title}</h4><ArchivedBookmark size={44} /></div>
        <dl className="archive-b02__facts">
          <ArchivedPeriod notice={notice} className="archive-b02__period" />
          <div><dt>{unit.label}</dt><dd>{unit.value}</dd></div>
        </dl>
        <ArchivedMetaFooter notice={notice} className="archive-b02__footer" />
      </div>
    </article>
  );
}

function ArchivedNoticeCardB03({ notice }: { notice: HousingNotice }) {
  const unit = archivedUnit(notice);
  return (
    <article
      className="archived-notice-card archived-notice-card--b03"
      data-status={notice.status}
      aria-label={archivedCardLabel(notice, noticeDeadlineLabel(notice))}
    >
      <div className="archive-b03__summary">
        <div className="archive-b03__signal">
          <ArchivedStatus notice={notice} />
          <ArchivedDeadline label="접수 마감" value={noticeDeadlineLabel(notice)} />
        </div>
        <ArchivedContext notice={notice} />
        <div className="archive-b03__title-row"><h4>{notice.title}</h4><ArchivedBookmark size={44} /></div>
        <dl className="archive-b03__facts">
          <ArchivedPeriod notice={notice} className="archive-b03__period" />
          <div><dt>{unit.label}</dt><dd>{unit.value}</dd></div>
        </dl>
        <ArchivedMetaFooter notice={notice} className="archive-b03__footer" />
      </div>
    </article>
  );
}

function ArchivedNoticeCardC({ notice }: { notice: HousingNotice }) {
  const unit = archivedUnit(notice);
  const deadline = archivedRemainingDeadline(notice);
  const source = notice.sourceKind === "notice-document" ? "공고문 기반" : null;
  return (
    <article
      className="archived-notice-card archived-notice-card--c"
      data-variant="C"
      data-status={notice.status}
      data-urgency={archivedUrgent(notice) ? "urgent" : undefined}
      aria-label={archivedCardLabel(notice, deadline.value)}
    >
      <header className="archive-c__title-row"><h4>{notice.title}</h4><ArchivedBookmark size={44} /></header>
      <div className="archive-c__signal"><ArchivedStatus notice={notice} /><ArchivedDeadline {...deadline} /></div>
      <div className="archive-c__context"><ArchivedClassification notice={notice} /><ArchivedLocation notice={notice} /></div>
      <div className="archive-c__decision">
        <dl className="archive-c__period"><ArchivedPeriodStacked notice={notice} /></dl>
        <dl className="archive-c__supply">
          <div><dt>공급 단지</dt><dd>{notice.details.supplyComplexes.length}곳</dd></div>
          <div><dt>{unit.label}</dt><dd>{unit.value}</dd></div>
        </dl>
      </div>
      <footer className="archive-c__footer">
        <p>{source && <><span>{source}</span><i aria-hidden="true">·</i></>}<span>{archivedView(notice)}</span></p>
      </footer>
    </article>
  );
}

function ArchivedStatus({ notice }: { notice: HousingNotice }) {
  return (
    <div className="archive-card__status-group">
      <span className={`archive-card__status archive-card__status--${notice.status}`}>{noticeStatusLabel(notice.status)}</span>
      {notice.revision === "corrected" && <span className="archive-card__revision">정정공고중</span>}
    </div>
  );
}

function ArchivedDeadline({ label, value }: { label: string; value: string }) {
  return <p className="archive-card__deadline"><span>{label}</span><strong>{value}</strong></p>;
}

function ArchivedBookmark({ size }: { size: 36 | 44 }) {
  return (
    <span className="archive-card__bookmark" style={{ width: size, height: size }} aria-hidden="true">
      <Bookmark size={size === 36 ? 18 : 20} />
    </span>
  );
}

function ArchivedClassification({ notice }: { notice: HousingNotice }) {
  return (
    <p className="archive-card__classification">
      <span>{notice.rentalType}</span><i aria-hidden="true">·</i><span>{archivedRecruitment(notice)}</span>
    </p>
  );
}

function ArchivedLocation({ notice }: { notice: HousingNotice }) {
  return (
    <p className="archive-card__location">
      <span>{notice.region}</span><i aria-hidden="true">·</i><strong>{notice.provider}</strong>
    </p>
  );
}

function ArchivedContext({ notice }: { notice: HousingNotice }) {
  return (
    <div className="archive-card__context">
      <ArchivedLocation notice={notice} />
      <ArchivedClassification notice={notice} />
    </div>
  );
}

function ArchivedPeriod({
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
      <dd><time dateTime={notice.applyStart}>{formatNoticeDate(notice.applyStart)}</time><span aria-hidden="true"> – </span><time dateTime={notice.applyEnd}>{formatNoticeDate(notice.applyEnd)}</time></dd>
    </div>
  );
}

function ArchivedPeriodStacked({ notice }: { notice: HousingNotice }) {
  return (
    <div>
      <dt>접수기간</dt>
      <dd>
        <span><time dateTime={notice.applyStart}>{formatNoticeDate(notice.applyStart)}</time>부터</span>
        <span><time dateTime={notice.applyEnd}>{formatNoticeDate(notice.applyEnd)}</time>까지</span>
      </dd>
    </div>
  );
}

function ArchivedMetaFooter({ notice, className }: { notice: HousingNotice; className: string }) {
  return (
    <footer className={className}>
      <p><span>{archivedSource(notice)}</span><i aria-hidden="true">·</i><span>{archivedView(notice)}</span><i aria-hidden="true">·</i><strong>공급 단지 {notice.details.supplyComplexes.length}곳</strong></p>
      <ArchivedDetailLabel />
    </footer>
  );
}

function ArchivedDetailLabel() {
  return <span className="archive-card__detail-label">상세 보기 <ChevronRight size={14} aria-hidden="true" /></span>;
}

function archivedCardLabel(notice: HousingNotice, deadline: string) {
  return `${notice.title}, ${noticeStatusLabel(notice.status)}, ${deadline}`;
}

function archivedRecruitment(notice: HousingNotice) {
  if (notice.recruitmentKind === "reserve") return "예비입주자";
  if (notice.recruitmentKind === "additional") return "추가모집";
  return "신규입주자";
}

function archivedUnit(notice: HousingNotice) {
  const units = notice.units.toLocaleString("ko-KR");
  if (notice.unitLabel === "모집 예비자") return { label: "모집 예비자 수", value: `${units}명` };
  if (notice.unitLabel === "모집 호수") return { label: "모집 호수", value: `${units}호` };
  return { label: "공급 세대수", value: `${units}세대` };
}

function archivedSource(notice: HousingNotice) {
  if (notice.sourceKind === "notice-document") return "공고문 기반";
  return "프로토타입 예시";
}

function archivedView(notice: HousingNotice) {
  if (notice.sourceKind === "notice-document" && notice.viewCount === 0) return "조회 정보 확인 중";
  return `조회 ${notice.viewCount.toLocaleString("ko-KR")}`;
}

function archivedUrgent(notice: HousingNotice) {
  return notice.status === "open" && notice.daysLeft !== null && notice.daysLeft <= 3;
}

function archivedRemainingDeadline(notice: HousingNotice) {
  if (notice.status === "closed") return { label: "접수", value: "종료" };
  if (notice.status === "always") return { label: "접수", value: "상시" };
  if (notice.daysLeft === null) return { label: "마감일", value: "확인 중" };
  return { label: "접수 마감까지", value: `${notice.daysLeft}일` };
}
