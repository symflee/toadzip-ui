import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  RegisteredShowcaseDesigns,
  ShowcaseSourceActions,
} from "../app/showcase/RegisteredShowcaseDesigns";
import type {
  ShowcaseDesignActionResult,
  ShowcaseDesignPage,
  ShowcaseDesignSummary,
} from "../app/showcase/showcase-design-types";
import { SHOWCASE_PREVIEW_BASE_CSS } from "../app/showcase/showcase-preview-base";

function submittedDesign(
  id: string,
  sequence: number,
  title = `등록 시안 ${sequence}`,
): ShowcaseDesignSummary {
  return {
    id,
    sourceKind: "submitted",
    viewId: "notice-card",
    sequence,
    title,
    description: `설명 ${sequence}`,
    createdAt: "2026-08-24T03:00:00.000Z",
    previewUrl: `/api/showcase-preview/submitted/${id}`,
    sourceUrl: `/api/showcase-designs/submitted/${id}/source`,
  };
}

function readyPage(
  items: ShowcaseDesignSummary[] = [],
  nextCursor: string | null = null,
): ShowcaseDesignPage {
  return { status: "ready", items, nextCursor };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("등록 시안 편집기", () => {
  it("위험한 작성 중 코드만 제거한 뒤 빈 sandbox와 CSP로 실시간 미리보기를 격리한다", async () => {
    render(
      <RegisteredShowcaseDesigns
        viewId="notice-card"
        viewTitle="공고 목록 카드 UI"
        initialPage={readyPage()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/HTML fragment/), {
      target: {
        value: [
          '<meta http-equiv="refresh" content="0;url=https://example.com">',
          '<script>parent.location="https://example.com"</script>',
          '<noscript><meta http-equiv="refresh" content="0;url=https://example.com"></noscript>',
          '<p onclick="fetch(\'https://example.com\')" style="color:red">안전한 문구</p>',
          '<a href="#safe">내부 위치</a>',
          '<a href="https://showcase.invalid/track">고정 origin 우회</a>',
          '<a href="/\\example.com">역슬래시 우회</a>',
          '<img alt="안전 이미지" src="data:image/png;base64,iVBORw0KGgo=" attributionsrc="https://example.com/register">',
          '<img src="https://example.com/tracker.png">',
        ].join(""),
      },
    });
    fireEvent.change(screen.getByLabelText(/CSS 선택/), {
      target: {
        value: '@import "https://example.com/a.css"; .card{background:url(https://example.com/a.png)}',
      },
    });

    const preview = screen.getByTitle("공고 목록 카드 UI 작성 중인 시안 미리보기");
    await waitFor(() => {
      expect((preview as HTMLIFrameElement).srcdoc).toContain("안전한 문구");
    });
    const source = (preview as HTMLIFrameElement).srcdoc;
    expect(preview).toHaveAttribute("sandbox", "");
    expect(preview).not.toHaveAttribute("allow");
    expect(preview).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(source).toContain("Content-Security-Policy");
    expect(source).toContain('name="viewport"');
    expect(source).toContain("default-src 'none'");
    expect(source).toContain(SHOWCASE_PREVIEW_BASE_CSS);
    expect(source).not.toContain("refresh");
    expect(source).not.toContain("<script");
    expect(source).not.toContain("<noscript");
    expect(source).not.toContain("attributionsrc");
    expect(source).not.toContain("onclick");
    expect(source).not.toContain("style=\"");
    expect(source).not.toContain("https://example.com");
    expect(source).not.toContain("https://showcase.invalid");
    expect(source).not.toContain("/\\example.com");
    expect(source).not.toContain("@import");
    expect(source).not.toContain("background:url");
    expect(source).toContain('href="#safe"');
    expect(source).toContain("data:image/png;base64,iVBORw0KGgo=");
  });

  it("등록 성공 시 최신 카드를 즉시 앞에 추가하고 입력과 idempotency key를 초기화한다", async () => {
    const existing = submittedDesign("existing", 7, "기존 등록 시안");
    const created = submittedDesign("created", 8, "새 등록 시안");
    const second = submittedDesign("second", 9, "두 번째 시안");
    const createDesign = vi.fn<(
      input: Parameters<NonNullable<React.ComponentProps<typeof RegisteredShowcaseDesigns>["createDesign"]>>[0],
    ) => Promise<ShowcaseDesignActionResult>>()
      .mockResolvedValueOnce({ status: "success", design: created })
      .mockResolvedValueOnce({ status: "success", design: second });
    render(
      <RegisteredShowcaseDesigns
        viewId="notice-card"
        viewTitle="공고 목록 카드 UI"
        initialPage={readyPage([existing])}
        createDesign={createDesign}
      />,
    );

    fireEvent.change(screen.getByLabelText(/시안 제목/), { target: { value: "새 등록 시안" } });
    fireEvent.change(screen.getByLabelText(/설명 선택/), { target: { value: "의사결정용" } });
    fireEvent.change(screen.getByLabelText(/HTML fragment/), { target: { value: "<article>새 시안</article>" } });
    fireEvent.change(screen.getByLabelText(/CSS 선택/), { target: { value: "article { color: navy; }" } });
    fireEvent.submit(screen.getByRole("form", { name: "공고 목록 카드 UI 새 시안 등록" }));

    await waitFor(() => expect(createDesign).toHaveBeenCalledTimes(1));
    const firstKey = createDesign.mock.calls[0]![0].submissionKey;
    expect(firstKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(createDesign).toHaveBeenCalledWith({
      submissionKey: firstKey,
      viewId: "notice-card",
      title: "새 등록 시안",
      description: "의사결정용",
      html: "<article>새 시안</article>",
      css: "article { color: navy; }",
    });
    await waitFor(() => expect(screen.getByText("시안을 등록했습니다.")).toBeInTheDocument());
    const gallery = screen.getByRole("list", { name: "등록된 공고 목록 카드 UI 시안" });
    expect(within(gallery).getAllByRole("article").map((article) => article.getAttribute("aria-label")))
      .toEqual(["새 등록 시안 등록 시안", "기존 등록 시안 등록 시안"]);
    expect(screen.getByLabelText(/시안 제목/)).toHaveValue("");
    expect(screen.getByLabelText(/HTML fragment/)).toHaveValue("");

    fireEvent.change(screen.getByLabelText(/시안 제목/), { target: { value: "두 번째 시안" } });
    fireEvent.change(screen.getByLabelText(/HTML fragment/), { target: { value: "<p>두 번째</p>" } });
    fireEvent.submit(screen.getByRole("form", { name: "공고 목록 카드 UI 새 시안 등록" }));
    await waitFor(() => expect(createDesign).toHaveBeenCalledTimes(2));
    expect(createDesign.mock.calls[1]![0].submissionKey).not.toBe(firstKey);
  });

  it("검증 실패 입력과 submission key를 유지하고 필드 오류를 연결한다", async () => {
    const created = submittedDesign("created", 8, "재시도 시안");
    const createDesign = vi.fn()
      .mockResolvedValueOnce({
        status: "validation-error",
        fieldErrors: { html: ["script 요소는 사용할 수 없습니다."] },
        issues: [],
      })
      .mockResolvedValueOnce({ status: "success", design: created });
    render(
      <RegisteredShowcaseDesigns
        viewId="notice-card"
        viewTitle="공고 목록 카드 UI"
        initialPage={readyPage()}
        createDesign={createDesign}
      />,
    );

    fireEvent.change(screen.getByLabelText(/시안 제목/), { target: { value: "재시도 시안" } });
    fireEvent.change(screen.getByLabelText(/HTML fragment/), { target: { value: "<script></script>" } });
    fireEvent.submit(screen.getByRole("form", { name: /새 시안 등록/ }));
    await screen.findByText("script 요소는 사용할 수 없습니다.");
    const firstKey = createDesign.mock.calls[0][0].submissionKey;
    const htmlField = screen.getByLabelText(/HTML fragment/);
    expect(htmlField).toHaveValue("<script></script>");
    expect(htmlField).toHaveAttribute("aria-invalid", "true");
    expect(htmlField).toHaveAccessibleDescription("script 요소는 사용할 수 없습니다.");

    fireEvent.change(screen.getByLabelText(/HTML fragment/), { target: { value: "<p>안전</p>" } });
    fireEvent.submit(screen.getByRole("form", { name: /새 시안 등록/ }));
    await waitFor(() => expect(createDesign).toHaveBeenCalledTimes(2));
    expect(createDesign.mock.calls[1][0].submissionKey).toBe(firstKey);
  });
});

describe("등록 시안 목록과 소스", () => {
  it("12개 다음 페이지를 cursor로 불러와 중복 없이 뒤에 추가한다", async () => {
    const initialItems = Array.from({ length: 12 }, (_, index) => {
      const sequence = 24 - index;
      return submittedDesign(`design-${sequence}`, sequence);
    });
    const nextDesign = submittedDesign("design-12", 12);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => readyPage([initialItems[11]!, nextDesign]),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <RegisteredShowcaseDesigns
        viewId="notice-card"
        viewTitle="공고 목록 카드 UI"
        initialPage={readyPage(initialItems, "cursor-12")}
      />,
    );

    expect(screen.getByText("12개 표시 중")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/showcase-designs?view=notice-card&before=cursor-12",
      { headers: { Accept: "application/json" } },
    ));
    await screen.findByRole("article", { name: "등록 시안 12 등록 시안" });
    expect(screen.getByText("13개 표시 중")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "더 보기" })).not.toBeInTheDocument();
  });

  it("DB 장애는 등록 영역에만 오류와 재시도를 표시하고 복구 후 빈 상태를 보여준다", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => readyPage(),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <RegisteredShowcaseDesigns
        viewId="notice-card"
        viewTitle="공고 목록 카드 UI"
        initialPage={{
          status: "unavailable",
          items: [],
          nextCursor: null,
          message: "DB 연결을 확인해 주세요.",
        }}
      />,
    );

    const error = screen.getByRole("alert");
    expect(within(error).getByText("DB 연결을 확인해 주세요.")).toBeInTheDocument();
    expect(screen.getByRole("form", { name: /새 시안 등록/ })).toBeInTheDocument();
    fireEvent.click(within(error).getByRole("button", { name: "다시 시도" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/showcase-designs?view=notice-card",
      { headers: { Accept: "application/json" } },
    ));
    expect(await screen.findByText("아직 등록된 시안이 없습니다.")).toBeInTheDocument();
  });

  it("소스를 열 때만 가져오고 HTML/CSS 탭, 복사와 세 가지 다운로드를 제공한다", async () => {
    const source = {
      ...submittedDesign("registered", 11, "등록 카드"),
      html: "<article>등록 카드</article>",
      css: "article { color: green; }",
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => source,
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <RegisteredShowcaseDesigns
        viewId="notice-card"
        viewTitle="공고 목록 카드 UI"
        initialPage={readyPage([source])}
      />,
    );

    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "HTML/CSS 코드 보기" }));
    expect(await screen.findByText("<article>등록 카드</article>")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(source.sourceUrl, {
      headers: { Accept: "application/json" },
    });
    const sourcePanel = screen.getByRole("region", { name: "등록 카드 HTML/CSS 코드" });
    expect(within(sourcePanel).getByRole("tab", { name: "HTML" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const htmlTab = within(sourcePanel).getByRole("tab", { name: "HTML" });
    const cssTab = within(sourcePanel).getByRole("tab", { name: "CSS" });
    htmlTab.focus();
    fireEvent.keyDown(htmlTab, { key: "ArrowRight" });
    expect(cssTab).toHaveFocus();
    expect(cssTab).toHaveAttribute("aria-selected", "true");
    expect(within(sourcePanel).getByText("article { color: green; }")).toBeInTheDocument();
    fireEvent.click(within(sourcePanel).getByRole("button", { name: "CSS 복사" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(source.css));
    expect(within(sourcePanel).getByText("CSS 코드를 복사했습니다.")).toBeInTheDocument();

    expect(within(sourcePanel).getByRole("link", { name: "HTML 다운로드" }))
      .toHaveAttribute("href", `${source.sourceUrl}?download=html`);
    expect(within(sourcePanel).getByRole("link", { name: "CSS 다운로드" }))
      .toHaveAttribute("href", `${source.sourceUrl}?download=css`);
    expect(within(sourcePanel).getByRole("link", { name: "통합 HTML 다운로드" }))
      .toHaveAttribute("href", `${source.sourceUrl}?download=combined`);
    expect(within(sourcePanel).queryByRole("button", { name: /수정|삭제|로그인/ }))
      .not.toBeInTheDocument();
  });

  it("기존 시안도 같은 소스 액션으로 코드와 로컬 다운로드를 제공한다", () => {
    render(
      <ShowcaseSourceActions
        title="기존 시안 A"
        fileName="notice-card-a"
        source={{ html: "<article>A</article>", css: "article { color: blue; }" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "HTML/CSS 코드 보기" }));
    const panel = screen.getByRole("region", { name: "기존 시안 A HTML/CSS 코드" });
    expect(within(panel).getByText("<article>A</article>")).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: "HTML 다운로드" }))
      .toHaveAttribute("download", "notice-card-a.html");
    expect(within(panel).getByRole("link", { name: "CSS 다운로드" }))
      .toHaveAttribute("download", "notice-card-a.css");
    const combinedDownload = within(panel).getByRole("link", { name: "통합 HTML 다운로드" });
    expect(combinedDownload).toHaveAttribute("download", "notice-card-a-combined.html");
    expect(combinedDownload).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent(SHOWCASE_PREVIEW_BASE_CSS)),
    );
  });
});
