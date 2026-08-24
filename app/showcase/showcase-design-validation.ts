import { parseFragment } from "parse5";
import postcss, { CssSyntaxError } from "postcss";
import valueParser from "postcss-value-parser";

import { isSafeShowcaseLocalLink } from "./showcase-local-link";
import {
  SHOWCASE_DESIGN_CODE_BYTE_LIMIT,
  SHOWCASE_DESIGN_DESCRIPTION_LENGTH_LIMIT,
  SHOWCASE_DESIGN_TITLE_LENGTH_LIMIT,
  type CreateShowcaseDesignField,
  type CreateShowcaseDesignInput,
  type ShowcaseDesignFieldErrors,
  type ShowcaseDesignValidationIssue,
} from "./showcase-design-types";
import { isShowcaseDesignUuid } from "./showcase-design-identifiers";
import { SHOWCASE_VIEW_IDS, type ShowcaseView } from "./showcase-version-registry";

type ParsedAttribute = {
  name: string;
  prefix?: string;
  value: string;
};

type ParsedLocation = {
  startLine: number;
  startCol: number;
  attrs?: Record<string, ParsedLocation>;
};

type ParsedNode = {
  attrs?: ParsedAttribute[];
  childNodes?: ParsedNode[];
  namespaceURI?: string;
  nodeName: string;
  sourceCodeLocation?: ParsedLocation | null;
  tagName?: string;
};

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const FORBIDDEN_ELEMENTS = new Set([
  "base",
  "embed",
  "form",
  "iframe",
  "link",
  "math",
  "meta",
  "noscript",
  "object",
  "script",
  "style",
  "template",
]);
const SAFE_SVG_ELEMENTS = new Set([
  "circle",
  "clippath",
  "defs",
  "desc",
  "ellipse",
  "g",
  "lineargradient",
  "line",
  "marker",
  "mask",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialgradient",
  "rect",
  "stop",
  "svg",
  "symbol",
  "text",
  "title",
  "tspan",
]);
const URL_ATTRIBUTES = new Set([
  "action",
  "archive",
  "background",
  "cite",
  "codebase",
  "data",
  "formaction",
  "href",
  "manifest",
  "ping",
  "poster",
  "profile",
  "src",
  "srcset",
  "usemap",
]);
const SAFE_DATA_IMAGE = /^data:image\/(?:avif|gif|jpeg|png|webp);base64,[a-z0-9+/]+={0,2}$/i;
const DISALLOWED_CODE_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;

export type ShowcaseDesignValidationResult =
  | {
      success: true;
      data: CreateShowcaseDesignInput;
    }
  | {
      success: false;
      fieldErrors: ShowcaseDesignFieldErrors;
      issues: ShowcaseDesignValidationIssue[];
    };

export function validateShowcaseDesignInput(
  value: unknown,
): ShowcaseDesignValidationResult {
  const issues: ShowcaseDesignValidationIssue[] = [];
  const input = readInput(value, issues);
  if (input === null) {
    return invalidResult(issues);
  }
  validateMetadata(input, issues);
  validateCodeSize(input, issues);
  validateCodeCharacters(input, issues);
  validateHtml(input.html, issues);
  validateCss(input.css, issues);
  if (issues.length > 0) {
    return invalidResult(issues);
  }
  return {
    success: true,
    data: {
      ...input,
      title: input.title.trim(),
      description: input.description.trim(),
    },
  };
}

export function isShowcaseView(value: string): value is ShowcaseView {
  return SHOWCASE_VIEW_IDS.some((viewId) => viewId === value);
}

function readInput(
  value: unknown,
  issues: ShowcaseDesignValidationIssue[],
): CreateShowcaseDesignInput | null {
  if (typeof value !== "object" || value === null) {
    addIssue(issues, "html", "등록할 시안 정보를 확인해 주세요.");
    return null;
  }
  const candidate = value as Record<string, unknown>;
  const fields: CreateShowcaseDesignField[] = [
    "submissionKey",
    "viewId",
    "title",
    "description",
    "html",
    "css",
  ];
  const invalidFields = fields.filter((field) => typeof candidate[field] !== "string");
  invalidFields.forEach((field) => {
    addIssue(issues, field, "문자열 형식으로 입력해 주세요.");
  });
  if (invalidFields.length > 0) {
    return null;
  }
  return candidate as unknown as CreateShowcaseDesignInput;
}

