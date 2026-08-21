import { fireEvent, render, screen, within } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatMoney,
  HOUSING_LISTINGS,
  type MapViewport,
} from "../app/housing-data";
import {
  formatNoticeDate,
  HOUSING_NOTICES,
  noticeDeadlineLabel,
  noticeStatusLabel,
  type HousingNotice,
} from "../app/housing-notice-data";

const INITIAL_VIEWPORT: MapViewport = {
  north: 37.6,
  south: 37.3,
  east: 127.3,
  west: 127.0,
  zoom: 13,
};

const MOVED_VIEWPORT: MapViewport = {
  north: 37.49,
  south: 37.43,
  east: 127.18,
  west: 127.11,
  zoom: 14,
};

vi.mock("../app/HousingMap", () => ({
  HousingMap: (props: {
    onSelect: (id: string) => void;
    onViewportChange: (viewport: MapViewport) => void;
    onTileError: () => void;
    onLocationError: () => void;
  }) => {
    const { onViewportChange } = props;
    const initialized = useRef(false);
    useEffect(() => {
      if (initialized.current) return;
      initialized.current = true;
      onViewportChange(INITIAL_VIEWPORT);
    }, [onViewportChange]);
    return (
      <div data-testid="map-mock">
        <button type="button" onClick={() => props.onSelect(HOUSING_LISTINGS[0].id)}>
          예시 지도 핀
        </button>
        <button type="button" onClick={() => props.onViewportChange(MOVED_VIEWPORT)}>
          지도 이동
        </button>
        <button type="button" onClick={props.onTileError}>타일 오류</button>
        <button type="button" onClick={props.onLocationError}>위치 오류</button>
      </div>
    );
  },
}));

import { HousingExplorer } from "../app/HousingExplorer";

function noticeTitlePattern(notice: HousingNotice) {
  const escapedTitle = notice.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escapedTitle);
}

function noticeCard(notice: HousingNotice) {
  const noticePanel = screen.getByRole("tabpanel", { name: "공고 목록" });
  return within(noticePanel).getByRole("article", {
    name: noticeTitlePattern(notice),
  });
}

function openNoticeDetail(notice: HousingNotice) {
  fireEvent.click(screen.getByRole("tab", { name: "공고 목록" }));
  const card = noticeCard(notice);
  fireEvent.click(card);
  const panel = screen.getByRole("complementary", {
    name: `${notice.title} 공고 상세 정보`,
  });
  return { card, panel, detailView: within(panel) };
}

