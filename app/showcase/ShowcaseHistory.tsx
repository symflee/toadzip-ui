import type { HousingNotice } from "../housing-notice-data";
import { HorizontalScrollControls } from "./HorizontalScrollControls";
import { NOTICE_CARD_HISTORY_PREVIEWS } from "./NoticeCardHistory";
import { ShowcaseSourceActions } from "./RegisteredShowcaseDesigns";
import { getShowcaseDesignSourceUrl } from "./showcase-design-paths";
import {
  getPastPrototypeVersions,
  SHOWCASE_VIEW_IDS,
  type ShowcaseRevision,
  type ShowcaseView,
} from "./showcase-version-registry";

interface ShowcaseHistoryProps {
  view: ShowcaseView;
  viewTitle: string;
  notice: HousingNotice;
}

export function ShowcaseHistory({ view, viewTitle, notice }: ShowcaseHistoryProps) {
  const revisions = getPastPrototypeVersions(view);
  if (revisions.length === 0) return null;

  const subject = viewTitle.replace(/ UI$/, "");
  const historyLabel = `과거 ${subject} 시안`;
  const timelineId = `prototype-history-${view}`;
  return (
    <section
      className="prototype-history"
      aria-label={historyLabel}
    >
      <header className="prototype-history__header">
        <div>
          <span>DESIGN HISTORY</span>
          <h2>과거 시안</h2>
        </div>
        <HorizontalScrollControls label={historyLabel} targetId={timelineId} />
      </header>

      <ol
        id={timelineId}
        className="prototype-history__timeline"
        aria-label={`${subject} 변경 과정`}
        tabIndex={0}
      >
        {revisions.map((revision, index) => (
          <li key={revision.id}>
            <article
              className="prototype-history__entry"
              aria-label={`과거 시안 ${revision.label}`}
              data-archive-id={revision.id}
            >
              <header className="prototype-history__entry-header">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <small>{revision.label}</small>
                  <h3>{revision.title}</h3>
                </div>
                <b>{revision.source}</b>
              </header>
              <p className="prototype-history__summary">{revision.summary}</p>
              <div className="prototype-history__preview">
                <HistoryPreview revision={revision} view={view} notice={notice} />
              </div>
              <div className="prototype-history__source">
                <ShowcaseSourceActions
                  title={`${viewTitle} ${revision.label}`}
                  fileName={revision.id}
                  sourceUrl={getShowcaseDesignSourceUrl("builtin", revision.id)}
                />
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function getMissingShowcaseHistoryPreviewIds() {
  return SHOWCASE_VIEW_IDS.flatMap((view) => {
    return getPastPrototypeVersions(view)
      .filter((revision) => !hasHistoryPreview(view, revision.id))
      .map((revision) => `${view}:${revision.id}`);
  });
}

function HistoryPreview({
  revision,
  view,
  notice,
}: {
  revision: ShowcaseRevision;
  view: ShowcaseView;
  notice: HousingNotice;
}) {
  if (view === "notice-card") {
    const Preview = NOTICE_CARD_HISTORY_PREVIEWS[revision.id];
    if (Preview) return <Preview notice={notice} />;
  }
  throw new Error(`${view}:${revision.id} 과거 시안 미리보기가 필요합니다.`);
}

function hasHistoryPreview(view: ShowcaseView, revisionId: string) {
  if (view === "notice-card") return revisionId in NOTICE_CARD_HISTORY_PREVIEWS;
  return false;
}
