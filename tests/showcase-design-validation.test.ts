import { describe, expect, it } from "vitest";

import {
  SHOWCASE_DESIGN_CODE_BYTE_LIMIT,
  type CreateShowcaseDesignInput,
} from "../app/showcase/showcase-design-types";
import { validateShowcaseDesignInput } from "../app/showcase/showcase-design-validation";

const VALID_INPUT: CreateShowcaseDesignInput = {
  submissionKey: "98a4f18c-31d6-4c17-a22a-f5e71ff117ba",
  viewId: "notice-card",
  title: "정적 공고 카드",
  description: "등록 시안 설명",
  html: '<article><h2>공고 제목</h2><a href="/showcase">시안 보기</a></article>',
  css: "article { color: #18221d; }",
};

describe("시안 HTML/CSS 서버 검증", () => {
  it("안전한 HTML, 로컬 링크, data 이미지와 정적 inline SVG를 허용한다", () => {
    const result = validateShowcaseDesignInput({
      ...VALID_INPUT,
      html: [
        '<a href="/showcase">로컬 링크</a>',
        '<img alt="점" src="data:image/png;base64,AA==">',
        '<svg viewBox="0 0 10 10"><defs><linearGradient id="g"><stop offset="1" /></linearGradient></defs><rect width="10" height="10" fill="url(#g)" /></svg>',
      ].join(""),
      css: ".card { background-image: url(data:image/webp;base64,AA==); mask-image: url(#mask); }",
    });

    expect(result).toEqual({ success: true, data: expect.any(Object) });
  });

  it.each([
    ["script", "<script>alert(1)</script>"],
    ["event", '<button onclick="alert(1)">열기</button>'],
    ["style attribute", '<p style="color:red">문구</p>'],
    ["form", '<form action="/submit"><button>전송</button></form>'],
    ["iframe", '<iframe src="/showcase"></iframe>'],
    ["object", '<object data="data:text/html,x"></object>'],
    ["embed", '<embed src="data:text/html,x">'],
    ["meta refresh", '<meta http-equiv="refresh" content="0;url=/">'],
    ["noscript parser mismatch", '<noscript><meta http-equiv="refresh" content="0;url=https://example.com"></noscript>'],
    ["attribution reporting", '<img alt="점" src="data:image/png;base64,AA==" attributionsrc="https://example.com/register">'],
    ["external link", '<a href="https://example.com">외부</a>'],
    ["fixed-origin absolute link", '<a href="https://showcase.invalid/track">외부</a>'],
    ["credential absolute link", '<a href="https://user@showcase.invalid/track">외부</a>'],
    ["protocol-relative link", '<a href="//example.com">외부</a>'],
    ["backslash external link", '<a href="/\\example.com">외부</a>'],
    ["external image", '<img src="https://example.com/pixel.png">'],
    ["active SVG", '<svg><animate attributeName="x" values="0;1" /></svg>'],
    ["SVG foreignObject", '<svg><foreignObject><p>HTML</p></foreignObject></svg>'],
  ])("%s payload를 거부한다", (_name, html) => {
    const result = validateShowcaseDesignInput({ ...VALID_INPUT, html });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.fieldErrors.html?.length).toBeGreaterThan(0);
    expect(result.issues.some((issue) => issue.line === 1)).toBe(true);
  });

  it.each([
    ["import", '@import "https://example.com/a.css";'],
    ["escaped import", '@\\69mport "https://example.com/a.css";'],
    ["external url", ".card { background: url(https://example.com/a.png); }"],
    ["escaped url function", ".card { background: u\\72l(https://example.com/a.png); }"],
    ["relative url", ".card { background: url(/api/tracker); }"],
    ["expression", ".card { width: expression(alert(1)); }"],
    ["escaped expression", ".card { width: e\\78pression(alert(1)); }"],
    ["binding", ".card { -moz-binding: url(#binding); }"],
    ["style breakout", ".card::after { content: '</style><script>'; }"],
  ])("CSS %s payload를 거부한다", (_name, css) => {
    const result = validateShowcaseDesignInput({ ...VALID_INPUT, css });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.fieldErrors.css?.length).toBeGreaterThan(0);
  });

  it.each([
    ["html", "<p>안전</p>\n<!--\u0000-->", "html"],
    ["css", ".card { color: red; }\n/*\u0001*/", "css"],
  ] as const)("%s 제어 문자를 위치와 함께 거부한다", (_name, value, field) => {
    const result = validateShowcaseDesignInput({
      ...VALID_INPUT,
      [field]: value,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.fieldErrors[field]?.some((error) => error.startsWith("2행"))).toBe(true);
  });

  it("파서 오류의 행과 열을 필드 오류에 포함한다", () => {
    const result = validateShowcaseDesignInput({
      ...VALID_INPUT,
      css: ".card { color: red;",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.issues).toContainEqual(expect.objectContaining({
      field: "css",
      line: 1,
      column: expect.any(Number),
    }));
    expect(result.fieldErrors.css?.[0]).toMatch(/^1행 \d+열:/);
  });

  it("제목·설명·UUID·화면과 UTF-8 512KiB 상한을 서버에서 다시 검증한다", () => {
    const oversizedHtml = `<p>${"가".repeat(Math.ceil(SHOWCASE_DESIGN_CODE_BYTE_LIMIT / 3))}</p>`;
    const result = validateShowcaseDesignInput({
      ...VALID_INPUT,
      submissionKey: "not-a-uuid",
      viewId: "unknown",
      title: "제".repeat(81),
      description: "설".repeat(301),
      html: oversizedHtml,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(Object.keys(result.fieldErrors)).toEqual(expect.arrayContaining([
      "submissionKey",
      "viewId",
      "title",
      "description",
      "html",
      "css",
    ]));
  });

  it("원본을 자동 수정하지 않고 메타데이터의 바깥 공백만 정리한다", () => {
    const html = "\n<article>  원본  </article>\n";
    const css = "\narticle { white-space: pre; }\n";
    const result = validateShowcaseDesignInput({
      ...VALID_INPUT,
      title: "  제목  ",
      description: "  설명  ",
      html,
      css,
    });

    expect(result).toEqual({
      success: true,
      data: {
        ...VALID_INPUT,
        title: "제목",
        description: "설명",
        html,
        css,
      },
    });
  });
});