describe("HousingExplorer", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("지도 핀을 선택하면 대응 카드와 단지 상세 정보를 함께 보여준다", () => {
    render(<HousingExplorer />);

    fireEvent.click(screen.getByRole("button", { name: "예시 지도 핀" }));

    const card = screen.getByRole("article", { name: /위례 새솔 청년 행복주택/ });
    expect(card).toHaveClass("is-selected");
    expect(
      screen.getByRole("complementary", {
        name: `${HOUSING_LISTINGS[0].title} 단지 상세 정보`,
      }),
    ).toBeInTheDocument();
  });

  it("단지 카드가 선택한 와이어프레임의 핵심 속성을 구분해 보여준다", () => {
    render(<HousingExplorer />);
    const listing = HOUSING_LISTINGS[0];
    const card = screen.getByRole("article", { name: new RegExp(listing.title) });
    const cardView = within(card);

    expect(cardView.getByRole("img", { name: `${listing.title} 단지 이미지` })).toBeInTheDocument();
    expect(cardView.getByText("접수중")).toBeInTheDocument();
    expect(cardView.getByText(`D-${listing.daysLeft}`)).toBeInTheDocument();
    expect(cardView.getByText(`${listing.regionLabel} ${listing.district}`)).toBeInTheDocument();
    expect(cardView.getByText(listing.provider)).toBeInTheDocument();
    expect(cardView.getByText(listing.rentalType)).toBeInTheDocument();
    expect(cardView.getByText(`전용 ${listing.areaSquareMeters}㎡`)).toBeInTheDocument();
    expect(cardView.getByText(`준공 ${listing.completedAt}`)).toBeInTheDocument();
    expect(cardView.getByText(formatMoney(listing.depositWon))).toBeInTheDocument();
    expect(cardView.getByText(formatMoney(listing.monthlyRentWon))).toBeInTheDocument();
  });

  it("선택한 단지 상세에는 합의한 속성만 표시하고 닫을 수 있다", () => {
    render(<HousingExplorer />);
    const listing = HOUSING_LISTINGS[0];
    const details = listing.complexDetails;
    const card = screen.getByRole("article", { name: new RegExp(listing.title) });

    fireEvent.click(card);

    const panel = screen.getByRole("complementary", {
      name: `${listing.title} 단지 상세 정보`,
    });
    const detailView = within(panel);
    expect(detailView.getByRole("img", { name: `${listing.title} 단지사진` })).toBeInTheDocument();
    expect(detailView.getByRole("img", { name: `${listing.title} 단지 조감도` })).toBeInTheDocument();
    expect(detailView.getByText("단지명")).toBeInTheDocument();
    expect(detailView.getByText("공급기관")).toBeInTheDocument();
    expect(detailView.getByText("상세주소")).toBeInTheDocument();
    expect(detailView.getByText("임대종류")).toBeInTheDocument();
    expect(detailView.getByText("준공일자")).toBeInTheDocument();
    expect(detailView.getByText("건물형태")).toBeInTheDocument();
    expect(detailView.getByText("엘리베이터")).toBeInTheDocument();
    expect(detailView.getByText("난방종류")).toBeInTheDocument();
    expect(detailView.getAllByText("공급 면적")).not.toHaveLength(0);
    expect(detailView.getByText("복도유형")).toBeInTheDocument();
    expect(detailView.getByText("1년 퇴거자 수")).toBeInTheDocument();
    expect(detailView.getByText("총세대수")).toBeInTheDocument();
    expect(detailView.getByText("총주차대수(세대당)")).toBeInTheDocument();
    const parkingPerHousehold = (
      details.totalParkingSpaces / details.totalHouseholds
    ).toLocaleString("ko-KR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    expect(
      detailView.getByText(
        `${details.totalParkingSpaces.toLocaleString("ko-KR")}대 (${parkingPerHousehold}대)`,
      ),
    ).toBeInTheDocument();
    expect(detailView.getAllByText(listing.title)).not.toHaveLength(0);
    expect(detailView.getAllByText(listing.provider)).not.toHaveLength(0);
    expect(detailView.getAllByText(listing.rentalType)).not.toHaveLength(0);
    expect(detailView.getAllByText(details.address)).not.toHaveLength(0);
    expect(detailView.getByText("편의점")).toBeInTheDocument();
    expect(detailView.getByText("세탁소")).toBeInTheDocument();
    expect(detailView.getByText("버스정류장")).toBeInTheDocument();
    expect(detailView.getByText("지하철역")).toBeInTheDocument();
    expect(detailView.getByText("대형마트")).toBeInTheDocument();
    expect(detailView.getByText(details.transitRoute.destination)).toBeInTheDocument();
    expect(detailView.getByText("학생수")).toBeInTheDocument();
    expect(detailView.getByText("교육비")).toBeInTheDocument();
    expect(detailView.getByText("방과후 프로그램 수")).toBeInTheDocument();
    expect(detailView.getByText("교사 수")).toBeInTheDocument();
    expect(detailView.getByRole("heading", { name: "모집 요약 정보" })).toBeInTheDocument();
    expect(detailView.queryByText("공고상태")).not.toBeInTheDocument();
    expect(detailView.queryByText("접수마감 디데이")).not.toBeInTheDocument();
    expect(detailView.getByText("접수중")).toBeInTheDocument();
    expect(detailView.getByText("접수 마감까지")).toBeInTheDocument();
    expect(
      detailView.getByLabelText(`접수 마감까지 ${listing.daysLeft}일`),
    ).toHaveTextContent(`D-${listing.daysLeft}`);
    expect(detailView.getByText("공고 대상")).toBeInTheDocument();
    expect(detailView.getByText("접수 기간")).toBeInTheDocument();
    expect(detailView.getByText("가장 최근 경쟁률")).toBeInTheDocument();
    expect(detailView.getByRole("heading", { name: "주택형 정보" })).toBeInTheDocument();
    expect(detailView.getByRole("img", { name: "55B 평면도" })).toBeInTheDocument();
    expect(detailView.getByText("선택 주택형 상세")).toBeInTheDocument();
    expect(detailView.getByRole("heading", { name: "과거 모집 공고" })).toBeInTheDocument();
    expect(detailView.getAllByText("마감")).toHaveLength(details.pastNotices.length);

    const selectedTab = detailView.getByRole("tab", { name: "55B" });
    expect(selectedTab).toHaveAttribute("aria-selected", "true");
    fireEvent.click(detailView.getByRole("tab", { name: "45A" }));
    expect(detailView.getByRole("tab", { name: "45A" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(detailView.getByRole("img", { name: "45A 평면도" })).toBeInTheDocument();
    expect(detailView.getByRole("tabpanel", { name: "45A 주택형 상세" })).toBeInTheDocument();

    fireEvent.click(detailView.getByRole("button", { name: "공고상세 페이지 바로가기" }));
    expect(
      screen.getByText("프로토타입에서는 원문 공고 연결을 준비 중이에요."),
    ).toBeInTheDocument();

    for (const removedLabel of [
      "공유",
      "관심 단지",
    ]) {
      expect(detailView.queryByText(removedLabel)).not.toBeInTheDocument();
    }

    fireEvent.click(detailView.getByRole("button", { name: "단지 상세 닫기" }));
    expect(
      screen.queryByRole("complementary", {
        name: `${listing.title} 단지 상세 정보`,
      }),
    ).not.toBeInTheDocument();
    expect(card).not.toHaveClass("is-selected");
  });

  it("공통 목록 헤더에서 단지 목록과 공고 목록을 전환한다", () => {
    render(<HousingExplorer />);
    const resultsPanel = screen.getByRole("region", { name: "공공임대 검색 결과" });
    const tabs = screen.getByRole("tablist", { name: "목록 종류" });
    const complexTab = within(tabs).getByRole("tab", { name: "단지 목록" });
    const noticeTab = within(tabs).getByRole("tab", { name: "공고 목록" });

    expect(complexTab).toHaveAttribute("aria-selected", "true");
    expect(within(resultsPanel).getByRole("heading", { name: "단지 목록" })).toBeInTheDocument();
    expect(
      within(resultsPanel).getByRole("searchbox", { name: "단지 검색" }),
    ).toBeInTheDocument();
    expect(
      within(resultsPanel).getByRole("group", { name: "적용 중인 입주 조건" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("article", { name: /위례 새솔 청년 행복주택/ }));
    expect(screen.getByRole("complementary", { name: /단지 상세 정보/ })).toBeInTheDocument();

    fireEvent.click(noticeTab);

    expect(noticeTab).toHaveAttribute("aria-selected", "true");
    expect(within(resultsPanel).getByRole("heading", { name: "공고 목록" })).toBeInTheDocument();
    expect(
      within(resultsPanel).getByRole("searchbox", { name: "공고 검색" }),
    ).toBeInTheDocument();
    expect(
      within(resultsPanel).getByRole("group", { name: "적용 중인 입주 조건" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: /단지 상세 정보/ })).not.toBeInTheDocument();

    const noticePanel = screen.getByRole("tabpanel", { name: "공고 목록" });
    expect(within(noticePanel).getAllByRole("article")).toHaveLength(HOUSING_NOTICES.length);

    const notice = HOUSING_NOTICES[0];
    const noticeCard = within(noticePanel).getByRole("article", {
      name: new RegExp(notice.title),
    });
    const noticeView = within(noticeCard);
    expect(noticeView.getByText(notice.rentalType)).toBeInTheDocument();
    expect(noticeView.getByText(notice.title)).toBeInTheDocument();
    expect(noticeView.getByText(notice.region)).toBeInTheDocument();
    expect(noticeView.getByText(notice.provider)).toBeInTheDocument();
    expect(noticeView.getByText("예비입주자")).toBeInTheDocument();
    expect(noticeView.getByText(noticeStatusLabel(notice.status))).toBeInTheDocument();
    expect(noticeView.getByText(formatNoticeDate(notice.applyStart))).toBeInTheDocument();
    expect(noticeView.getByText(formatNoticeDate(notice.applyEnd))).toBeInTheDocument();
    expect(noticeView.getByText(`${notice.units.toLocaleString("ko-KR")}호`)).toBeInTheDocument();
    expect(noticeView.getByText(notice.viewCount.toLocaleString("ko-KR"))).toBeInTheDocument();
    expect(
      noticeView.getByLabelText(`접수 마감까지 ${notice.daysLeft}일`),
    ).toHaveTextContent(noticeDeadlineLabel(notice));

    const correctedNotice = HOUSING_NOTICES.find((item) => item.revision === "corrected");
    expect(correctedNotice).toBeDefined();
    const correctedCard = within(noticePanel).getByRole("article", {
      name: new RegExp(correctedNotice?.title ?? ""),
    });
    expect(within(correctedCard).getByText("정정공고중")).toBeInTheDocument();
    expect(within(correctedCard).getByText("접수 마감")).toBeInTheDocument();
    expect(within(correctedCard).queryByText("접수 시작")).not.toBeInTheDocument();

    fireEvent.click(noticeCard);
    expect(
      screen.getByRole("complementary", {
        name: `${notice.title} 공고 상세 정보`,
      }),
    ).toBeInTheDocument();

    fireEvent.click(complexTab);
    expect(complexTab).toHaveAttribute("aria-selected", "true");
    expect(
      screen.queryByRole("complementary", {
        name: `${notice.title} 공고 상세 정보`,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: /위례 새솔 청년 행복주택/ })).toBeInTheDocument();
  });

  it("단지와 공고 검색어를 서로 덮어쓰지 않고 목록별로 유지한다", () => {
    render(<HousingExplorer />);
    const resultsPanel = screen.getByRole("region", { name: "공공임대 검색 결과" });
    const tabs = within(resultsPanel).getByRole("tablist", { name: "목록 종류" });
    const complexTab = within(tabs).getByRole("tab", { name: "단지 목록" });
    const noticeTab = within(tabs).getByRole("tab", { name: "공고 목록" });
    const complexSearch = within(resultsPanel).getByRole("searchbox", {
      name: "단지 검색",
    });

    fireEvent.change(complexSearch, { target: { value: "위례" } });
    expect(complexSearch).toHaveValue("위례");

    fireEvent.click(noticeTab);
    const noticeSearch = within(resultsPanel).getByRole("searchbox", {
      name: "공고 검색",
    });
    const includedComplexName = HOUSING_NOTICES[0].details.supplyComplexes[1]?.name
      ?? HOUSING_NOTICES[0].title;
    expect(noticeSearch).toHaveValue("");
    fireEvent.change(noticeSearch, { target: { value: includedComplexName } });
    expect(noticeSearch).toHaveValue(includedComplexName);
    expect(
      within(screen.getByRole("tabpanel", { name: "공고 목록" })).getAllByRole("article"),
    ).toHaveLength(1);

    fireEvent.click(complexTab);
    expect(
      within(resultsPanel).getByRole("searchbox", { name: "단지 검색" }),
    ).toHaveValue("위례");

    fireEvent.click(noticeTab);
    expect(
      within(resultsPanel).getByRole("searchbox", { name: "공고 검색" }),
    ).toHaveValue(includedComplexName);
  });

  it("공고 카드를 선택하면 확정한 상세 속성을 한 패널에 보여준다", () => {
    render(<HousingExplorer />);
    const notice = HOUSING_NOTICES.find((item) => item.revision === "corrected");
    if (!notice) throw new Error("정정공고 예시 데이터가 필요합니다.");

    const { card, detailView } = openNoticeDetail(notice);
    const supplyHouseholds = notice.details.supplyComplexes.reduce((total, complex) => {
      return total + complex.suppliedHouseholds;
    }, 0);

    expect(card).toHaveClass("is-selected");
    expect(card).toHaveAttribute("aria-current", "true");
    expect(detailView.getAllByText(notice.rentalType)).not.toHaveLength(0);
    expect(detailView.getAllByText(notice.title)).not.toHaveLength(0);
    expect(detailView.getAllByText(notice.region)).not.toHaveLength(0);
    expect(detailView.getAllByText(notice.details.address)).not.toHaveLength(0);
    expect(detailView.getAllByText(notice.provider)).not.toHaveLength(0);
    expect(detailView.getByText(noticeStatusLabel(notice.status))).toBeInTheDocument();
    expect(detailView.getByText("정정공고중")).toBeInTheDocument();
    expect(detailView.getByText(`${notice.viewCount.toLocaleString("ko-KR")}회`)).toBeInTheDocument();
    expect(detailView.getAllByText(formatNoticeDate(notice.publishedAt))).not.toHaveLength(0);
    expect(
      detailView.getAllByText(
        `${formatNoticeDate(notice.applyStart)} – ${formatNoticeDate(notice.applyEnd)}`,
      ),
    ).not.toHaveLength(0);
    expect(
      detailView.getByLabelText(
        `접수 마감까지 ${notice.daysLeft}일`,
      ),
    ).toHaveTextContent(noticeDeadlineLabel(notice));
    expect(
      detailView.getByText(formatNoticeDate(notice.applyEnd), { selector: "time" }),
    ).toHaveAttribute("dateTime", notice.applyEnd);

    expect(detailView.getByRole("heading", { name: "공고 대상" })).toBeInTheDocument();
    for (const audience of notice.details.audiences) {
      expect(detailView.getAllByText(audience)).not.toHaveLength(0);
    }
    expect(detailView.getByRole("heading", { name: "내 조건으로 본 신청자격" })).toBeInTheDocument();
    expect(detailView.getByText("청년 · 1인 · 무주택 기준의 간편 비교입니다.")).toBeInTheDocument();
    expect(detailView.getByText(/최종 신청자격은 반드시 공고문에서 확인/)).toBeInTheDocument();

    expect(detailView.getByRole("heading", { name: "상세 공급 일정" })).toBeInTheDocument();
    expect(detailView.getByText(`입주 예정월 ${notice.details.moveInMonth.replace("-", ".")}`)).toBeInTheDocument();
    expect(
      detailView.getByRole("listitem", {
        name: `${formatNoticeDate(notice.publishedAt)} | 공고 게시`,
      }),
    ).toHaveTextContent(`${formatNoticeDate(notice.publishedAt)}|공고 게시`);
    for (const step of notice.details.schedule) {
      expect(detailView.getAllByText(step.label)).not.toHaveLength(0);
    }

    expect(detailView.getByText("공급 단지수")).toBeInTheDocument();
    expect(detailView.getByText(`${notice.details.supplyComplexes.length}곳`)).toBeInTheDocument();
    expect(detailView.getByText("공급 세대수")).toBeInTheDocument();
    expect(
      detailView.getAllByText(`${supplyHouseholds.toLocaleString("ko-KR")}호`),
    ).not.toHaveLength(0);
    expect(detailView.queryByText("두꺼비집 경쟁률 예측")).not.toBeInTheDocument();
    expect(detailView.queryByText(/프로토타입 예측값/)).not.toBeInTheDocument();

    for (const complex of notice.details.supplyComplexes) {
      const summary = detailView.getByRole("article", {
        name: `${complex.name} 공고 공급 요약`,
      });
      expect(within(summary).getByRole("img", { name: `${complex.name} 조감도` })).toBeInTheDocument();
      expect(within(summary).getByText(complex.name)).toBeInTheDocument();
      expect(within(summary).getByText(complex.address)).toBeInTheDocument();
      expect(
        within(summary).getByText(`${complex.totalHouseholds.toLocaleString("ko-KR")}세대`),
      ).toBeInTheDocument();
      expect(
        within(summary).getByText(`${complex.suppliedHouseholds.toLocaleString("ko-KR")}호`),
      ).toBeInTheDocument();
    }
    expect(detailView.getByText(notice.details.documentName)).toBeInTheDocument();
    expect(detailView.queryByText("내가 준비할 금액")).not.toBeInTheDocument();
  });

  it("공고 카드의 키보드 선택과 북마크 전파 차단 및 닫기를 지원한다", () => {
    render(<HousingExplorer />);
    const notice = HOUSING_NOTICES[0];
    fireEvent.click(screen.getByRole("tab", { name: "공고 목록" }));
    const card = noticeCard(notice);
    const save = within(card).getByRole("button", { name: `${notice.title} 공고 저장` });

    fireEvent.click(save);
    expect(
      screen.queryByRole("complementary", { name: `${notice.title} 공고 상세 정보` }),
    ).not.toBeInTheDocument();
    fireEvent.keyDown(save, { key: "Enter" });
    expect(
      screen.queryByRole("complementary", { name: `${notice.title} 공고 상세 정보` }),
    ).not.toBeInTheDocument();

    fireEvent.keyDown(card, { key: "Enter" });
    let panel = screen.getByRole("complementary", {
      name: `${notice.title} 공고 상세 정보`,
    });
    fireEvent.click(within(panel).getByRole("button", { name: "공고 상세 닫기" }));
    expect(
      screen.queryByRole("complementary", { name: `${notice.title} 공고 상세 정보` }),
    ).not.toBeInTheDocument();
    expect(card).not.toHaveClass("is-selected");

    fireEvent.keyDown(card, { key: " " });
    panel = screen.getByRole("complementary", {
      name: `${notice.title} 공고 상세 정보`,
    });
    expect(panel).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(
      screen.queryByRole("complementary", { name: `${notice.title} 공고 상세 정보` }),
    ).not.toBeInTheDocument();
  });

  it("공급 구분 표와 주택형 탭을 바꾸고 공고문 CTA를 제공한다", () => {
    render(<HousingExplorer />);
    const notice = HOUSING_NOTICES[0];
    const { detailView } = openNoticeDetail(notice);
    const selectedComplex = notice.details.supplyComplexes[0];
    const housingEntries = selectedComplex.housingTypes;
    const firstHousingType = housingEntries[0];
    const nextHousingType = housingEntries[1];

    const table = detailView.getByRole("table", {
      name: `${selectedComplex.name} 공급대상 주택형 표`,
    });
    expect(within(table).getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      "구분",
      "주택형",
      "전용",
      "금회",
    ]);
    expect(within(table).getAllByRole("row")).toHaveLength(housingEntries.length + 1);

    const housingTabs = detailView.getByRole("tablist", {
      name: `${selectedComplex.name} 공고 주택형 선택`,
    });
    expect(within(housingTabs).getByRole("tab", { name: firstHousingType.code })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(within(housingTabs).getByRole("tab", { name: nextHousingType.code }));
    const selectedHousingPanel = detailView.getByRole("tabpanel", {
      name: `${selectedComplex.name} ${nextHousingType.code} 공고 주택형 상세`,
    });
    expect(within(selectedHousingPanel).getByRole("img", {
      name: `${nextHousingType.code} 평면도`,
    })).toBeInTheDocument();
    expect(within(selectedHousingPanel).getByText(`${nextHousingType.units}호`)).toBeInTheDocument();
    expect(
      within(selectedHousingPanel).getByText(`${nextHousingType.exclusiveAreaSquareMeters}㎡`),
    ).toBeInTheDocument();
    expect(
      within(selectedHousingPanel).getByText(`${nextHousingType.depositWon.toLocaleString("ko-KR")}원`),
    ).toBeInTheDocument();
    expect(
      within(selectedHousingPanel).getByText(
        `월 ${nextHousingType.monthlyRentWon.toLocaleString("ko-KR")}원`,
      ),
    ).toBeInTheDocument();
    expect(
      within(selectedHousingPanel).getByRole("tab", { name: "3D 평면도 준비 중" }),
    ).toBeDisabled();

    const supplyTabs = detailView.getByRole("tablist", { name: "공급 구분 선택" });
    fireEvent.click(within(supplyTabs).getByRole("tab", { name: "재공급" }));
    const resupplyEntries = housingEntries.filter((housingType) => {
      return housingType.supplyKind === "resupply";
    });
    expect(within(table).getAllByRole("row")).toHaveLength(resupplyEntries.length + 1);
    expect(within(table).getAllByText("재공급")).toHaveLength(resupplyEntries.length);

    fireEvent.click(detailView.getByRole("button", { name: "PDF 보기" }));
    expect(screen.getByText("프로토타입 공고문 PDF 연결을 준비 중이에요.")).toBeInTheDocument();
    fireEvent.click(detailView.getByRole("button", { name: "공고문 링크" }));
    expect(screen.getByText("프로토타입 공고 원문 링크 연결을 준비 중이에요.")).toBeInTheDocument();
  });

  it("다중 단지 공고에서 단지별 요약과 선택한 단지의 주택형만 연결한다", () => {
    render(<HousingExplorer />);
    const notice = HOUSING_NOTICES.find((item) => {
      return item.details.supplyComplexes.length > 1;
    });
    if (!notice) throw new Error("다중 단지 공고 예시 데이터가 필요합니다.");
    const [firstComplex, secondComplex] = notice.details.supplyComplexes;
    const { detailView } = openNoticeDetail(notice);

    expect(
      detailView.getByRole("heading", { name: "공급 단지별 공고 요약" }),
    ).toBeInTheDocument();
    for (const complex of notice.details.supplyComplexes) {
      expect(
        detailView.getByRole("article", { name: `${complex.name} 공고 공급 요약` }),
      ).toBeInTheDocument();
    }

    const firstSelect = detailView.getByRole("button", {
      name: `${firstComplex.name} 주택형 보기`,
    });
    const secondSelect = detailView.getByRole("button", {
      name: `${secondComplex.name} 주택형 보기`,
    });
    expect(firstSelect).toHaveAttribute("aria-pressed", "true");
    expect(secondSelect).toHaveAttribute("aria-pressed", "false");
    expect(
      within(
        detailView.getByRole("table", {
          name: `${firstComplex.name} 공급대상 주택형 표`,
        }),
      ).getAllByRole("row"),
    ).toHaveLength(firstComplex.housingTypes.length + 1);

    fireEvent.click(secondSelect);

    expect(firstSelect).toHaveAttribute("aria-pressed", "false");
    expect(secondSelect).toHaveAttribute("aria-pressed", "true");
    const secondTable = detailView.getByRole("table", {
      name: `${secondComplex.name} 공급대상 주택형 표`,
    });
    expect(within(secondTable).getAllByRole("row")).toHaveLength(
      secondComplex.housingTypes.length + 1,
    );
    expect(
      within(
        detailView.getByRole("tablist", {
          name: `${secondComplex.name} 공고 주택형 선택`,
        }),
      ).getAllByRole("tab"),
    ).toHaveLength(secondComplex.housingTypes.length);
  });

  it("공고 북마크를 단지 저장과 분리해 보관한다", () => {
    render(<HousingExplorer />);
    fireEvent.click(screen.getByRole("tab", { name: "공고 목록" }));

    const notice = HOUSING_NOTICES[0];
    const save = screen.getByRole("button", { name: `${notice.title} 공고 저장` });
    expect(save).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(save);

    expect(
      screen.getByRole("button", { name: `${notice.title} 공고 저장 해제` }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("관심 공고에 저장했어요.")).toBeInTheDocument();
    expect(window.localStorage.getItem("toadzip:saved-notices")).toContain(notice.id);
    expect(window.localStorage.getItem("toadzip:saved-listings")).toBeNull();
  });

  it("검색 결과가 없을 때 필터 완화 안내와 초기화 행동을 제공한다", () => {
    render(<HousingExplorer />);
    const resultsPanel = screen.getByRole("region", { name: "공공임대 검색 결과" });
    const header = screen.getByRole("banner");
    const search = within(resultsPanel).getByRole("searchbox", { name: "단지 검색" });
    const visibleComplexCount = screen.getAllByRole("article").length;

    expect(within(header).queryByRole("searchbox")).not.toBeInTheDocument();
    expect(within(resultsPanel).getByRole("heading", { name: "단지 목록" })).toHaveClass(
      "sr-only",
    );
    expect(within(resultsPanel).queryByRole("button", { name: "추천순 정렬" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("status", {
        name: `현재 지도 영역 경기 성남시, 검색 결과 ${visibleComplexCount}건`,
      }),
    ).toHaveTextContent(`경기 성남시|${visibleComplexCount}건`);
    expect(screen.queryByText("프로토타입 예시 데이터")).not.toBeInTheDocument();
    expect(screen.queryByText("성남 · 위례권")).not.toBeInTheDocument();
    expect(screen.queryByText(/신청 가능성이 높은 공고/)).not.toBeInTheDocument();
    const profileStrip = within(resultsPanel).getByRole("group", {
      name: "적용 중인 입주 조건",
    });
    expect(within(profileStrip).getByText("청년 · 1인 · 무주택 기준")).toBeInTheDocument();
    expect(within(profileStrip).getByRole("button", { name: "조건 수정" })).toBeInTheDocument();

    fireEvent.change(search, {
      target: { value: "없는 공고 이름" },
    });

    expect(screen.getByText("조건에 맞는 집을 찾지 못했어요")).toBeInTheDocument();
    expect(
      screen.getByRole("status", {
        name: "현재 지도 영역 경기 성남시, 검색 결과 0건",
      }),
    ).toHaveTextContent("경기 성남시|0건");
    fireEvent.click(screen.getByRole("button", { name: /필터 초기화/ }));
    expect(screen.queryByText("조건에 맞는 집을 찾지 못했어요")).not.toBeInTheDocument();
  });

  it("목록 검색 옆 필터 버튼에서 상세 필터를 열고 선택값을 유지한다", () => {
    render(<HousingExplorer />);
    const resultsPanel = screen.getByRole("region", { name: "공공임대 검색 결과" });
    const filterTrigger = within(resultsPanel).getByRole("button", {
      name: "검색 필터 열기",
    });

    expect(filterTrigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(filterTrigger);

    const filterSheet = screen.getByRole("dialog", { name: "검색 필터" });
    const rentalType = within(filterSheet).getByRole("combobox", { name: "임대 유형" });
    fireEvent.change(rentalType, { target: { value: "행복주택" } });
    expect(rentalType).toHaveValue("행복주택");
    fireEvent.click(within(filterSheet).getByRole("button", { name: /건 결과 보기/ }));

    expect(
      within(resultsPanel).getByRole("button", { name: /검색 필터 열기, 1개 적용 중/ }),
    ).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(
      within(resultsPanel).getByRole("button", { name: /검색 필터 열기, 1개 적용 중/ }),
    );
    expect(
      within(screen.getByRole("dialog", { name: "검색 필터" })).getByRole("combobox", {
        name: "임대 유형",
      }),
    ).toHaveValue("행복주택");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "검색 필터" })).not.toBeInTheDocument();
  });

  it("관심 주택을 기기 저장소에 저장하고 저장 목록만 볼 수 있다", () => {
    render(<HousingExplorer />);
    const card = screen.getByRole("article", { name: /위례 새솔 청년 행복주택/ });

    fireEvent.click(within(card).getByRole("button", { name: /저장$/ }));

    expect(window.localStorage.getItem("toadzip:saved-listings")).toContain(
      HOUSING_LISTINGS[0].id,
    );
    expect(
      screen.queryByRole("complementary", {
        name: `${HOUSING_LISTINGS[0].title} 단지 상세 정보`,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("관심 주택에 저장했어요.")).toBeInTheDocument();
  });

  it("모집중 매물에서 원문 공고 확인 행동을 제공한다", () => {
    render(<HousingExplorer />);
    const card = screen.getByRole("article", { name: /위례 새솔 청년 행복주택/ });

    fireEvent.click(within(card).getByRole("button", { name: "공고 확인" }));

    expect(
      screen.getByText("프로토타입에서는 원문 공고 연결을 준비 중이에요."),
    ).toBeInTheDocument();
  });

  it("헤더에서 와이어프레임 시안 A, B, C를 하나씩 선택한다", () => {
    render(<HousingExplorer />);
    const header = screen.getByRole("banner");
    const selector = within(header).getByRole("radiogroup", {
      name: "와이어프레임 시안",
    });
    const variantA = within(selector).getByRole("radio", { name: "시안 A" });
    const variantB = within(selector).getByRole("radio", { name: "시안 B" });
    const variantC = within(selector).getByRole("radio", { name: "시안 C" });

    expect(variantA).toBeChecked();
    expect(variantB).not.toBeChecked();
    expect(variantC).not.toBeChecked();
    expect(screen.getByRole("main")).toHaveAttribute("data-prototype-variant", "A");

    fireEvent.click(variantC);

    expect(variantA).not.toBeChecked();
    expect(variantC).toBeChecked();
    expect(screen.getByRole("main")).toHaveAttribute("data-prototype-variant", "C");
  });

  it("헤더의 중복 조건 버튼 없이 목록 상단에서 조건 설정 모달을 열고 적용한다", () => {
    render(<HousingExplorer />);
    const header = screen.getByRole("banner");
    const resultsPanel = screen.getByRole("region", { name: "공공임대 검색 결과" });
    const profileStrip = within(resultsPanel).getByRole("group", {
      name: "적용 중인 입주 조건",
    });

    expect(within(header).queryByRole("button", { name: /내 조건/ })).not.toBeInTheDocument();
    fireEvent.click(within(profileStrip).getByRole("button", { name: "조건 수정" }));
    let dialog = screen.getByRole("dialog", { name: "나에게 맞는 공공임대 찾기" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    fireEvent.click(within(dialog).getByRole("button", { name: "신혼부부" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "닫기" }));
    expect(within(profileStrip).getByText("청년 · 1인 · 무주택 기준")).toBeInTheDocument();

    fireEvent.click(within(profileStrip).getByRole("button", { name: "조건 수정" }));
    dialog = screen.getByRole("dialog", { name: "나에게 맞는 공공임대 찾기" });
    fireEvent.click(within(dialog).getByRole("button", { name: "신혼부부" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "이 조건에 맞는 집 보기" }));

    expect(screen.queryByRole("dialog", { name: "나에게 맞는 공공임대 찾기" })).not.toBeInTheDocument();
    expect(within(profileStrip).getByText("신혼부부 · 1인 · 무주택 기준")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /검색 필터 열기, 1개 적용 중/ }));
    expect(
      within(screen.getByRole("dialog", { name: "검색 필터" })).getByRole("button", {
        name: /내 조건 4개 이상 일치/,
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("지도 이동 뒤 명시적으로 현재 영역을 다시 검색한다", () => {
    render(<HousingExplorer />);

    fireEvent.click(screen.getByRole("button", { name: "지도 이동" }));
    const research = screen.getByRole("button", { name: /이 지역에서 다시 찾기/ });
    expect(research).toBeInTheDocument();
    fireEvent.click(research);

    expect(screen.queryByRole("button", { name: /이 지역에서 다시 찾기/ })).not.toBeInTheDocument();
    expect(screen.getByText("이 지도 영역의 매물로 새로 찾았어요.")).toBeInTheDocument();
  });

  it("지도와 위치 오류가 발생해도 목록을 유지하며 안내한다", () => {
    render(<HousingExplorer />);

    fireEvent.click(screen.getByRole("button", { name: "타일 오류" }));
    expect(screen.getByText(/목록과 핀은 계속 사용할 수 있어요/)).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /위례 새솔 청년 행복주택/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "위치 오류" }));
    expect(screen.getByText(/위치 권한 없이도/)).toBeInTheDocument();
  });
});