function validateMetadata(
  input: CreateShowcaseDesignInput,
  issues: ShowcaseDesignValidationIssue[],
) {
  if (!isShowcaseDesignUuid(input.submissionKey)) {
    addIssue(issues, "submissionKey", "등록 요청 식별자가 올바르지 않습니다.");
  }
  if (!isShowcaseView(input.viewId)) {
    addIssue(issues, "viewId", "등록할 UI 요소를 다시 선택해 주세요.");
  }
  const title = input.title.trim();
  if (title.length === 0) {
    addIssue(issues, "title", "시안 제목을 입력해 주세요.");
  }
  if (characterLength(title) > SHOWCASE_DESIGN_TITLE_LENGTH_LIMIT) {
    addIssue(issues, "title", "시안 제목은 80자 이하로 입력해 주세요.");
  }
  if (characterLength(input.description.trim()) > SHOWCASE_DESIGN_DESCRIPTION_LENGTH_LIMIT) {
    addIssue(issues, "description", "설명은 300자 이하로 입력해 주세요.");
  }
  if (input.html.trim().length === 0) {
    addIssue(issues, "html", "HTML 코드를 입력해 주세요.");
  }
}

function validateCodeSize(
  input: CreateShowcaseDesignInput,
  issues: ShowcaseDesignValidationIssue[],
) {
  const bytes = new TextEncoder().encode(input.html).byteLength
    + new TextEncoder().encode(input.css).byteLength;
  if (bytes > SHOWCASE_DESIGN_CODE_BYTE_LIMIT) {
    addIssue(issues, "html", "HTML과 CSS는 합쳐서 512KiB 이하여야 합니다.");
    addIssue(issues, "css", "HTML과 CSS는 합쳐서 512KiB 이하여야 합니다.");
  }
}

function validateCodeCharacters(
  input: CreateShowcaseDesignInput,
  issues: ShowcaseDesignValidationIssue[],
) {
  addControlCharacterIssue("html", input.html, issues);
  addControlCharacterIssue("css", input.css, issues);
}

function addControlCharacterIssue(
  field: "html" | "css",
  value: string,
  issues: ShowcaseDesignValidationIssue[],
) {
  const match = DISALLOWED_CODE_CONTROL.exec(value);
  if (!match || match.index === undefined) return;
  const position = textPosition(value, match.index);
  issues.push({
    field,
    message: "제어 문자는 사용할 수 없습니다.",
    ...position,
  });
}

function textPosition(value: string, index: number) {
  const lines = value.slice(0, index).split(/\r\n?|\n/);
  return {
    line: lines.length,
    column: Array.from(lines.at(-1) ?? "").length + 1,
  };
}

function validateHtml(
  html: string,
  issues: ShowcaseDesignValidationIssue[],
) {
  const parseIssues: ShowcaseDesignValidationIssue[] = [];
  const fragment = parseFragment(html, {
    scriptingEnabled: false,
    sourceCodeLocationInfo: true,
    onParseError(error) {
      parseIssues.push({
        field: "html",
        message: "HTML 문법을 확인해 주세요.",
        line: error.startLine,
        column: error.startCol,
      });
    },
  }) as unknown as ParsedNode;
  issues.push(...parseIssues);
  walkHtml(fragment, issues);
}

function walkHtml(
  node: ParsedNode,
  issues: ShowcaseDesignValidationIssue[],
) {
  if (node.tagName) {
    validateElement(node, issues);
  }
  node.childNodes?.forEach((child) => walkHtml(child, issues));
}

