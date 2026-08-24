import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HousingNoticeDetailPanelB } from "../app/HousingNoticeDetailPanelB";
import { PrototypeShowcase } from "../app/showcase/PrototypeShowcase";
import { HOUSING_NOTICES } from "../app/housing-notice-data";
import { HOUSING_LISTINGS } from "../app/housing-data";

const SHOWCASE_NOTICE = HOUSING_NOTICES.find((notice) => {
  return notice.sourceKind === "prototype" && notice.status === "open";
}) ?? HOUSING_NOTICES[0]!;

describe("UI 시안 보드", () => {
  it("보드와 A/B/C 비교 영역을 키보드로 스크롤할 수 있다", () => {
    render(<PrototypeShowcase view="notice-detail" />);

    const board = screen.getByRole("main", { name: "UI 시안 보드" });
    const sidebar = screen.getByRole("complementary", { name: "시안 페이지" });
    const content = screen.getByRole("region", {
      name: "공고 상세 UI 시안 내용",
    });
    const comparison = screen.getByRole("region", {
      name: "공고 상세 UI A, B, C 비교",
    });
    expect(board).not.toHaveAttribute("tabindex");
    expect(content).toHaveAttribute("tabindex", "0");
    expect(sidebar.nextElementSibling).toBe(content);
    expect(comparison).toHaveAttribute("tabindex", "0");
    for (const variant of ["A", "B", "C"]) {
      expect(within(comparison).getByRole("article", { name: `시안 ${variant}` }))
        .toHaveAttribute("tabindex", "0");
    }
  });

  it("사이드바에서 모든 UI 요소 검토 페이지로 이동할 수 있다", () => {
    render(<PrototypeShowcase view="notice-card" />);
    const sidebar = screen.getByRole("complementary", { name: "시안 페이지" });

    expect(within(sidebar).getByRole("link", { name: /공고 목록 카드 UI/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(sidebar).getByRole("link", { name: /공고 목록 UI/ })).toHaveAttribute(
      "href",
      "/showcase/notice-list",
    );
    expect(within(sidebar).getByRole("link", { name: /공고 상세 UI/ })).toHaveAttribute(
      "href",
      "/showcase/notice-detail",
    );
    expect(within(sidebar).getByRole("link", { name: /단지 목록 카드 UI/ })).toHaveAttribute(
      "href",
      "/showcase/complex-card",
    );
    expect(within(sidebar).getByRole("link", { name: /단지 목록 UI/ })).toHaveAttribute(
      "href",
      "/showcase/complex-list",
    );
    expect(within(sidebar).getByRole("link", { name: /단지 상세 UI/ })).toHaveAttribute(
      "href",
      "/showcase/complex-detail",
    );
    expect(within(sidebar).getByRole("link", { name: /지도 마커 UI/ })).toHaveAttribute(
      "href",
      "/showcase/map-marker",
    );
    expect(within(sidebar).getByRole("link", { name: /상단 바 UI/ })).toHaveAttribute(
      "href",
      "/showcase/top-bar",
    );
  });

  it("데스크톱 사이드바를 접고 펼쳐도 전체 메뉴 이름을 유지한다", () => {
    render(<PrototypeShowcase view="notice-card" />);
    const board = screen.getByRole("main", { name: "UI 시안 보드" });
    const sidebar = screen.getByRole("complementary", { name: "시안 페이지" });
    const content = screen.getByRole("region", {
      name: "공고 목록 카드 UI 시안 내용",
    });
    const collapse = within(sidebar).getByRole("button", { name: "시안 메뉴 접기" });

    expect(sidebar).toHaveAttribute("id", "prototype-showcase-sidebar");
    expect(board).toHaveAttribute("data-sidebar-collapsed", "false");
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    expect(collapse).toHaveAttribute("aria-controls", "prototype-showcase-sidebar");
    content.scrollTop = 180;

    fireEvent.click(collapse);

    expect(board).toHaveAttribute("data-sidebar-collapsed", "true");
    expect(content.scrollTop).toBe(180);
    const expand = within(sidebar).getByRole("button", { name: "시안 메뉴 펼치기" });
    expect(expand).toHaveAttribute("aria-expanded", "false");
    expect(within(sidebar).getByRole("link", { name: "공고 목록 UI" }))
      .toHaveAttribute("href", "/showcase/notice-list");

    fireEvent.click(expand);
    expect(board).toHaveAttribute("data-sidebar-collapsed", "false");
  });

  it("현재 비교와 과거 시안을 버튼으로 가로 이동한다", () => {
    render(<PrototypeShowcase view="notice-card" />);
    const comparison = screen.getByRole("region", {
      name: "현재 공고 목록 카드 시안 A, B 비교",
    });
    const history = screen.getByRole("region", {
      name: "과거 공고 목록 카드 시안",
    });
    const timeline = within(history).getByRole("list", {
      name: "공고 목록 카드 변경 과정",
    });
    const comparisonScrollBy = vi.fn();
    const historyScrollBy = vi.fn();
    Object.defineProperty(comparison, "clientWidth", { configurable: true, value: 800 });
    Object.defineProperty(comparison, "scrollWidth", { configurable: true, value: 1600 });
    Object.defineProperty(comparison, "scrollLeft", {
      configurable: true,
      value: 0,
      writable: true,
    });
    Object.defineProperty(timeline, "clientWidth", { configurable: true, value: 600 });
    Object.defineProperty(timeline, "scrollWidth", { configurable: true, value: 1400 });
    Object.defineProperty(timeline, "scrollLeft", {
      configurable: true,
      value: 200,
      writable: true,
    });
    comparison.scrollBy = comparisonScrollBy;
    timeline.scrollBy = historyScrollBy;
    fireEvent.scroll(comparison);
    fireEvent.scroll(timeline);

    const currentPrevious = screen.getByRole("button", {
      name: "현재 공고 목록 카드 시안 왼쪽으로 이동",
    });
    const currentNext = screen.getByRole("button", {
      name: "현재 공고 목록 카드 시안 오른쪽으로 이동",
    });
    const historyPrevious = screen.getByRole("button", {
      name: "과거 공고 목록 카드 시안 왼쪽으로 이동",
    });
    expect(currentNext).toHaveAttribute("aria-controls", comparison.id);
    expect(historyPrevious).toHaveAttribute("aria-controls", timeline.id);
    expect(currentPrevious).toBeDisabled();
    expect(currentNext).toBeEnabled();
    expect(historyPrevious).toBeEnabled();

    fireEvent.click(currentNext);
    fireEvent.click(historyPrevious);

    expect(comparisonScrollBy).toHaveBeenCalledWith({
      behavior: "smooth",
      left: 680,
    });
    expect(historyScrollBy).toHaveBeenCalledWith({
      behavior: "smooth",
      left: -510,
    });

    comparison.scrollLeft = 800;
    fireEvent.scroll(comparison);
    expect(currentPrevious).toBeEnabled();
    expect(currentNext).toBeDisabled();
  });

  it("공고 카드 페이지의 현재 비교에는 A와 B만 유지한다", () => {
    render(<PrototypeShowcase view="notice-card" />);
    const comparison = screen.getByRole("region", {
      name: "현재 공고 목록 카드 시안 A, B 비교",
    });

    const variantA = within(comparison).getByRole("article", { name: "시안 A" });
    const variantB = within(comparison).getByRole("article", { name: "시안 B" });
    const currentCard = within(variantA).getByRole("article", { name: /접수/ });
    const proposedCardB = within(variantB).getByRole("article", { name: /접수/ });

    expect(within(variantA).getByText("현재 구현")).toBeInTheDocument();
    expect(within(variantB).getByText("신규 제안")).toBeInTheDocument();
    expect(within(comparison).queryByText("빈 자리")).not.toBeInTheDocument();
    expect(within(comparison).queryByRole("article", { name: "시안 C" }))
      .not.toBeInTheDocument();
    expect(currentCard).toHaveAttribute("data-variant", "A");
    expect(proposedCardB).toHaveAttribute("data-variant", "B");
    expect(
      screen.getByText("시안 C의 제목 우선 구조에서 북마크를 줄이고 지역과 공급 관심 조건을 묶은 관심 조건 브리프"),
    ).toBeInTheDocument();
  });

  it("공고 카드의 과거 시안을 변경 순서대로 보관하고 C를 마지막에 둔다", () => {
    render(<PrototypeShowcase view="notice-card" />);

    const history = screen.getByRole("region", {
      name: "과거 공고 목록 카드 시안",
    });
    expect(within(history).getByRole("heading", { name: "과거 시안" }))
      .toBeInTheDocument();
    expect(
      within(history).queryByText(
        "Codex 작업 diff에 남은 실제 구조와 스타일을 변경 순서대로 복원했습니다.",
      ),
    ).not.toBeInTheDocument();

    const timeline = within(history).getByRole("list", {
      name: "공고 목록 카드 변경 과정",
    });
    expect(timeline.tagName).toBe("OL");
    const changes = within(timeline).getAllByRole("listitem");
    expect(changes).toHaveLength(5);

    const archivedLabels = [
      "과거 시안 B-01",
      "과거 시안 C-01",
      "과거 시안 B-02",
      "과거 시안 B-03",
      "과거 시안 C",
    ];
    archivedLabels.forEach((label, index) => {
      expect(within(changes[index]).getByRole("article", { name: label }))
        .toBeInTheDocument();
    });
    expect(within(timeline).getAllByText("Codex 작업 diff에서 복원")).toHaveLength(4);
    expect(within(timeline).getByText("현재 C 보관")).toBeInTheDocument();
    expect(within(timeline).queryByRole("button")).not.toBeInTheDocument();
    expect(within(timeline).queryByRole("link")).not.toBeInTheDocument();

    const archiveIds = changes.map((change, index) => {
      return within(change).getByRole("article", {
        name: archivedLabels[index],
      }).getAttribute("data-archive-id");
    });
    expect(archiveIds).toEqual(["b-01", "c-01", "b-02", "b-03", "c"]);

    const latestHistory = changes.at(-1);
    expect(latestHistory).toBeDefined();
    const archivedVariantC = within(latestHistory!).getByRole("article", {
      name: "과거 시안 C",
    });
    expect(within(archivedVariantC).getByRole("article", { name: /접수/ }))
      .toHaveAttribute("data-variant", "C");
    expect(
      within(archivedVariantC).getByText("공고명을 먼저 읽고 접수기간과 공급 규모를 한 묶음으로 비교하는 제목 우선형 브리프"),
    ).toBeInTheDocument();
  });

  it("공고 목록 페이지의 A 시안에 기존 목록 요소를 배치한다", () => {
    render(<PrototypeShowcase view="notice-list" />);

    const list = screen.getByRole("region", { name: "현재 공고 목록 시안" });
    const listScroll = within(list).getByRole("region", { name: "공고 카드 스크롤" });
    expect(within(list).getByRole("tab", { name: "공고 목록" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(within(list).getByRole("searchbox", { name: "공고 검색 시안" })).toBeInTheDocument();
    expect(listScroll).toHaveAttribute("tabindex", "0");
    expect(within(listScroll).getAllByRole("article")).toHaveLength(3);
  });

  it("공고 상세 페이지에서 기존 A와 신규 B를 함께 비교한다", () => {
    render(<PrototypeShowcase view="notice-detail" />);

    const comparison = screen.getByRole("region", {
      name: "공고 상세 UI A, B, C 비교",
    });
    const variantA = within(comparison).getByRole("article", { name: "시안 A" });
    const variantB = within(comparison).getByRole("article", { name: "시안 B" });
    const detailA = within(variantA).getByRole("complementary", {
      name: /공고 상세 정보/,
    });
    const detailB = within(variantB).getByRole("complementary", {
      name: /공고 상세 시안 B/,
    });

    expect(detailA).toHaveClass("is-showcase");
    expect(within(detailA).getByRole("region", { name: /공고 상세 내용/ }))
      .toHaveAttribute("tabindex", "0");
    expect(within(detailA).queryByRole("button", { name: "공고 상세 닫기" }))
      .not.toBeInTheDocument();
    expect(within(detailA).getByText("공고 핵심 정보")).toBeInTheDocument();
    expect(detailB).toHaveClass("is-showcase");
    expect(within(detailB).getByRole("region", { name: /공고 상세 시안 B 내용/ }))
      .toHaveAttribute("tabindex", "0");
    expect(within(variantB).getByText("신규 제안")).toBeInTheDocument();
    expect(within(comparison).getAllByText("빈 자리")).toHaveLength(1);
  });

  it("공고 상세 시안 B는 개인화를 빼고 판단 정보와 단지 비교를 밀도 있게 제공한다", () => {
    render(<PrototypeShowcase view="notice-detail" />);
    const variantB = screen.getByRole("article", { name: "시안 B" });
    const detail = within(variantB).getByRole("complementary", {
      name: `${SHOWCASE_NOTICE.title} 공고 상세 시안 B`,
    });

    expect(within(detail).getAllByText(SHOWCASE_NOTICE.title)).not.toHaveLength(0);
    expect(within(detail).getAllByText(SHOWCASE_NOTICE.rentalType)).not.toHaveLength(0);
    expect(within(detail).getByText("공고 핵심 정보")).toBeInTheDocument();
    expect(within(detail).getByText("접수기간")).toBeInTheDocument();
    expect(within(detail).getByText("접수 마감")).toBeInTheDocument();
    expect(within(detail).getByText("공급 규모")).toBeInTheDocument();
    expect(within(detail).getByText("신청 대상")).toBeInTheDocument();
    for (const audience of SHOWCASE_NOTICE.details.audiences) {
      expect(within(detail).getByText(audience)).toBeInTheDocument();
    }
    expect(within(detail).queryByText(/내 정보 기준/)).not.toBeInTheDocument();
    expect(within(detail).queryByText(/신청 가능성이 높아요/)).not.toBeInTheDocument();
    expect(within(detail).queryByRole("heading", { name: "공급 요약" }))
      .not.toBeInTheDocument();
    expect(within(detail).queryByText(/경쟁률 예측/)).not.toBeInTheDocument();
    expect(within(detail).getByText(SHOWCASE_NOTICE.details.documentName)).toBeInTheDocument();
    expect(within(detail).getByText(/PDF 링크 확인 중.*원문 링크 확인 중/))
      .toBeInTheDocument();

    for (const complex of SHOWCASE_NOTICE.details.supplyComplexes) {
      const card = within(detail).getByRole("article", {
        name: `${complex.name} 단지 비교`,
      });
      expect(within(card).getByText(complex.name)).toBeInTheDocument();
      expect(within(card).getByText(complex.address)).toBeInTheDocument();
      expect(within(card).getByText(`${complex.totalHouseholds.toLocaleString("ko-KR")}세대`))
        .toBeInTheDocument();
      expect(within(card).getByText("전용면적")).toBeInTheDocument();
      expect(within(card).getByText("보증금")).toBeInTheDocument();
      expect(within(card).getByText("월 임대료")).toBeInTheDocument();
    }
    expect(within(detail).queryByRole("img", { name: /주택형 2D 평면도/ }))
      .not.toBeInTheDocument();
  });

  it("공고 상세 시안 B에서 저장, 단지 전환과 평면도 모달을 조작한다", () => {
    render(<PrototypeShowcase view="notice-detail" />);
    const variantB = screen.getByRole("article", { name: "시안 B" });
    const detail = within(variantB).getByRole("complementary", {
      name: /공고 상세 시안 B/,
    });
    const save = within(detail).getByRole("button", { name: "공고 저장" });

    expect(save).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(save);
    expect(within(detail).getByRole("button", { name: "공고 저장 해제" }))
      .toHaveAttribute("aria-pressed", "true");

    const [firstComplex, secondComplex] = SHOWCASE_NOTICE.details.supplyComplexes;
    expect(firstComplex).toBeDefined();
    expect(secondComplex).toBeDefined();
    const complexTabs = within(detail).getByRole("tablist", {
      name: "주택형을 볼 단지 선택",
    });
    const secondTab = within(complexTabs).getByRole("tab", {
      name: new RegExp(secondComplex!.name),
    });
    fireEvent.click(secondTab);
    expect(secondTab).toHaveAttribute("aria-selected", "true");

    const housingType = secondComplex!.housingTypes[0];
    const housingTypeCard = within(detail).getByRole("article", {
      name: `${secondComplex!.name} ${housingType.code} 주택형`,
    });
    for (const label of ["공급 구분", "전용면적", secondComplex!.unitLabel, "보증금", "월세"]) {
      expect(within(housingTypeCard).getByText(label)).toBeInTheDocument();
    }
    const floorPlan = within(detail).getByRole("button", {
      name: `${secondComplex!.name} ${housingType.code} 평면도 보기`,
    });
    fireEvent.click(floorPlan);
    const dialog = screen.getByRole("dialog", {
      name: `${housingType.code} 평면도`,
    });
    expect(within(dialog).getByText("3D 평면도 정보 없음")).toBeInTheDocument();
    expect(within(dialog).queryByText("3D 평면도 준비 중")).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "평면도 닫기" }));
    expect(screen.queryByRole("dialog", { name: `${housingType.code} 평면도` }))
      .not.toBeInTheDocument();

    fireEvent.click(floorPlan);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: `${housingType.code} 평면도` }))
      .not.toBeInTheDocument();
    fireEvent.keyDown(secondTab, { key: "ArrowLeft" });
    expect(within(complexTabs).getByRole("tab", { name: new RegExp(firstComplex!.name) }))
      .toHaveAttribute("aria-selected", "true");

    expect(within(detail).getByRole("button", { name: "PDF 보기" })).toBeInTheDocument();
    expect(within(detail).getByRole("button", { name: "공고문 링크" })).toBeInTheDocument();
  });

  it("공고 상세 시안 B는 공급 세대, 모집 호수와 모집 예비자 단위를 섞지 않는다", () => {
    const notice = HOUSING_NOTICES.find((item) => item.unitLabel === "모집 예비자");
    if (!notice) throw new Error("모집 예비자 공고 예시가 필요합니다.");
    const suppliedUnits = notice.details.supplyComplexes.reduce((total, complex) => {
      return total + complex.suppliedHouseholds;
    }, 0);
    render(
      <HousingNoticeDetailPanelB
        notice={notice}
        embedded
        saved={false}
        onClose={() => undefined}
        onToggleSave={() => undefined}
        onOpenPdf={() => undefined}
        onOpenSource={() => undefined}
        onOpenComplex={() => undefined}
      />,
    );
    const detail = screen.getByRole("complementary", {
      name: `${notice.title} 공고 상세 시안 B`,
    });

    expect(within(detail).getAllByText("모집 예비자")).not.toHaveLength(0);
    expect(within(detail).getAllByText(`${suppliedUnits.toLocaleString("ko-KR")}명`))
      .not.toHaveLength(0);
    expect(within(detail).queryByText(`${suppliedUnits.toLocaleString("ko-KR")}호`))
      .not.toBeInTheDocument();
    expect(within(detail).getByText("조회 정보 확인 중")).toBeInTheDocument();
    expect(within(detail).getByText(notice.details.moveInNote)).toBeInTheDocument();
    expect(within(detail).getByRole("button", { name: "PDF 보기" })).toBeDisabled();
    expect(within(detail).getByRole("button", { name: "공고문 링크" })).toBeDisabled();
  });

  it("단지 카드 페이지의 A 시안에 현재 단지 카드를 배치한다", () => {
    render(<PrototypeShowcase view="complex-card" />);

    const comparison = screen.getByRole("region", {
      name: "단지 목록 카드 UI A, B, C 비교",
    });
    expect(
      within(comparison).getByRole("article", {
        name: new RegExp(HOUSING_LISTINGS[0].title),
      }),
    ).toBeInTheDocument();
    expect(within(comparison).getAllByText("빈 자리")).toHaveLength(2);
  });

  it("단지 목록 페이지의 A 시안에 검색과 단지 카드 목록을 배치한다", () => {
    render(<PrototypeShowcase view="complex-list" />);

    const list = screen.getByRole("region", { name: "현재 단지 목록 시안" });
    const listScroll = within(list).getByRole("region", { name: "단지 카드 스크롤" });
    expect(within(list).getByRole("tab", { name: "단지 목록" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(within(list).getByRole("searchbox", { name: "단지 검색 시안" })).toBeInTheDocument();
    expect(listScroll).toHaveAttribute("tabindex", "0");
    expect(within(listScroll).getAllByRole("article")).toHaveLength(3);
  });

  it("단지 상세 페이지의 A 시안에 현재 상세 패널을 고정 배치한다", () => {
    render(<PrototypeShowcase view="complex-detail" />);

    const detail = screen.getByRole("complementary", { name: /단지 상세 정보/ });
    expect(detail).toHaveClass("is-showcase");
    expect(within(detail).getByRole("region", { name: /단지 상세 내용/ }))
      .toHaveAttribute("tabindex", "0");
    expect(within(detail).queryByRole("button", { name: "단지 상세 닫기" }))
      .not.toBeInTheDocument();
    expect(within(detail).getByRole("heading", { name: "단지 기본 정보" }))
      .toBeInTheDocument();
  });

  it("지도 마커 페이지의 A 시안에 상태별 마커와 클러스터를 배치한다", () => {
    render(<PrototypeShowcase view="map-marker" />);

    const markers = screen.getByRole("region", { name: "현재 지도 마커 시안" });
    expect(within(markers).getByRole("img", { name: /접수중 지도 마커/ })).toBeInTheDocument();
    expect(within(markers).getByRole("img", { name: /모집예정 지도 마커/ })).toBeInTheDocument();
    expect(within(markers).getByRole("img", { name: /상시모집 지도 마커/ })).toBeInTheDocument();
    expect(within(markers).getByRole("img", { name: /접수마감 지도 마커/ })).toBeInTheDocument();
    expect(within(markers).getByRole("img", { name: /선택된 지도 마커/ })).toBeInTheDocument();
    expect(within(markers).getByRole("img", { name: "성남시 공공임대 16곳 묶음" }))
      .toBeInTheDocument();
  });

  it("상단 바 페이지의 A 시안에 현재 헤더 동작을 배치한다", () => {
    render(<PrototypeShowcase view="top-bar" />);

    const topBar = screen.getByRole("region", { name: "현재 상단 바 시안" });
    expect(topBar).toHaveAttribute("tabindex", "0");
    expect(within(topBar).getByRole("link", { name: "두꺼비집 홈" })).toBeInTheDocument();
    expect(
      within(topBar).getByRole("button", {
        name: "지도 전체 시안 보기, 현재 시안 A",
      }),
    ).toBeInTheDocument();
    expect(within(topBar).getByRole("link", { name: "요소 UI 비교" })).toBeInTheDocument();
    expect(within(topBar).getByRole("button", { name: "저장한 집" })).toBeInTheDocument();
  });
});
