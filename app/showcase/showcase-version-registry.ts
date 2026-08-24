export const SHOWCASE_VIEW_IDS = [
  "notice-card",
  "notice-list",
  "notice-detail",
  "complex-card",
  "complex-list",
  "complex-detail",
  "map-marker",
  "top-bar",
] as const;

export type ShowcaseView = (typeof SHOWCASE_VIEW_IDS)[number];
export type ShowcaseVariant = "A" | "B" | "C";

export interface ShowcaseRevisionIdentity {
  id: string;
  variant: ShowcaseVariant;
  sequence: number;
}

export interface ShowcaseRevision extends ShowcaseRevisionIdentity {
  label: string;
  title: string;
  summary: string;
  source: string;
  statusLabel: "현재 구현" | "신규 제안";
}

export interface ShowcaseVersionDefinition<
  Revision extends ShowcaseRevisionIdentity = ShowcaseRevisionIdentity,
> {
  comparisonVariants: readonly ShowcaseVariant[];
  activeVariants?: readonly ShowcaseVariant[];
  revisions: readonly Revision[];
}

export interface CurrentPrototypeSlot<Revision extends ShowcaseRevisionIdentity> {
  variant: ShowcaseVariant;
  revision: Revision | null;
}

export interface PrototypeVersionSelection<Revision extends ShowcaseRevisionIdentity> {
  current: readonly CurrentPrototypeSlot<Revision>[];
  past: readonly Revision[];
}

const registry = {
  "notice-card": defineShowcaseView({
    comparisonVariants: ["A", "B"],
    activeVariants: ["A", "B"],
    revisions: [
      currentRevision("notice-card-a-current", "A", 0, "A", "현재 공고 목록 카드", "현재 구현"),
      archivedRevision(
        "b-01",
        "B",
        1,
        "B-01",
        "접수 판단 우선형",
        "큰 상태 신호 헤더와 구획형 정보 행으로 접수 판단을 가장 먼저 보여준 초기 제안",
        "Codex 작업 diff에서 복원",
      ),
      archivedRevision(
        "c-01",
        "C",
        2,
        "C-01",
        "상태 레일형 컴팩트 브리프",
        "왼쪽 상태 레일과 제목·기간·모집량 비교축을 사용한 최초 C",
        "Codex 작업 diff에서 복원",
      ),
      archivedRevision(
        "b-02",
        "B",
        3,
        "B-02",
        "상태 앵커형 가로 브리프",
        "첨부 레퍼런스의 이미지 자리를 상태와 마감 정보가 담긴 왼쪽 앵커로 번역한 제안",
        "Codex 작업 diff에서 복원",
      ),
      archivedRevision(
        "b-03",
        "B",
        4,
        "B-03",
        "이미지 없는 저높이 가로 브리프",
        "상태 앵커를 제거하고 한 화면에서 여러 공고를 훑도록 세로 높이를 줄인 제안",
        "Codex 작업 diff에서 복원",
      ),
      archivedRevision(
        "c",
        "C",
        5,
        "C",
        "제목 우선 일정·공급 브리프",
        "공고명을 먼저 읽고 접수기간과 공급 규모를 한 묶음으로 비교하는 제목 우선형 브리프",
        "현재 C 보관",
      ),
      currentRevision(
        "notice-card-b-current",
        "B",
        6,
        "B",
        "관심 조건 묶음형 공고 브리프",
        "신규 제안",
      ),
    ],
  }),
  "notice-list": singleCurrentView("notice-list-a-current", "현재 공고 목록"),
  "notice-detail": defineShowcaseView({
    comparisonVariants: ["A", "B", "C"],
    activeVariants: ["A", "B"],
    revisions: [
      currentRevision("notice-detail-a-current", "A", 0, "A", "현재 공고 상세", "현재 구현"),
      currentRevision("notice-detail-b-current", "B", 1, "B", "공고 상세 비교형", "신규 제안"),
    ],
  }),
  "complex-card": singleCurrentView("complex-card-a-current", "현재 단지 목록 카드"),
  "complex-list": singleCurrentView("complex-list-a-current", "현재 단지 목록"),
  "complex-detail": singleCurrentView("complex-detail-a-current", "현재 단지 상세"),
  "map-marker": singleCurrentView("map-marker-a-current", "현재 지도 마커"),
  "top-bar": singleCurrentView("top-bar-a-current", "현재 상단 바"),
} satisfies Record<ShowcaseView, ShowcaseVersionDefinition<ShowcaseRevision>>;

