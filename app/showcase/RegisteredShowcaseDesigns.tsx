"use client";

import { useId, useMemo, useRef, useState, useTransition } from "react";
import styles from "./RegisteredShowcaseDesigns.module.css";
import type {
  CreateShowcaseDesignInput,
  ShowcaseDesignActionResult,
  ShowcaseDesignFieldErrors,
  ShowcaseDesignPage,
  ShowcaseDesignSource,
  ShowcaseDesignSummary,
} from "./showcase-design-types";
import { isSafeShowcaseLocalLink } from "./showcase-local-link";
import { SHOWCASE_PREVIEW_BASE_CSS } from "./showcase-preview-base";

const DRAFT_CSP = [
  "default-src 'none'",
  "script-src 'none'",
  "connect-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  "style-src 'unsafe-inline'",
  "img-src data:",
].join("; ");

const FORBIDDEN_DRAFT_ELEMENTS = [
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
].join(",");

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
  "xlink:href",
]);

const EMPTY_PAGE: ShowcaseDesignPage = {
  status: "ready",
  items: [],
  nextCursor: null,
};

export type CreateDesignAction = (
  input: CreateShowcaseDesignInput,
) => Promise<ShowcaseDesignActionResult>;

type SourceContent = Pick<ShowcaseDesignSource, "html" | "css">;
type SourceTab = "html" | "css";

export interface RegisteredShowcaseDesignsProps {
  viewId: ShowcaseDesignSummary["viewId"];
  viewTitle: string;
  initialPage?: ShowcaseDesignPage;
  initialError?: string | null;
  createDesign?: CreateDesignAction;
}

export interface ShowcaseSourceActionsProps {
  title: string;
  fileName?: string;
  source?: SourceContent;
  sourceUrl?: string;
}