function validateElement(
  node: ParsedNode,
  issues: ShowcaseDesignValidationIssue[],
) {
  const tagName = node.tagName?.toLowerCase() ?? "";
  const location = node.sourceCodeLocation ?? undefined;
  if (FORBIDDEN_ELEMENTS.has(tagName)) {
    addLocatedIssue(issues, "html", `<${tagName}> 요소는 사용할 수 없습니다.`, location);
  }
  if (node.namespaceURI !== HTML_NAMESPACE && node.namespaceURI !== SVG_NAMESPACE) {
    addLocatedIssue(issues, "html", "HTML과 정적 SVG 요소만 사용할 수 있습니다.", location);
  }
  if (node.namespaceURI === SVG_NAMESPACE && !SAFE_SVG_ELEMENTS.has(tagName)) {
    addLocatedIssue(issues, "html", `<${tagName}> SVG 요소는 사용할 수 없습니다.`, location);
  }
  node.attrs?.forEach((attribute) => validateAttribute(node, attribute, issues));
}

function validateAttribute(
  node: ParsedNode,
  attribute: ParsedAttribute,
  issues: ShowcaseDesignValidationIssue[],
) {
  const name = attribute.name.toLowerCase();
  const location = attributeLocation(node, attribute);
  if (name === "style") {
    addLocatedIssue(issues, "html", "style 속성은 사용할 수 없습니다. CSS 입력란을 이용해 주세요.", location);
  }
  if (name.startsWith("on")) {
    addLocatedIssue(issues, "html", `이벤트 속성 ${name}은 사용할 수 없습니다.`, location);
  }
  if (["attributionsrc", "http-equiv", "srcdoc"].includes(name)) {
    addLocatedIssue(issues, "html", `${name} 속성은 사용할 수 없습니다.`, location);
  }
  if (URL_ATTRIBUTES.has(name) && !isSafeHtmlUrl(node, attribute)) {
    addLocatedIssue(issues, "html", `${name} 속성에는 외부 주소를 사용할 수 없습니다.`, location);
  }
  if (containsUnsafeCssUrl(attribute.value)) {
    addLocatedIssue(issues, "html", `${name} 속성에는 외부 url()을 사용할 수 없습니다.`, location);
  }
}

function isSafeHtmlUrl(node: ParsedNode, attribute: ParsedAttribute) {
  const name = attribute.name.toLowerCase();
  const value = attribute.value.trim();
  if (value.length === 0) {
    return true;
  }
  if (name === "srcset") {
    return false;
  }
  if (name === "src" && node.tagName?.toLowerCase() === "img") {
    return SAFE_DATA_IMAGE.test(value);
  }
  if (name === "href" && node.namespaceURI === SVG_NAMESPACE) {
    return value.startsWith("#");
  }
  if (name === "href" && ["a", "area"].includes(node.tagName?.toLowerCase() ?? "")) {
    return isSafeShowcaseLocalLink(value);
  }
  return false;
}

function validateCss(
  css: string,
  issues: ShowcaseDesignValidationIssue[],
) {
  if (/<\/style/i.test(css)) {
    addIssue(issues, "css", "CSS에 </style 문자열을 사용할 수 없습니다.");
  }
  let root;
  try {
    root = postcss.parse(css, { from: undefined });
  } catch (error) {
    addCssSyntaxIssue(error, issues);
    return;
  }
  root.walkAtRules((rule) => {
    const name = decodeCssIdentifier(rule.name).toLowerCase();
    if (["charset", "document", "import", "namespace"].includes(name)) {
      addCssNodeIssue(issues, `@${rule.name} 규칙은 사용할 수 없습니다.`, rule);
    }
    if (containsUnsafeCssUrl(rule.params)) {
      addCssNodeIssue(issues, "외부 url()은 사용할 수 없습니다.", rule);
    }
  });
  root.walkDecls((declaration) => {
    const property = decodeCssIdentifier(declaration.prop).toLowerCase();
    const value = declaration.value;
    if (property === "behavior" || property === "-moz-binding") {
      addCssNodeIssue(issues, `${declaration.prop} 속성은 사용할 수 없습니다.`, declaration);
    }
    if (containsCssFunction(value, "expression")) {
      addCssNodeIssue(issues, "CSS expression()은 사용할 수 없습니다.", declaration);
    }
    if (containsUnsafeCssUrl(value)) {
      addCssNodeIssue(issues, "외부 url()은 사용할 수 없습니다.", declaration);
    }
  });
}