export const SHOWCASE_VERSION_REGISTRY: Readonly<
  Record<ShowcaseView, ShowcaseVersionDefinition<ShowcaseRevision>>
> = registry;

export function selectPrototypeVersions<Revision extends ShowcaseRevisionIdentity>(
  definition: ShowcaseVersionDefinition<Revision>,
): PrototypeVersionSelection<Revision> {
  const activeVariants = definition.activeVariants ?? definition.comparisonVariants;
  const current = definition.comparisonVariants.map((variant) => ({
    variant,
    revision: activeVariants.includes(variant)
      ? latestRevision(definition.revisions, variant)
      : null,
  }));
  const currentIds = new Set(current.flatMap((slot) => {
    return slot.revision ? [slot.revision.id] : [];
  }));
  const past = [...definition.revisions]
    .filter((revision) => !currentIds.has(revision.id))
    .sort((left, right) => left.sequence - right.sequence);
  return { current, past };
}

export function getCurrentPrototypeSlots(view: ShowcaseView) {
  return selectPrototypeVersions(SHOWCASE_VERSION_REGISTRY[view]).current;
}

export function getPastPrototypeVersions(view: ShowcaseView) {
  return selectPrototypeVersions(SHOWCASE_VERSION_REGISTRY[view]).past;
}

function defineShowcaseView(
  definition: ShowcaseVersionDefinition<ShowcaseRevision>,
): ShowcaseVersionDefinition<ShowcaseRevision> {
  validateDefinition(definition);
  return definition;
}

function singleCurrentView(id: string, title: string) {
  return defineShowcaseView({
    comparisonVariants: ["A", "B", "C"],
    activeVariants: ["A"],
    revisions: [currentRevision(id, "A", 0, "A", title, "현재 구현")],
  });
}

function currentRevision(
  id: string,
  variant: ShowcaseVariant,
  sequence: number,
  label: string,
  title: string,
  statusLabel: ShowcaseRevision["statusLabel"],
): ShowcaseRevision {
  return {
    id,
    variant,
    sequence,
    label,
    title,
    summary: `${title}의 보관 버전`,
    source: "현재 시안에서 보관",
    statusLabel,
  };
}

function archivedRevision(
  id: string,
  variant: ShowcaseVariant,
  sequence: number,
  label: string,
  title: string,
  summary: string,
  source: string,
): ShowcaseRevision {
  return {
    id,
    variant,
    sequence,
    label,
    title,
    summary,
    source,
    statusLabel: "신규 제안",
  };
}

function latestRevision<Revision extends ShowcaseRevisionIdentity>(
  revisions: readonly Revision[],
  variant: ShowcaseVariant,
) {
  return [...revisions]
    .filter((revision) => revision.variant === variant)
    .sort((left, right) => right.sequence - left.sequence)[0] ?? null;
}

function validateDefinition(definition: ShowcaseVersionDefinition<ShowcaseRevision>) {
  const ids = definition.revisions.map((revision) => revision.id);
  const sequences = definition.revisions.map((revision) => revision.sequence);
  if (new Set(ids).size !== ids.length) {
    throw new Error("시안 버전 id는 화면 안에서 중복될 수 없습니다.");
  }
  if (new Set(sequences).size !== sequences.length) {
    throw new Error("시안 버전 순서는 화면 안에서 중복될 수 없습니다.");
  }
  if (!sequences.every((sequence, index) => index === 0 || sequence > sequences[index - 1])) {
    throw new Error("시안 버전은 변경 순서대로 뒤에 추가해야 합니다.");
  }
  const activeVariants = definition.activeVariants ?? definition.comparisonVariants;
  if (activeVariants.some((variant) => !definition.comparisonVariants.includes(variant))) {
    throw new Error("활성 시안은 비교 영역에 포함되어야 합니다.");
  }
  if (activeVariants.some((variant) => latestRevision(definition.revisions, variant) === null)) {
    throw new Error("활성 시안에는 최소 한 개의 버전이 필요합니다.");
  }
}
