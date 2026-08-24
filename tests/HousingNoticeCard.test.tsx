import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HousingNoticeCard } from "../app/HousingNoticeCard";
import {
  formatNoticeDate,
  HOUSING_NOTICES,
  type HousingNotice,
} from "../app/housing-notice-data";

const BASE_NOTICE = HOUSING_NOTICES.find((notice) => {
  return notice.sourceKind === "prototype" && notice.status === "open";
}) ?? HOUSING_NOTICES[0]!;

function renderCard(
  notice: HousingNotice = BASE_NOTICE,
  callbacks = { onSelect: vi.fn(), onSave: vi.fn() },
  variant: "B" | "C" = "B",
) {
  render(
    <HousingNoticeCard
      notice={notice}
      variant={variant}
      selected={false}
      saved={false}
      onSelect={callbacks.onSelect}
      onSave={callbacks.onSave}
    />,
  );
  return callbacks;
}

function requiredElement(container: HTMLElement, selector: string) {
  const element = container.querySelector<HTMLElement>(selector);
  if (element) return element;
  throw new Error(`필수 카드 영역을 찾을 수 없습니다: ${selector}`);
}

describe("HousingNoticeCard 시안 B", () => {
  it("제목부터 일정과 공급 판단값까지 C의 검증된 위계로 보여준다", () => {
    const notice = { ...BASE_NOTICE, revision: "corrected" as const, daysLeft: 3 };
    renderCard(notice);
    const card = screen.getByRole("article", { name: new RegExp(notice.title) });
    const cardView = within(card);
    const summary = requiredElement(card, '[data-card-zone="summary"]');
    const titleRow = requiredElement(summary, ".notice-card-b__title-row");
    const signalRow = requiredElement(summary, '[data-summary-row="signal"]');
    const contextRow = requiredElement(summary, '[data-summary-row="context"]');
    const decisionRow = requiredElement(summary, '[data-summary-row="decision"]');
    const periodGroup = requiredElement(decisionRow, '[data-summary-group="period"]');
    const supplyGroup = requiredElement(decisionRow, '[data-summary-group="supply"]');
    const metaRow = requiredElement(summary, '[data-summary-row="meta"]');

    expect(card).toHaveAttribute("data-variant", "B");
    expect(card).toHaveAttribute("data-status", notice.status);
    const heading = within(titleRow).getByRole("heading", { name: notice.title });
    expect(heading).toHaveTextContent(notice.title);
    expect(within(signalRow).getByText("접수중")).toBeInTheDocument();
    expect(within(signalRow).getByText("정정공고중")).toBeInTheDocument();
    const deadline = within(signalRow).getByLabelText("접수 마감까지 3일");
    expect(within(deadline).getByText("접수 마감까지")).toBeInTheDocument();
    expect(within(deadline).getByText("3일")).toBeInTheDocument();
    expect(within(contextRow).getByText(notice.rentalType)).toBeInTheDocument();
    expect(within(contextRow).getByText("예비입주자")).toBeInTheDocument();
    expect(within(contextRow).getByText(notice.region)).toBeInTheDocument();
    expect(within(contextRow).getByText(notice.provider)).toBeInTheDocument();

    const start = formatNoticeDate(notice.applyStart);
    const end = formatNoticeDate(notice.applyEnd);
    expect(within(periodGroup).getByText("접수기간")).toBeInTheDocument();
    expect(periodGroup).toHaveTextContent(`${start}부터`);
    expect(periodGroup).toHaveTextContent(`${end}까지`);
    expect(within(supplyGroup).getByText("공급 단지")).toBeInTheDocument();
    expect(within(supplyGroup).getByText(`${notice.details.supplyComplexes.length}곳`))
      .toBeInTheDocument();
    expect(within(supplyGroup).getByText("공급 세대수")).toBeInTheDocument();
    expect(within(supplyGroup).getByText(`${notice.units.toLocaleString("ko-KR")}세대`))
      .toBeInTheDocument();
    expect(within(metaRow).getByText(`조회 ${notice.viewCount.toLocaleString("ko-KR")}`))
      .toBeInTheDocument();

    const orderedRows = [titleRow, signalRow, contextRow, decisionRow, metaRow];
    for (let index = 0; index < orderedRows.length - 1; index += 1) {
      const position = orderedRows[index].compareDocumentPosition(orderedRows[index + 1]);
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    }

    const singleDisplayValues = [
      notice.title,
      "접수중",
      "정정공고중",
      "접수 마감까지",
      "3일",
      notice.rentalType,
      "예비입주자",
      notice.region,
      notice.provider,
      "접수기간",
      start,
      end,
      "공급 단지",
      `${notice.details.supplyComplexes.length}곳`,
      "공급 세대수",
      `${notice.units.toLocaleString("ko-KR")}세대`,
      `조회 ${notice.viewCount.toLocaleString("ko-KR")}`,
    ];
    for (const value of singleDisplayValues) {
      expect(cardView.getAllByText(value, { exact: true })).toHaveLength(1);
    }
    expect(cardView.queryByText("프로토타입 예시")).not.toBeInTheDocument();
    const primaryAction = cardView.getByRole("button", { name: `${notice.title} 상세 보기` });
    expect(primaryAction).toHaveClass("notice-card-b__primary-action");
    expect(within(primaryAction).getByText("상세 보기")).toHaveClass("sr-only");
  });

  it("관심 맥락을 두 그룹으로 나누고 북마크를 실제 32px 제어로 제공한다", () => {
    renderCard();
    const card = screen.getByRole("article", { name: new RegExp(BASE_NOTICE.title) });
    const summary = requiredElement(card, '[data-card-zone="summary"]');
    const contextRow = requiredElement(summary, '[data-summary-row="context"]');
    const regionGroup = requiredElement(contextRow, '[data-context-group="region"]');
    const interestGroup = requiredElement(contextRow, '[data-context-group="interest"]');
    const titleRow = requiredElement(summary, ".notice-card-b__title-row");
    const bookmark = within(titleRow).getByRole("button", {
      name: `${BASE_NOTICE.title} 공고 저장`,
    });

    expect(card.querySelector('[data-card-zone="status-anchor"]')).not.toBeInTheDocument();
    expect(card.querySelector("img, picture")).not.toBeInTheDocument();
    expect(summary.parentElement).toBe(card);
    expect(within(regionGroup).getByText(BASE_NOTICE.region)).toBeInTheDocument();
    expect(within(regionGroup).queryByText(BASE_NOTICE.provider)).not.toBeInTheDocument();
    expect(within(interestGroup).getByText(BASE_NOTICE.provider)).toBeInTheDocument();
    expect(within(interestGroup).getByText(BASE_NOTICE.rentalType)).toBeInTheDocument();
    expect(within(interestGroup).getByText("예비입주자")).toBeInTheDocument();
    expect(regionGroup.nextElementSibling).toBe(interestGroup);
    expect(bookmark).toHaveClass("notice-card__bookmark--compact");
    expect(bookmark).toHaveAttribute("data-control-size", "32");
  });

  it.each([
    ["공급 세대", "공급 세대수", "75세대"],
    ["공급 세대수", "공급 세대수", "75세대"],
    ["모집 예비자", "모집 예비자 수", "75명"],
    ["모집 호수", "모집 호수", "75호"],
  ] as const)("%s는 의미에 맞는 라벨과 단위를 유지한다", (unitLabel, label, value) => {
    renderCard({ ...BASE_NOTICE, units: 75, unitLabel });

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(value)).toBeInTheDocument();
  });

  it("공고문에 없는 조회수는 실제 0회처럼 꾸미지 않는다", () => {
    renderCard({ ...BASE_NOTICE, sourceKind: "notice-document", viewCount: 0 });

    expect(screen.getByText("공고문 기반")).toBeInTheDocument();
    expect(screen.getByText("조회 정보 확인 중")).toBeInTheDocument();
    expect(screen.queryByText("조회 0")).not.toBeInTheDocument();
  });

  it.each([
    ["upcoming", 11, "접수예정", "접수 마감까지 11일", "접수 마감까지", "11일"],
    ["closed", null, "접수마감", "접수 마감 완료", "접수", "종료"],
    ["always", null, "상시모집", "상시 모집", "접수", "상시"],
    ["upcoming", null, "접수예정", "접수 마감일 정보 확인 중", "마감일", "확인 중"],
  ] as const)(
    "%s 상태는 마감 의미를 혼동하지 않는다",
    (status, daysLeft, statusLabel, accessibleLabel, deadlineContext, deadlineValue) => {
      renderCard({ ...BASE_NOTICE, status, daysLeft });

      expect(screen.getByText(statusLabel)).toBeInTheDocument();
      const deadline = screen.getByLabelText(accessibleLabel);
      expect(within(deadline).getByText(deadlineContext)).toBeInTheDocument();
      expect(within(deadline).getByText(deadlineValue)).toBeInTheDocument();
    },
  );

  it.each([
    ["open", 3, true],
    ["open", 4, false],
    ["upcoming", 2, false],
    ["closed", 1, false],
    ["always", null, false],
  ] as const)(
    "%s D-%s는 실제 임박한 접수중 공고에만 긴급 표시를 둔다",
    (status, daysLeft, urgent) => {
      renderCard({ ...BASE_NOTICE, status, daysLeft }, undefined, "C");
      const card = screen.getByRole("article", { name: new RegExp(BASE_NOTICE.title) });

      if (urgent) {
        expect(card).toHaveAttribute("data-urgency", "urgent");
        return;
      }
      expect(card).not.toHaveAttribute("data-urgency");
    },
  );

  it("북마크와 가시 문구 없는 카드 전체 주 행동을 독립적으로 제공한다", () => {
    const callbacks = renderCard();
    const card = screen.getByRole("article", { name: new RegExp(BASE_NOTICE.title) });
    const summary = requiredElement(card, '[data-card-zone="summary"]');
    const primaryAction = within(card).getByRole("button", {
      name: `${BASE_NOTICE.title} 상세 보기`,
    });

    fireEvent.click(screen.getByRole("button", { name: `${BASE_NOTICE.title} 공고 저장` }));
    expect(callbacks.onSave).toHaveBeenCalledOnce();
    expect(callbacks.onSelect).not.toHaveBeenCalled();

    expect(card).toHaveAccessibleName(new RegExp(BASE_NOTICE.title));
    expect(primaryAction.parentElement).toBe(summary);
    expect(primaryAction).toHaveClass("notice-card-b__primary-action");
    expect(within(primaryAction).getByText("상세 보기")).toHaveClass("sr-only");
    fireEvent.click(primaryAction);
    expect(callbacks.onSelect).toHaveBeenCalledOnce();
    expect(callbacks.onSave).toHaveBeenCalledOnce();
  });
});