function containsUnsafeCssUrl(value: string) {
  let unsafe = false;
  valueParser(value).walk((node) => {
    if (node.type !== "function" || decodeCssIdentifier(node.value).toLowerCase() !== "url") {
      return;
    }
    const url = valueParser.stringify(node.nodes).trim().replace(/^(['"])(.*)\1$/, "$2");
    if (!url.startsWith("#") && !SAFE_DATA_IMAGE.test(url)) {
      unsafe = true;
    }
  });
  return unsafe;
}

function containsCssFunction(value: string, functionName: string) {
  let found = false;
  valueParser(value).walk((node) => {
    if (node.type === "function" && decodeCssIdentifier(node.value).toLowerCase() === functionName) {
      found = true;
    }
  });
  return found;
}

function decodeCssIdentifier(value: string) {
  return value.replace(
    /\\(?:([0-9a-f]{1,6})(?:\r\n|[\t\n\f\r ])?|([^\n\r\f0-9a-f]))/gi,
    (_match, hexadecimal: string | undefined, character: string | undefined) => {
      if (hexadecimal) {
        const codePoint = Number.parseInt(hexadecimal, 16);
        return codePoint === 0 || codePoint > 0x10ffff
          ? "\uFFFD"
          : String.fromCodePoint(codePoint);
      }
      return character ?? "";
    },
  );
}

function addCssSyntaxIssue(
  error: unknown,
  issues: ShowcaseDesignValidationIssue[],
) {
  if (error instanceof CssSyntaxError) {
    issues.push({
      field: "css",
      message: "CSS 문법을 확인해 주세요.",
      line: error.line,
      column: error.column,
    });
    return;
  }
  addIssue(issues, "css", "CSS를 해석할 수 없습니다.");
}

function addCssNodeIssue(
  issues: ShowcaseDesignValidationIssue[],
  message: string,
  node: { source?: { start?: { line: number; column: number } } },
) {
  issues.push({
    field: "css",
    message,
    line: node.source?.start?.line,
    column: node.source?.start?.column,
  });
}

function attributeLocation(node: ParsedNode, attribute: ParsedAttribute) {
  const location = node.sourceCodeLocation;
  if (!location?.attrs) {
    return location ?? undefined;
  }
  const qualifiedName = attribute.prefix
    ? `${attribute.prefix}:${attribute.name}`
    : attribute.name;
  return location.attrs[qualifiedName] ?? location.attrs[attribute.name] ?? location;
}

function addLocatedIssue(
  issues: ShowcaseDesignValidationIssue[],
  field: CreateShowcaseDesignField,
  message: string,
  location?: ParsedLocation,
) {
  issues.push({
    field,
    message,
    line: location?.startLine,
    column: location?.startCol,
  });
}

function addIssue(
  issues: ShowcaseDesignValidationIssue[],
  field: CreateShowcaseDesignField,
  message: string,
) {
  issues.push({ field, message });
}

function invalidResult(
  issues: ShowcaseDesignValidationIssue[],
): ShowcaseDesignValidationResult {
  return {
    success: false,
    issues,
    fieldErrors: issues.reduce<ShowcaseDesignFieldErrors>((errors, issue) => {
      const location = issue.line
        ? `${issue.line}행${issue.column ? ` ${issue.column}열` : ""}: `
        : "";
      errors[issue.field] = [...(errors[issue.field] ?? []), `${location}${issue.message}`];
      return errors;
    }, {}),
  };
}

function characterLength(value: string) {
  return Array.from(value).length;
}
