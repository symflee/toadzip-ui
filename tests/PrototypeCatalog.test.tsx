import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrototypeCatalog } from "../app/PrototypeCatalog";
import { HOUSING_NOTICES } from "../app/housing-notice-data";

describe("PrototypeCatalog", () => {
  it("사이드바에서 세 UI 시안 페이지를 탐색할 수 있다", () => {
    render(<PrototypeCatalog activePage="notice-card" />);

    const sidebar = screen.getByRole("navigation", { name: "UI 시안 페이지" });
    expect(within(sidebar).getByRole("link", { name: "공고 목록 카드 UI" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(sidebar).getByRole("link", { name: "공고 목록 UI" })).toHaveAttribute(
      "href",
      "/notice-list",
    );
    expect(within(sidebar).getByRole("link", { name: "공고 상세 UI" })).toHaveAttribute(
      "href",
      "/notice-detail",
    );
  });

  it("공고 카드 A와 B를 유지하며 C까지 함께 비교한다", () => {
    render(<PrototypeCatalog activePage="notice-card" />);

    const comparison = screen.getByRole("region", {
      name: "공고 목록 카드 UI 시안 비교",
    });
    const variantA = within(comparison).getByRole("group", { name: "시안 A" });
    const variantB = within(comparison).getByRole("group", { name: "시안 B" });
    const variantC = within(comparison).getByRole("group", { name: "시안 C" });

    expect(within(variantA).getByText(HOUSING_NOTICES[0].title)).toBeInTheDocument();
    expect(within(variantA).getByRole("article")).toHaveAttribute("data-variant", "A");
    expect(within(variantB).getByText(HOUSING_NOTICES[0].title)).toBeInTheDocument();
    expect(within(variantB).getByRole("article")).toHaveAttribute("data-variant", "B");
    expect(within(variantC).getByText(HOUSING_NOTICES[0].title)).toBeInTheDocument();
    expect(within(variantC).getByRole("article")).toHaveAttribute("data-variant", "C");
    expect(within(comparison).queryByText("등록된 시안이 없습니다")).not.toBeInTheDocument();
  });

  it("공고 목록 페이지의 A 시안에는 작성된 목록 요소를 보여준다", () => {
    render(<PrototypeCatalog activePage="notice-list" />);

    const variantA = screen.getByRole("group", { name: "시안 A" });
    expect(within(variantA).getByRole("searchbox", { name: "공고 검색" })).toBeInTheDocument();
    expect(within(variantA).getAllByRole("article")).toHaveLength(HOUSING_NOTICES.length);
  });

  it("공고 상세 페이지의 A 시안에는 작성된 상세 요소를 보여준다", () => {
    render(<PrototypeCatalog activePage="notice-detail" />);

    const variantA = screen.getByRole("group", { name: "시안 A" });
    expect(
      within(variantA).getByRole("complementary", {
        name: `${HOUSING_NOTICES[0].title} 공고 상세 정보`,
      }),
    ).toBeInTheDocument();
    expect(within(variantA).getByRole("heading", { name: "공고 핵심 정보" })).toBeInTheDocument();
  });
});