describe("HousingNoticeCard 시안 C", () => {
  it("공고명을 먼저 읽고 일정과 공급 판단값을 인접한 그룹에서 비교한다", () => {
    const notice = { ...BASE_NOTICE, revision: "corrected" as const, daysLeft: 3 };
    renderCard(notice, undefined, "C");
    const card = screen.getByRole("article", { name: new RegExp(notice.title) });
    const cardView = within(card);
    const titleRow = requiredElement(card, ".notice-card-c__title-row");
    const signalRow = requiredElement(card, '[data-summary-row="signal"]');
    const contextRow = requiredElement(card, '[data-summary-row="context"]');
    const decisionRow = requiredElement(card, '[data-summary-row="decision"]');
    const periodGroup = requiredElement(decisionRow, '[data-summary-group="period"]');
    const supplyGroup = requiredElement(decisionRow, '[data-summary-group="supply"]');

    expect(card).toHaveAttribute("data-variant", "C");
    expect(card).toHaveAttribute("data-status", notice.status);
    const heading = within(titleRow).getByRole("heading", { name: notice.title });
    expect(heading).toHaveTextContent(notice.title);
    expect(within(signalRow).getByText("접수중")).toBeInTheDocument();
    expect(within(signalRow).getByText("정정공고중")).toBeInTheDocument();
    const deadline = within(signalRow).getByLabelText("접수 마감까지 3일");
    expect(within(deadline).getByText("접수 마감까지")).toBeInTheDocument();
    expect(within(deadline).getByText("3일")).toBeInTheDocument();
    expect(within(contextRow).getByText(notice.rentalType)).toBeInTheDocument();
    expect(within(contextRow).getByText("예비입주자")).toBeInTheDocument();
    expect(within(contextRow).getByText(notice.region)).toBeInTheDocument();
    expect(within(contextRow).getByText(notice.provider)).toBeInTheDocument();

    const start = formatNoticeDate(notice.applyStart);
    const end = formatNoticeDate(notice.applyEnd);
    expect(within(periodGroup).getByText("접수기간")).toBeInTheDocument();
    expect(periodGroup).toHaveTextContent(`${start}부터`);
    expect(periodGroup).toHaveTextContent(`${end}까지`);
    expect(within(supplyGroup).getByText("공급 세대수")).toBeInTheDocument();
    expect(within(supplyGroup).getByText(`${notice.units.toLocaleString("ko-KR")}세대`))
      .toBeInTheDocument();
    expect(within(supplyGroup).getByText("공급 단지")).toBeInTheDocument();
    expect(within(supplyGroup).getByText(
      `${notice.details.supplyComplexes.length}곳`,
    )).toBeInTheDocument();

    const orderedRows = [titleRow, signalRow, contextRow, decisionRow];
    for (let index = 0; index < orderedRows.length - 1; index += 1) {
      const position = orderedRows[index].compareDocumentPosition(orderedRows[index + 1]);
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    }

    const singleDisplayValues = [
      notice.title,
      "접수중",
      "정정공고중",
      "접수 마감까지",
      "3일",
      notice.rentalType,
      "예비입주자",
      notice.region,
      notice.provider,
      "접수기간",
      start,
      end,
      "공급 세대수",
      `${notice.units.toLocaleString("ko-KR")}세대`,
      "공급 단지",
      `${notice.details.supplyComplexes.length}곳`,
      `조회 ${notice.viewCount.toLocaleString("ko-KR")}`,
    ];
    for (const value of singleDisplayValues) {
      expect(cardView.getAllByText(value, { exact: true })).toHaveLength(1);
    }
    expect(cardView.queryByText("프로토타입 예시")).not.toBeInTheDocument();
    expect(cardView.getByRole("button", { name: `${notice.title} 공고 저장` }))
      .toHaveAttribute("aria-pressed", "false");
    const primaryAction = cardView.getByRole("button", { name: `${notice.title} 상세 보기` });
    expect(primaryAction).toHaveClass("notice-card-c__primary-action");
    expect(within(primaryAction).getByText("상세 보기")).toHaveClass("sr-only");
  });

  it("긴 공고명을 생략하지 않고 제목 전체로 제공한다", () => {
    const title = "김해진영 센텀큐브 10년 공공임대주택 리츠 예비입주자 모집공고 정정 안내";
    renderCard({ ...BASE_NOTICE, title }, undefined, "C");

    expect(screen.getByRole("heading", { name: title })).toHaveTextContent(title);
  });

  it.each([
    ["open", 0, "접수중", "접수 마감까지 0일", "접수 마감까지", "0일"],
    ["upcoming", 11, "접수예정", "접수 마감까지 11일", "접수 마감까지", "11일"],
    ["closed", null, "접수마감", "접수 마감 완료", "접수", "종료"],
    ["always", null, "상시모집", "상시 모집", "접수", "상시"],
    ["upcoming", null, "접수예정", "접수 마감일 정보 확인 중", "마감일", "확인 중"],
  ] as const)(
    "%s 상태의 마감 의미를 텍스트로 구분한다",
    (status, daysLeft, statusLabel, accessibleLabel, deadlineContext, deadlineValue) => {
      renderCard({ ...BASE_NOTICE, status, daysLeft }, undefined, "C");

      expect(screen.getByText(statusLabel)).toBeInTheDocument();
      const deadline = screen.getByLabelText(accessibleLabel);
      expect(within(deadline).getByText(deadlineContext)).toBeInTheDocument();
      expect(within(deadline).getByText(deadlineValue)).toBeInTheDocument();
    },
  );

  it.each([
    ["공급 세대", "공급 세대수", "75세대"],
    ["공급 세대수", "공급 세대수", "75세대"],
    ["모집 예비자", "모집 예비자 수", "75명"],
    ["모집 호수", "모집 호수", "75호"],
  ] as const)("%s는 정확한 라벨과 단위로 표시한다", (unitLabel, label, value) => {
    renderCard({ ...BASE_NOTICE, units: 75, unitLabel }, undefined, "C");

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(value)).toBeInTheDocument();
  });

  it("공고문에서 확인되지 않은 조회수는 0회로 표시하지 않는다", () => {
    renderCard(
      { ...BASE_NOTICE, sourceKind: "notice-document", viewCount: 0 },
      undefined,
      "C",
    );

    expect(screen.getByText("공고문 기반")).toBeInTheDocument();
    expect(screen.getByText("조회 정보 확인 중")).toBeInTheDocument();
    expect(screen.queryByText("조회 0")).not.toBeInTheDocument();
  });

  it("단일 단지와 다중 단지를 실제 연결 개수로 구분한다", () => {
    const supplyComplexes = BASE_NOTICE.details.supplyComplexes.slice(0, 1);
    renderCard(
      { ...BASE_NOTICE, details: { ...BASE_NOTICE.details, supplyComplexes } },
      undefined,
      "C",
    );

    expect(screen.getByText("공급 단지")).toBeInTheDocument();
    expect(screen.getByText("1곳")).toBeInTheDocument();
  });

  it("북마크와 가시 문구 없는 카드 주 행동을 독립적으로 제공한다", () => {
    const callbacks = renderCard(BASE_NOTICE, undefined, "C");
    const card = screen.getByRole("article", { name: new RegExp(BASE_NOTICE.title) });
    const primaryAction = within(card).getByRole("button", {
      name: `${BASE_NOTICE.title} 상세 보기`,
    });

    fireEvent.click(screen.getByRole("button", { name: `${BASE_NOTICE.title} 공고 저장` }));
    expect(callbacks.onSave).toHaveBeenCalledOnce();
    expect(callbacks.onSelect).not.toHaveBeenCalled();

    expect(card).toHaveAccessibleName(new RegExp(BASE_NOTICE.title));
    expect(primaryAction).toHaveClass("notice-card-c__primary-action");
    expect(within(primaryAction).getByText("상세 보기")).toHaveClass("sr-only");
    fireEvent.click(primaryAction);
    expect(callbacks.onSelect).toHaveBeenCalledOnce();
    expect(callbacks.onSave).toHaveBeenCalledOnce();
  });
});