function stripUnsafeCss(css: string) {
  return css
    .replace(/@(charset|document|import|namespace)\s+(?:url\s*\([^)]*\)|(?:"[^"]*"|'[^']*'|[^;]*));?/gi, "")
    .replace(/url\s*\(\s*(?:(["'])(.*?)\1|([^)]*))\s*\)/gi, (match, _quote, quoted, bare) => {
      const value = String(quoted ?? bare ?? "").trim();
      return value.startsWith("#") || isSafeDataImage(value) ? match : "";
    })
    .replaceAll("<", "\\3C ");
}

function isSafeDataImage(value: string) {
  return /^data:image\/(?:avif|gif|jpeg|png|webp);base64,[a-z0-9+/]+={0,2}$/i.test(value);
}

function isSafeDraftUrl(element: Element, name: string, value: string) {
  const normalized = value.trim();
  if (!normalized) return true;
  if (name === "srcset") return false;
  if (name === "src" && element.tagName.toLowerCase() === "img") {
    return isSafeDataImage(normalized);
  }
  if ((name === "href" || name === "xlink:href") && element.namespaceURI?.includes("svg")) {
    return normalized.startsWith("#");
  }
  if (name === "href" && ["a", "area"].includes(element.tagName.toLowerCase())) {
    return isSafeShowcaseLocalLink(normalized);
  }
  return false;
}

function sanitizeDraftHtml(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll(FORBIDDEN_DRAFT_ELEMENTS).forEach((element) => element.remove());
  document.body.querySelectorAll("*").forEach((element) => {
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || name === "style") element.removeAttribute(attribute.name);
      if (["attributionsrc", "http-equiv", "srcdoc"].includes(name)) {
        element.removeAttribute(attribute.name);
      }
      if (URL_ATTRIBUTES.has(name) && !isSafeDraftUrl(element, name, attribute.value)) {
        element.removeAttribute(attribute.name);
      }
    }
  });
  return document.body.innerHTML;
}

function createPreviewDocument(html: string, css: string) {
  const safeHtml = typeof DOMParser === "undefined" ? "" : sanitizeDraftHtml(html);
  const safeCss = stripUnsafeCss(css);
  return [
    "<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\">",
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<meta http-equiv="Content-Security-Policy" content="${DRAFT_CSP}">`,
    `<style>${SHOWCASE_PREVIEW_BASE_CSS}${safeCss}</style></head><body>${safeHtml}</body></html>`,
  ].join("");
}

function createSubmissionKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  if (!globalThis.crypto?.getRandomValues) {
    bytes.forEach((_, index) => {
      bytes[index] = Math.floor(Math.random() * 256);
    });
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const value = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

function sourceDownloadUrl(sourceUrl: string, format: "html" | "css" | "combined") {
  const separator = sourceUrl.includes("?") ? "&" : "?";
  return `${sourceUrl}${separator}download=${format}`;
}

function safeFileName(value: string) {
  const normalized = value.trim().replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/^-+|-+$/g, "");
  return normalized || "showcase-design";
}

function combinedHtml(source: SourceContent) {
  return [
    "<!doctype html>",
    '<html lang="ko">',
    "<head>",
    '  <meta charset="utf-8">',
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    "  <style>",
    SHOWCASE_PREVIEW_BASE_CSS,
    source.css,
    "  </style>",
    "</head>",
    "<body>",
    source.html,
    "</body>",
    "</html>",
  ].join("\n");
}

function dataDownloadUrl(content: string, mimeType: string) {
  return `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
}

function formatRegisteredAt(createdAt: string | null) {
  if (!createdAt) return "등록 시각 확인 중";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "등록 시각 확인 중";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(date);
}

function FieldErrors({ errors, id }: { errors?: string[]; id?: string }) {
  if (!errors?.length) return null;
  return (
    <ul id={id} className={styles.fieldErrors}>
      {errors.map((error) => <li key={error}>{error}</li>)}
    </ul>
  );
}

function downloadLink(
  format: "html" | "css" | "combined",
  sourceUrl: string | undefined,
  source: SourceContent,
) {
  if (sourceUrl) return sourceDownloadUrl(sourceUrl, format);
  if (format === "html") return dataDownloadUrl(source.html, "text/html");
  if (format === "css") return dataDownloadUrl(source.css, "text/css");
  return dataDownloadUrl(combinedHtml(source), "text/html");
}

export function ShowcaseSourceActions({
  title,
  fileName,
  source,
  sourceUrl,
}: ShowcaseSourceActionsProps) {
  const tabId = useId();
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<SourceTab>("html");
  const [loadedSource, setLoadedSource] = useState<SourceContent | null>(source ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const fileStem = safeFileName(fileName ?? title);

  const loadSource = async () => {
    if (loadedSource || !sourceUrl) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(sourceUrl, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("코드를 불러오지 못했습니다.");
      const result = await response.json() as ShowcaseDesignSource;
      if (typeof result.html !== "string" || typeof result.css !== "string") {
        throw new Error("코드 응답 형식을 확인해 주세요.");
      }
      setLoadedSource({ html: result.html, css: result.css });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "코드를 불러오지 못했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    setCopyMessage("");
    if (nextExpanded) void loadSource();
  };

  const selectSourceTab = (tab: SourceTab) => {
    setActiveTab(tab);
    setCopyMessage("");
  };

  const moveSourceTab = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    tab: SourceTab,
  ) => {
    const tabs: SourceTab[] = ["html", "css"];
    const index = tabs.indexOf(tab);
    const nextIndexes: Record<string, number> = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const nextIndex = nextIndexes[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextTab = tabs[nextIndex]!;
    selectSourceTab(nextTab);
    event.currentTarget.ownerDocument
      .getElementById(`${tabId}-${nextTab}-tab`)
      ?.focus();
  };

  const copyActiveSource = async () => {
    if (!loadedSource) return;
    try {
      await navigator.clipboard.writeText(loadedSource[activeTab]);
      setCopyMessage(`${activeTab.toUpperCase()} 코드를 복사했습니다.`);
    } catch {
      setCopyMessage("코드를 복사하지 못했습니다.");
    }
  };

  return (
    <div className={styles.sourceActions}>
      <button
        className={styles.secondaryButton}
        type="button"
        aria-expanded={expanded}
        onClick={toggleSource}
        disabled={!source && !sourceUrl}
      >
        {expanded ? "코드 닫기" : "HTML/CSS 코드 보기"}
      </button>

      {expanded && (
        <section className={styles.sourcePanel} aria-label={`${title} HTML/CSS 코드`}>
          {loading && <p className={styles.status} role="status">코드를 불러오는 중입니다.</p>}
          {error && (
            <div className={styles.inlineError} role="alert">
              <p>{error}</p>
              <button type="button" onClick={() => void loadSource()}>다시 시도</button>
            </div>
          )}
          {loadedSource && (
            <>
              <div className={styles.sourceToolbar}>
                <div className={styles.tabs} role="tablist" aria-label={`${title} 코드 종류`}>
                  {(["html", "css"] as const).map((tab) => (
                    <button
                      key={tab}
                      id={`${tabId}-${tab}-tab`}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab}
                      aria-controls={`${tabId}-${tab}-panel`}
                      tabIndex={activeTab === tab ? 0 : -1}
                      onClick={() => selectSourceTab(tab)}
                      onKeyDown={(event) => moveSourceTab(event, tab)}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button className={styles.copyButton} type="button" onClick={() => void copyActiveSource()}>
                  {activeTab.toUpperCase()} 복사
                </button>
              </div>

              <pre
                id={`${tabId}-${activeTab}-panel`}
                className={styles.codePanel}
                role="tabpanel"
                aria-labelledby={`${tabId}-${activeTab}-tab`}
                tabIndex={0}
              >
                <code>{loadedSource[activeTab]}</code>
              </pre>

              <p className={styles.copyStatus} role="status" aria-live="polite">{copyMessage}</p>
              <div className={styles.downloads} aria-label={`${title} 코드 다운로드`}>
                <a
                  href={downloadLink("html", sourceUrl, loadedSource)}
                  download={`${fileStem}.html`}
                >
                  HTML 다운로드
                </a>
                <a
                  href={downloadLink("css", sourceUrl, loadedSource)}
                  download={`${fileStem}.css`}
                >
                  CSS 다운로드
                </a>
                <a
                  href={downloadLink("combined", sourceUrl, loadedSource)}
                  download={`${fileStem}-combined.html`}
                >
                  통합 HTML 다운로드
                </a>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function RegisteredDesignCard({ design }: { design: ShowcaseDesignSummary }) {
  const registeredAt = formatRegisteredAt(design.createdAt);
  return (
    <article className={styles.designCard} aria-label={`${design.title} 등록 시안`}>
      <iframe
        className={styles.cardPreview}
        src={design.previewUrl}
        sandbox=""
        referrerPolicy="no-referrer"
        title={`${design.title} 미리보기`}
      />
      <div className={styles.cardBody}>
        <div className={styles.cardHeading}>
          <h4>{design.title}</h4>
          <span>등록 시안</span>
        </div>
        {design.description && <p>{design.description}</p>}
        <time dateTime={design.createdAt ?? undefined}>{registeredAt}</time>
        <ShowcaseSourceActions
          title={design.title}
          fileName={`${design.viewId}-${design.sequence ?? design.id}`}
          sourceUrl={design.sourceUrl}
        />
      </div>
    </article>
  );
}

function initialItems(page: ShowcaseDesignPage) {
  if (page.status === "ready") return page.items;
  return [];
}

function initialCursor(page: ShowcaseDesignPage) {
  if (page.status === "ready") return page.nextCursor;
  return null;
}

function initialListError(page: ShowcaseDesignPage, initialError?: string | null) {
  if (initialError) return initialError;
  if (page.status === "unavailable") return page.message;
  return null;
}

async function unavailableCreateDesign(): Promise<ShowcaseDesignActionResult> {
  return {
    status: "unavailable",
    message: "등록 저장소가 연결되지 않았습니다.",
  };
}

export function RegisteredShowcaseDesigns({
  viewId,
  viewTitle,
  initialPage = EMPTY_PAGE,
  initialError,
  createDesign = unavailableCreateDesign,
}: RegisteredShowcaseDesignsProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [items, setItems] = useState(() => initialItems(initialPage));
  const [nextCursor, setNextCursor] = useState(() => initialCursor(initialPage));
  const [listError, setListError] = useState<string | null>(() => {
    return initialListError(initialPage, initialError);
  });
  const [listPending, setListPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ShowcaseDesignFieldErrors>({});
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, startSubmitting] = useTransition();
  const formId = useId();
  const submissionKey = useRef<string | null>(null);
  const previewDocument = useMemo(() => createPreviewDocument(html, css), [html, css]);

  const generalFieldErrors = useMemo(() => {
    return [...(fieldErrors.viewId ?? []), ...(fieldErrors.submissionKey ?? [])];
  }, [fieldErrors]);

  const resetEditor = () => {
    setTitle("");
    setDescription("");
    setHtml("");
    setCss("");
    setFieldErrors({});
    submissionKey.current = null;
  };

  const submitDesign = async (input: CreateShowcaseDesignInput) => {
    try {
      const result = await createDesign(input);
      if (result.status === "validation-error") {
        setFieldErrors(result.fieldErrors);
        setFormMessage("입력 내용을 확인해 주세요.");
        return;
      }
      if (result.status !== "success") {
        setFormMessage(result.message);
        return;
      }
      setItems((current) => [
        result.design,
        ...current.filter((design) => design.id !== result.design.id),
      ]);
      setListError(null);
      resetEditor();
      setFormMessage("시안을 등록했습니다.");
    } catch {
      setFormMessage("시안을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setFormMessage("");
    submissionKey.current ??= createSubmissionKey();
    const input: CreateShowcaseDesignInput = {
      submissionKey: submissionKey.current,
      viewId,
      title,
      description,
      html,
      css,
    };
    startSubmitting(() => submitDesign(input));
  };

  const loadDesigns = async (before: string | null, replace: boolean) => {
    setListPending(true);
    setListError(null);
    const parameters = new URLSearchParams({ view: viewId });
    if (before) parameters.set("before", before);
    try {
      const response = await fetch(`/api/showcase-designs?${parameters.toString()}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("등록 시안을 불러오지 못했습니다.");
      const page = await response.json() as ShowcaseDesignPage;
      if (page.status === "unavailable") throw new Error(page.message);
      setItems((current) => {
        const base = replace ? [] : current;
        const ids = new Set(base.map((design) => design.id));
        return [...base, ...page.items.filter((design) => !ids.has(design.id))];
      });
      setNextCursor(page.nextCursor);
    } catch (caught) {
      const message = caught instanceof Error
        ? caught.message
        : "등록 시안을 불러오지 못했습니다.";
      setListError(message);
    } finally {
      setListPending(false);
    }
  };

  const retryList = () => {
    void loadDesigns(items.length ? nextCursor : null, items.length === 0);
  };

  return (
    <section className={styles.registeredSection} aria-labelledby={`registered-designs-${viewId}`}>
      <header className={styles.sectionHeader}>
        <span>COMMUNITY HTML / CSS</span>
        <h2 id={`registered-designs-${viewId}`}>등록 시안</h2>
        <p>HTML과 CSS로 만든 정적 검토 시안을 등록하고, 기존 시안과 분리해 확인합니다.</p>
      </header>

      <form className={styles.editor} onSubmit={handleSubmit} aria-label={`${viewTitle} 새 시안 등록`}>
        <div className={styles.editorFields}>
          <div className={styles.editorHeading}>
            <div>
              <h3>새 시안 등록</h3>
              <p>JavaScript와 외부 네트워크 요청은 미리보기와 등록 시안에서 실행되지 않습니다.</p>
            </div>
            <span>최대 512 KiB</span>
          </div>

          <label className={styles.field}>
            <span>시안 제목 <small>필수 · 80자 이내</small></span>
            <input
              name="title"
              value={title}
              maxLength={80}
              required
              aria-invalid={Boolean(fieldErrors.title?.length)}
              aria-describedby={fieldErrors.title?.length ? `${formId}-title-errors` : undefined}
              onChange={(event) => setTitle(event.target.value)}
            />
            <FieldErrors id={`${formId}-title-errors`} errors={fieldErrors.title} />
          </label>

          <label className={styles.field}>
            <span>설명 <small>선택 · 300자 이내</small></span>
            <textarea
              name="description"
              value={description}
              maxLength={300}
              rows={2}
              aria-invalid={Boolean(fieldErrors.description?.length)}
              aria-describedby={fieldErrors.description?.length
                ? `${formId}-description-errors`
                : undefined}
              onChange={(event) => setDescription(event.target.value)}
            />
            <FieldErrors id={`${formId}-description-errors`} errors={fieldErrors.description} />
          </label>

          <div className={styles.codeFields}>
            <label className={styles.field}>
              <span>HTML <small>fragment</small></span>
              <textarea
                name="html"
                value={html}
                rows={12}
                required
                spellCheck={false}
                aria-invalid={Boolean(fieldErrors.html?.length)}
                aria-describedby={fieldErrors.html?.length ? `${formId}-html-errors` : undefined}
                onChange={(event) => setHtml(event.target.value)}
              />
              <FieldErrors id={`${formId}-html-errors`} errors={fieldErrors.html} />
            </label>
            <label className={styles.field}>
              <span>CSS <small>선택</small></span>
              <textarea
                name="css"
                value={css}
                rows={12}
                spellCheck={false}
                aria-invalid={Boolean(fieldErrors.css?.length)}
                aria-describedby={fieldErrors.css?.length ? `${formId}-css-errors` : undefined}
                onChange={(event) => setCss(event.target.value)}
              />
              <FieldErrors id={`${formId}-css-errors`} errors={fieldErrors.css} />
            </label>
          </div>

          {generalFieldErrors.length > 0 && (
            <div className={styles.formError} role="alert">
              <FieldErrors errors={generalFieldErrors} />
            </div>
          )}
          <div className={styles.formFooter}>
            <p role="status" aria-live="polite">{formMessage}</p>
            <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "등록 중…" : "시안 등록"}
            </button>
          </div>
        </div>

        <div className={styles.livePreview}>
          <div className={styles.previewHeading}>
            <h3>실시간 미리보기</h3>
            <span>격리된 정적 화면</span>
          </div>
          <iframe
            srcDoc={previewDocument}
            sandbox=""
            referrerPolicy="no-referrer"
            title={`${viewTitle} 작성 중인 시안 미리보기`}
          />
        </div>
      </form>

      <section
        className={styles.gallerySection}
        aria-labelledby={`submitted-designs-${viewId}`}
        aria-busy={listPending}
      >
        <div className={styles.galleryHeading}>
          <div>
            <h3 id={`submitted-designs-${viewId}`}>등록된 {viewTitle} 시안</h3>
            <p>최근 등록된 순서로 표시합니다.</p>
          </div>
          <span>{items.length}개 표시 중</span>
        </div>

        {items.length === 0 && !listError && !listPending && (
          <div className={styles.emptyState} role="status">
            <strong>아직 등록된 시안이 없습니다.</strong>
            <p>위 편집기에서 첫 HTML/CSS 시안을 등록할 수 있습니다.</p>
          </div>
        )}

        {items.length > 0 && (
          <div className={styles.gallery} role="list" aria-label={`등록된 ${viewTitle} 시안`}>
            {items.map((design) => (
              <div key={design.id} role="listitem">
                <RegisteredDesignCard design={design} />
              </div>
            ))}
          </div>
        )}

        {listPending && <p className={styles.status} role="status">등록 시안을 불러오는 중입니다.</p>}
        {listError && (
          <div className={styles.listError} role="alert">
            <div>
              <strong>등록 시안을 표시할 수 없습니다.</strong>
              <p>{listError}</p>
            </div>
            <button type="button" onClick={retryList} disabled={listPending}>다시 시도</button>
          </div>
        )}
        {nextCursor && !listError && (
          <button
            className={styles.loadMoreButton}
            type="button"
            onClick={() => void loadDesigns(nextCursor, false)}
            disabled={listPending}
          >
            더 보기
          </button>
        )}
      </section>
    </section>
  );
}
