import {
  SHOWCASE_VERSION_REGISTRY,
  SHOWCASE_VIEW_IDS,
  type ShowcaseView,
} from "./showcase-version-registry";
import { withShowcaseDesignUrls } from "./showcase-design-paths";
import type { ShowcaseDesignSource } from "./showcase-design-types";

export interface BuiltInShowcaseSource {
  viewId: ShowcaseView;
  revisionId: string;
  html: string;
  css: string;
}

type BuiltInShowcaseSourceCatalog = Readonly<
  Record<ShowcaseView, Readonly<Record<string, BuiltInShowcaseSource>>>
>;

const STANDALONE_BASE_CSS = `
:root {
  color-scheme: light;
  font-family: Pretendard, "Noto Sans KR", system-ui, sans-serif;
  color: #18221d;
  background: #f4f7f5;
}

* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
}

body {
  padding: 24px;
  background: #f4f7f5;
}

button,
input {
  font: inherit;
}

button {
  color: inherit;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;

const NOTICE_CARD_FOUNDATION_CSS = `
.source-notice-card {
  width: min(100%, 620px);
  margin: 0 auto;
  border: 1px solid #dce5df;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(27, 55, 40, 0.08);
}

.source-notice-card h2,
.source-notice-card h3,
.source-notice-card p,
.source-notice-card dl,
.source-notice-card dd {
  margin: 0;
}

.source-notice-card h2,
.source-notice-card h3 {
  font-size: 19px;
  line-height: 1.45;
  letter-spacing: -0.02em;
}

.source-notice-card__bookmark {
  display: grid;
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid #dce5df;
  border-radius: 10px;
  color: #52635a;
  background: #ffffff;
  font-size: 19px;
}

.source-notice-card__status {
  display: inline-flex;
  align-items: center;
  min-height: 25px;
  padding: 0 9px;
  border-radius: 999px;
  color: #087044;
  background: #e7f7ee;
  font-size: 12px;
  font-weight: 800;
}

.source-notice-card__deadline strong {
  color: #ec5d4e;
}

.source-notice-card__facts {
  display: grid;
  gap: 10px;
}

.source-notice-card__facts div {
  padding: 11px 12px;
  border-radius: 11px;
  background: #f5f8f6;
}

.source-notice-card__facts dt {
  margin-bottom: 5px;
  color: #718078;
  font-size: 11px;
  font-weight: 700;
}

.source-notice-card__facts dd {
  color: #24342b;
  font-size: 13px;
  font-weight: 750;
}

.source-notice-card__meta {
  color: #738078;
  font-size: 12px;
}

@media (max-width: 520px) {
  body {
    padding: 12px;
  }

  .source-notice-card {
    border-radius: 14px;
  }
}
`;

const NOTICE_CARD_A_HTML = `
<article class="source-notice-card notice-card-a" aria-label="성남 청년 행복주택 예비입주자 모집 공고, 접수중, D-3">
  <div class="notice-card-a__topline">
    <p class="notice-card-a__classification">
      <span>행복주택</span>
      <span>예비입주자</span>
    </p>
    <span class="source-notice-card__bookmark" aria-label="저장하지 않음">♡</span>
  </div>
  <h2>성남 청년 행복주택 예비입주자 모집 공고</h2>
  <p class="notice-card-a__location"><strong>경기 성남</strong><span>LH</span></p>
  <div class="notice-card-a__deadline">
    <span class="source-notice-card__status">접수중</span>
    <p><span>접수 마감</span><strong>D-3</strong></p>
  </div>
  <dl class="source-notice-card__facts notice-card-a__facts">
    <div><dt>접수기간</dt><dd>2026.08.10 – 2026.08.11</dd></div>
    <div><dt>공급 세대수</dt><dd>75세대</dd></div>
    <div><dt>조회수</dt><dd>614</dd></div>
  </dl>
</article>
`;

const NOTICE_CARD_A_CSS = `
.notice-card-a {
  padding: 20px;
}

.notice-card-a__topline,
.notice-card-a__location,
.notice-card-a__deadline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.notice-card-a__classification {
  display: flex;
  gap: 6px;
}

.notice-card-a__classification span {
  padding: 5px 8px;
  border-radius: 7px;
  color: #456052;
  background: #eef3f0;
  font-size: 12px;
  font-weight: 750;
}

.notice-card-a h2 {
  margin-top: 14px;
}

.notice-card-a__location {
  justify-content: flex-start;
  margin-top: 8px;
  color: #68766e;
  font-size: 13px;
}

.notice-card-a__location span::before {
  margin-right: 12px;
  content: "·";
}

.notice-card-a__deadline {
  margin-top: 18px;
  padding: 12px 0;
  border-top: 1px solid #e6ece8;
  border-bottom: 1px solid #e6ece8;
}

.notice-card-a__deadline p {
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: #718078;
  font-size: 12px;
}

.notice-card-a__deadline strong {
  font-size: 18px;
}

.notice-card-a__facts {
  grid-template-columns: 1.7fr 1fr 0.8fr;
  margin-top: 14px;
}

@media (max-width: 520px) {
  .notice-card-a__facts {
    grid-template-columns: 1fr 1fr;
  }

  .notice-card-a__facts div:first-child {
    grid-column: 1 / -1;
  }
}
`;

const NOTICE_CARD_B01_HTML = `
<article class="source-notice-card notice-card-b01" aria-label="접수 판단 우선형 공고 카드">
  <header class="notice-card-b01__signal">
    <span class="source-notice-card__status">접수중</span>
    <p class="source-notice-card__deadline"><span>접수 마감</span><strong>D-3</strong></p>
    <span class="source-notice-card__bookmark" aria-hidden="true">♡</span>
  </header>
  <div class="notice-card-b01__body">
    <h2>성남 청년 행복주택 예비입주자 모집 공고</h2>
    <p class="notice-card-b01__classification"><span>행복주택</span><span>예비입주자</span><em>프로토타입 예시</em></p>
    <p class="notice-card-b01__location"><strong>경기 성남</strong><span>LH</span></p>
    <dl class="source-notice-card__facts notice-card-b01__facts">
      <div><dt>접수기간</dt><dd>2026.08.10 – 2026.08.11</dd></div>
      <div><dt>공급 세대수</dt><dd>75세대</dd></div>
    </dl>
    <footer class="notice-card-b01__footer">
      <p>공급 단지 2곳 <span>·</span> 조회 614</p>
      <span>상세 보기 ›</span>
    </footer>
  </div>
</article>
`;

const NOTICE_CARD_B01_CSS = `
.notice-card-b01 {
  overflow: hidden;
}

.notice-card-b01__signal {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  min-height: 64px;
  padding: 12px 16px;
  color: #ffffff;
  background: #216b4d;
}

.notice-card-b01__signal .source-notice-card__status {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.16);
}

.notice-card-b01__signal .source-notice-card__deadline {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 8px;
  font-size: 12px;
}

.notice-card-b01__signal .source-notice-card__deadline strong {
  color: #ffd5cd;
  font-size: 20px;
}

.notice-card-b01__signal .source-notice-card__bookmark {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.34);
  background: transparent;
}

.notice-card-b01__body {
  padding: 18px;
}

.notice-card-b01__classification,
.notice-card-b01__location,
.notice-card-b01__footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-card-b01__classification {
  margin-top: 9px;
  color: #617067;
  font-size: 12px;
}

.notice-card-b01__classification em {
  margin-left: auto;
  color: #89958e;
  font-style: normal;
}

.notice-card-b01__location {
  margin-top: 7px;
  font-size: 13px;
}

.notice-card-b01__location span::before {
  margin-right: 8px;
  color: #a2aea7;
  content: "·";
}

.notice-card-b01__facts {
  grid-template-columns: 1.6fr 1fr;
  margin-top: 16px;
}

.notice-card-b01__footer {
  justify-content: space-between;
  margin-top: 14px;
  color: #66756c;
  font-size: 12px;
}

.notice-card-b01__footer > span {
  color: #176443;
  font-weight: 800;
}
`;

const NOTICE_CARD_C01_HTML = `
<article class="source-notice-card notice-card-c01" aria-label="상태 레일형 컴팩트 브리프">
  <aside class="notice-card-c01__rail">
    <span>접수중</span>
    <strong>D-3</strong>
    <small>접수 마감</small>
  </aside>
  <div class="notice-card-c01__body">
    <div class="notice-card-c01__heading">
      <h2>성남 청년 행복주택 예비입주자 모집 공고</h2>
      <span class="source-notice-card__bookmark" aria-hidden="true">♡</span>
    </div>
    <p class="notice-card-c01__context">행복주택 · 예비입주자</p>
    <p class="notice-card-c01__location">경기 성남 · <strong>LH</strong></p>
    <dl class="source-notice-card__facts notice-card-c01__facts">
      <div><dt>접수기간</dt><dd>2026.08.10 – 2026.08.11</dd></div>
      <div><dt>공급 세대수</dt><dd>75세대</dd></div>
      <div><dt class="sr-only">공급 단지수</dt><dd>공급 단지 2곳</dd></div>
    </dl>
    <footer class="notice-card-c01__footer"><span>프로토타입 예시 · 조회 614</span><strong>상세 보기 ›</strong></footer>
  </div>
</article>
`;

const NOTICE_CARD_C01_CSS = `
.notice-card-c01 {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  overflow: hidden;
}

.notice-card-c01__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 18px 10px;
  color: #ffffff;
  background: #207653;
}

.notice-card-c01__rail span,
.notice-card-c01__rail small {
  font-size: 11px;
  font-weight: 750;
}

.notice-card-c01__rail strong {
  color: #ffd5cd;
  font-size: 25px;
}

.notice-card-c01__body {
  min-width: 0;
  padding: 18px;
}

.notice-card-c01__heading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notice-card-c01__heading h2 {
  flex: 1;
}

.notice-card-c01__context,
.notice-card-c01__location {
  margin-top: 7px;
  color: #607168;
  font-size: 12px;
}

.notice-card-c01__facts {
  grid-template-columns: 1.45fr 0.8fr 0.9fr;
  margin-top: 14px;
}

.notice-card-c01__footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
  color: #78867e;
  font-size: 11px;
}

.notice-card-c01__footer strong {
  color: #176443;
}

@media (max-width: 520px) {
  .notice-card-c01 {
    grid-template-columns: 1fr;
  }

  .notice-card-c01__rail {
    flex-direction: row;
    min-height: 50px;
  }

  .notice-card-c01__facts {
    grid-template-columns: 1fr;
  }
}
`;

const NOTICE_CARD_B02_HTML = `
<article class="source-notice-card notice-card-b02" aria-label="상태 앵커형 가로 브리프">
  <aside class="notice-card-b02__anchor">
    <span>접수중</span>
    <small>접수 마감</small>
    <strong>D-3</strong>
  </aside>
  <div class="notice-card-b02__summary">
    <p class="notice-card-b02__context"><strong>경기 성남 · LH</strong><span>행복주택 · 예비입주자</span></p>
    <div class="notice-card-b02__heading">
      <h2>성남 청년 행복주택 예비입주자 모집 공고</h2>
      <span class="source-notice-card__bookmark" aria-hidden="true">♡</span>
    </div>
    <dl class="source-notice-card__facts notice-card-b02__facts">
      <div><dt>접수기간</dt><dd>2026.08.10 – 2026.08.11</dd></div>
      <div><dt>공급 세대수</dt><dd>75세대</dd></div>
    </dl>
    <footer class="notice-card-b02__footer"><span>프로토타입 예시 · 조회 614 · <strong>공급 단지 2곳</strong></span><b>상세 보기 ›</b></footer>
  </div>
</article>
`;

const NOTICE_CARD_B02_CSS = `
.notice-card-b02 {
  display: grid;
  grid-template-columns: 116px minmax(0, 1fr);
  overflow: hidden;
}

.notice-card-b02__anchor {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 7px;
  padding: 18px;
  color: #ffffff;
  background: #315f4b;
}

.notice-card-b02__anchor span {
  align-self: flex-start;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 11px;
  font-weight: 800;
}

.notice-card-b02__anchor small {
  margin-top: 12px;
  color: #dce9e2;
}

.notice-card-b02__anchor strong {
  color: #ffd4cc;
  font-size: 24px;
}

.notice-card-b02__summary {
  min-width: 0;
  padding: 16px 18px;
}

.notice-card-b02__context {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #6d7b73;
  font-size: 11px;
}

.notice-card-b02__heading {
  display: flex;
  gap: 12px;
  margin-top: 9px;
}

.notice-card-b02__heading h2 {
  flex: 1;
}

.notice-card-b02__facts {
  grid-template-columns: 1.5fr 0.8fr;
  margin-top: 12px;
}

.notice-card-b02__footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  color: #7b8981;
  font-size: 11px;
}

.notice-card-b02__footer b {
  color: #176443;
}

@media (max-width: 520px) {
  .notice-card-b02 {
    grid-template-columns: 1fr;
  }

  .notice-card-b02__anchor {
    flex-direction: row;
    align-items: center;
  }

  .notice-card-b02__anchor small {
    margin: 0 0 0 auto;
  }
}
`;

const NOTICE_CARD_B03_HTML = `
<article class="source-notice-card notice-card-b03" aria-label="이미지 없는 저높이 가로 브리프">
  <div class="notice-card-b03__signal">
    <span class="source-notice-card__status">접수중</span>
    <p class="source-notice-card__deadline"><span>접수 마감</span><strong>D-3</strong></p>
  </div>
  <div class="notice-card-b03__context"><strong>경기 성남 · LH</strong><span>행복주택 · 예비입주자</span></div>
  <div class="notice-card-b03__heading">
    <h2>성남 청년 행복주택 예비입주자 모집 공고</h2>
    <span class="source-notice-card__bookmark" aria-hidden="true">♡</span>
  </div>
  <dl class="notice-card-b03__decision">
    <div><dt>접수기간</dt><dd>2026.08.10 – 2026.08.11</dd></div>
    <div><dt>공급 세대수</dt><dd>75세대</dd></div>
  </dl>
  <footer class="notice-card-b03__footer"><span>프로토타입 예시 · 조회 614 · <strong>공급 단지 2곳</strong></span><b>상세 보기 ›</b></footer>
</article>
`;

const NOTICE_CARD_B03_CSS = `
.notice-card-b03 {
  padding: 15px 17px;
}

.notice-card-b03__signal,
.notice-card-b03__context,
.notice-card-b03__heading,
.notice-card-b03__decision,
.notice-card-b03__footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notice-card-b03__signal {
  justify-content: space-between;
}

.notice-card-b03__signal p {
  display: flex;
  align-items: baseline;
  gap: 7px;
  color: #6a786f;
  font-size: 11px;
}

.notice-card-b03__signal strong {
  font-size: 17px;
}

.notice-card-b03__context {
  margin-top: 8px;
  color: #68766f;
  font-size: 11px;
}

.notice-card-b03__heading {
  align-items: flex-start;
  margin-top: 7px;
}

.notice-card-b03__heading h2 {
  flex: 1;
}

.notice-card-b03__decision {
  margin: 12px 0 0;
}

.notice-card-b03__decision div {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-right: 14px;
  border-right: 1px solid #dfe7e2;
}

.notice-card-b03__decision div:last-child {
  border-right: 0;
}

.notice-card-b03__decision dt {
  color: #7d8a83;
  font-size: 11px;
}

.notice-card-b03__decision dd {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
}

.notice-card-b03__footer {
  justify-content: space-between;
  margin-top: 10px;
  color: #7c8982;
  font-size: 11px;
}

.notice-card-b03__footer b {
  color: #176443;
}

@media (max-width: 520px) {
  .notice-card-b03__decision,
  .notice-card-b03__footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
`;

const NOTICE_CARD_C_HTML = `
<article class="source-notice-card notice-card-c" aria-label="제목 우선 일정 공급 브리프">
  <header class="notice-card-c__heading">
    <h2>성남 청년 행복주택 예비입주자 모집 공고</h2>
    <span class="source-notice-card__bookmark" aria-hidden="true">♡</span>
  </header>
  <div class="notice-card-c__signal">
    <span class="source-notice-card__status">접수중</span>
    <p class="source-notice-card__deadline"><span>접수 마감까지</span><strong>3일</strong></p>
  </div>
  <div class="notice-card-c__context">
    <p>행복주택 · 예비입주자</p>
    <p>경기 성남 · <strong>LH</strong></p>
  </div>
  <div class="notice-card-c__decision">
    <dl class="notice-card-c__period"><div><dt>접수기간</dt><dd><span>2026.08.10부터</span><span>2026.08.11까지</span></dd></div></dl>
    <dl class="notice-card-c__supply">
      <div><dt>공급 단지</dt><dd>2곳</dd></div>
      <div><dt>공급 세대수</dt><dd>75세대</dd></div>
    </dl>
  </div>
  <footer class="source-notice-card__meta">조회 614</footer>
</article>
`;

const NOTICE_CARD_C_CSS = `
.notice-card-c {
  padding: 18px;
}

.notice-card-c__heading,
.notice-card-c__signal,
.notice-card-c__context,
.notice-card-c__decision {
  display: flex;
  gap: 12px;
}

.notice-card-c__heading {
  align-items: flex-start;
}

.notice-card-c__heading h2 {
  flex: 1;
}

.notice-card-c__signal {
  align-items: center;
  margin-top: 13px;
}

.notice-card-c__signal p {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: #68786f;
  font-size: 12px;
}

.notice-card-c__signal strong {
  font-size: 17px;
}

.notice-card-c__context {
  margin-top: 10px;
  color: #64736b;
  font-size: 12px;
}

.notice-card-c__decision {
  margin-top: 16px;
  padding: 14px;
  border-radius: 12px;
  background: #f3f7f4;
}

.notice-card-c__decision dl {
  flex: 1;
  margin: 0;
}

.notice-card-c__decision dt {
  color: #748179;
  font-size: 11px;
}

.notice-card-c__decision dd {
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 800;
}

.notice-card-c__period dd {
  display: grid;
  gap: 3px;
}

.notice-card-c__supply {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.notice-card-c footer {
  margin-top: 12px;
  text-align: right;
}

@media (max-width: 520px) {
  .notice-card-c__decision,
  .notice-card-c__context {
    flex-direction: column;
  }
}
`;

const NOTICE_CARD_B_CURRENT_HTML = `
<article class="source-notice-card notice-card-b-current" aria-label="관심 조건 묶음형 공고 브리프">
  <header class="notice-card-b-current__heading">
    <h2>성남 청년 행복주택 예비입주자 모집 공고</h2>
    <span class="source-notice-card__bookmark" aria-label="저장하지 않음">♡</span>
  </header>
  <div class="notice-card-b-current__signal">
    <span class="source-notice-card__status">접수중</span>
    <p class="source-notice-card__deadline"><span>접수 마감까지</span><strong>3일</strong></p>
  </div>
  <div class="notice-card-b-current__context">
    <p class="notice-card-b-current__region">경기 성남</p>
    <p class="notice-card-b-current__interest"><strong>LH</strong><span>·</span><span>행복주택</span><span>·</span><span>예비입주자</span></p>
  </div>
  <div class="notice-card-b-current__decision">
    <dl class="notice-card-b-current__period"><div><dt>접수기간</dt><dd><span>2026.08.10부터</span><span>2026.08.11까지</span></dd></div></dl>
    <dl class="notice-card-b-current__supply">
      <div><dt>공급 단지</dt><dd>2곳</dd></div>
      <div><dt>공급 세대수</dt><dd>75세대</dd></div>
    </dl>
  </div>
  <footer class="source-notice-card__meta">조회 614</footer>
</article>
`;

const NOTICE_CARD_B_CURRENT_CSS = `
.notice-card-b-current {
  padding: 17px 18px;
}

.notice-card-b-current__heading,
.notice-card-b-current__signal,
.notice-card-b-current__context,
.notice-card-b-current__decision {
  display: flex;
  gap: 12px;
}

.notice-card-b-current__heading {
  align-items: flex-start;
}

.notice-card-b-current__heading h2 {
  flex: 1;
}

.notice-card-b-current__heading .source-notice-card__bookmark {
  width: 32px;
  height: 32px;
  font-size: 17px;
}

.notice-card-b-current__signal {
  align-items: center;
  margin-top: 11px;
}

.notice-card-b-current__signal p {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: #68766e;
  font-size: 12px;
}

.notice-card-b-current__signal strong {
  font-size: 16px;
}

.notice-card-b-current__context {
  align-items: stretch;
  margin-top: 12px;
}

.notice-card-b-current__context p {
  padding: 9px 11px;
  border-radius: 9px;
  font-size: 12px;
}

.notice-card-b-current__region {
  color: #176443;
  background: #eaf6ef;
  font-weight: 850;
}

.notice-card-b-current__interest {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  color: #485a50;
  background: #f2f5f3;
}

.notice-card-b-current__decision {
  align-items: stretch;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e3eae6;
}

.notice-card-b-current__decision dl {
  margin: 0;
}

.notice-card-b-current__period {
  flex: 1.2;
}

.notice-card-b-current__decision dt {
  color: #76837c;
  font-size: 11px;
}

.notice-card-b-current__decision dd {
  margin: 5px 0 0;
  font-size: 13px;
  font-weight: 800;
}

.notice-card-b-current__period dd {
  display: grid;
  gap: 2px;
}

.notice-card-b-current__supply {
  display: grid;
  flex: 1;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

.notice-card-b-current footer {
  margin-top: 10px;
  text-align: right;
}

@media (max-width: 520px) {
  .notice-card-b-current__context,
  .notice-card-b-current__decision {
    flex-direction: column;
  }
}
`;

const LIST_FOUNDATION_CSS = `
.source-list {
  width: min(100%, 680px);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid #dce5df;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(27, 55, 40, 0.08);
}

.source-list p,
.source-list h2,
.source-list h3 {
  margin: 0;
}

.source-list__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 6px;
  border-bottom: 1px solid #e3e9e5;
  background: #f4f7f5;
}

.source-list__tab {
  min-height: 38px;
  border: 0;
  border-radius: 9px;
  color: #718078;
  background: transparent;
  font-size: 13px;
  font-weight: 800;
}

.source-list__tab.is-active {
  color: #176443;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(35, 66, 49, 0.08);
}

.source-list__search-row {
  display: flex;
  gap: 8px;
  padding: 14px 16px 10px;
}

.source-list__search {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #d8e1db;
  border-radius: 11px;
  color: #738078;
  background: #ffffff;
}

.source-list__search input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #26372d;
  background: transparent;
}

.source-list__filter {
  min-width: 72px;
  border: 1px solid #d8e1db;
  border-radius: 11px;
  background: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.source-list__profile {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px;
  padding: 9px 11px;
  border-radius: 10px;
  color: #176443;
  background: #eaf6ef;
  font-size: 12px;
}

.source-list__profile strong {
  flex: 1;
}

.source-list__profile span:last-child {
  text-decoration: underline;
}

.source-list__toolbar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  color: #75827b;
  font-size: 11px;
}

.source-list__cards {
  display: grid;
  gap: 8px;
  max-height: 520px;
  padding: 0 12px 14px;
  overflow: auto;
}

@media (max-width: 520px) {
  .source-list__search-row {
    padding-inline: 12px;
  }

  .source-list__profile {
    margin-inline: 12px;
  }
}
`;

const NOTICE_LIST_HTML = `
<section class="source-list notice-list" aria-label="현재 공고 목록 시안">
  <nav class="source-list__tabs" aria-label="목록 종류">
    <button class="source-list__tab" type="button">단지 목록</button>
    <button class="source-list__tab is-active" type="button" aria-current="page">공고 목록</button>
  </nav>
  <div class="source-list__search-row">
    <label class="source-list__search"><span aria-hidden="true">⌕</span><input type="search" placeholder="공고명·지역·기관 검색" aria-label="공고 검색"></label>
  </div>
  <div class="source-list__profile"><span aria-hidden="true">✦</span><strong>청년 · 1인 · 무주택 기준</strong><span>조건 수정</span></div>
  <div class="source-list__toolbar"><span>공고 검색 결과 18건</span><span>·</span><span>접수예정 포함</span></div>
  <div class="source-list__cards">
    <article class="notice-list__card">
      <div><span class="source-notice-card__status">접수중</span><span class="notice-list__deadline">접수 마감 <strong>D-3</strong></span></div>
      <h3>성남 청년 행복주택 예비입주자 모집 공고</h3>
      <p>경기 성남 · LH · 행복주택 · 예비입주자</p>
      <dl><div><dt>접수기간</dt><dd>2026.08.10 – 2026.08.11</dd></div><div><dt>공급 세대수</dt><dd>75세대</dd></div></dl>
    </article>
    <article class="notice-list__card">
      <div><span class="source-notice-card__status is-upcoming">접수예정</span><span class="notice-list__deadline">접수 마감 <strong>D-11</strong></span></div>
      <h3>위례 포레나 신혼희망타운 입주자 모집 공고</h3>
      <p>경기 성남 · LH · 신혼희망타운 · 입주자</p>
      <dl><div><dt>접수기간</dt><dd>2026.08.17 – 2026.08.19</dd></div><div><dt>공급 세대수</dt><dd>72세대</dd></div></dl>
    </article>
    <article class="notice-list__card">
      <div><span class="source-notice-card__status">접수중</span><span class="notice-list__deadline">접수 마감 <strong>D-4</strong></span></div>
      <h3>위례 센트럴 국민임대 예비입주자 모집 공고</h3>
      <p>경기 성남 · LH · 국민임대 · 예비입주자</p>
      <dl><div><dt>접수기간</dt><dd>2026.08.08 – 2026.08.12</dd></div><div><dt>공급 세대수</dt><dd>35세대</dd></div></dl>
    </article>
  </div>
</section>
`;

const NOTICE_LIST_CSS = `
.notice-list__card {
  padding: 14px 15px;
  border: 1px solid #e0e7e3;
  border-radius: 13px;
  background: #ffffff;
}

.notice-list__card > div:first-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.notice-list__card .source-notice-card__status.is-upcoming {
  color: #6e5314;
  background: #fff4d6;
}

.notice-list__deadline {
  color: #75827b;
  font-size: 11px;
}

.notice-list__deadline strong {
  color: #ec5d4e;
  font-size: 14px;
}

.notice-list__card h3 {
  margin-top: 10px;
  font-size: 15px;
  line-height: 1.45;
}

.notice-list__card p {
  margin-top: 6px;
  color: #6a7971;
  font-size: 11px;
}

.notice-list__card dl {
  display: grid;
  grid-template-columns: 1.6fr 0.8fr;
  gap: 8px;
  margin: 11px 0 0;
}

.notice-list__card dl div {
  padding: 9px 10px;
  border-radius: 9px;
  background: #f4f7f5;
}

.notice-list__card dt {
  color: #77847d;
  font-size: 10px;
}

.notice-list__card dd {
  margin: 4px 0 0;
  font-size: 11px;
  font-weight: 800;
}
`;

const DETAIL_FOUNDATION_CSS = `
.source-detail {
  width: min(100%, 720px);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid #dce5df;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(27, 55, 40, 0.08);
}

.source-detail h1,
.source-detail h2,
.source-detail h3,
.source-detail p,
.source-detail dl,
.source-detail dd {
  margin: 0;
}

.source-detail__header {
  padding: 15px 18px;
  border-bottom: 1px solid #e1e8e4;
  background: #ffffff;
}

.source-detail__header span {
  color: #728078;
  font-size: 11px;
  font-weight: 750;
}

.source-detail__header strong {
  display: block;
  margin-top: 4px;
  font-size: 14px;
}

.source-detail__body {
  display: grid;
  gap: 12px;
  max-height: 720px;
  padding: 16px;
  overflow: auto;
  background: #f4f7f5;
}

.source-detail__section {
  padding: 16px;
  border: 1px solid #e0e7e3;
  border-radius: 13px;
  background: #ffffff;
}

.source-detail__section > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 13px;
}

.source-detail__section h2,
.source-detail__section h3 {
  font-size: 15px;
}

.source-detail__section header p {
  margin-top: 4px;
  color: #748179;
  font-size: 11px;
}

.source-detail__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.source-detail__facts div {
  padding: 10px;
  border-radius: 9px;
  background: #f3f6f4;
}

.source-detail__facts dt {
  color: #75827b;
  font-size: 10px;
}

.source-detail__facts dd {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 800;
}

.source-detail__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.source-detail__chips span {
  padding: 6px 9px;
  border-radius: 999px;
  color: #315f4b;
  background: #eaf6ef;
  font-size: 11px;
  font-weight: 750;
}

@media (max-width: 520px) {
  .source-detail__body {
    padding: 10px;
  }

  .source-detail__facts {
    grid-template-columns: 1fr;
  }
}
`;

const NOTICE_DETAIL_A_HTML = `
<aside class="source-detail notice-detail-a" aria-label="현재 공고 상세 시안">
  <header class="source-detail__header"><span>공고 상세 정보</span><strong>성남 청년 행복주택 예비입주자 모집 공고</strong></header>
  <div class="source-detail__body">
    <section class="notice-detail-a__identity">
      <div><span>행복주택</span><span>접수중</span></div>
      <h1>성남 청년 행복주택 예비입주자 모집 공고</h1>
      <p><strong>LH</strong> · 경기 성남</p>
      <p>경기 성남시 · 2개 공급 단지</p>
    </section>
    <section class="source-detail__section">
      <header><div><h2>공고 핵심 정보</h2></div><div class="notice-detail-a__dday"><span>접수 마감</span><strong>D-3</strong><time>2026.08.11</time></div></header>
      <dl class="source-detail__facts">
        <div><dt>유형</dt><dd>행복주택</dd></div><div><dt>공사</dt><dd>LH</dd></div>
        <div><dt>지역</dt><dd>경기 성남</dd></div><div><dt>조회수</dt><dd>614회</dd></div>
        <div><dt>게시일</dt><dd>2026.08.08</dd></div><div><dt>접수기간</dt><dd>2026.08.10 – 2026.08.11</dd></div>
      </dl>
    </section>
    <section class="source-detail__section"><header><div><h2>공고 대상</h2><p>공고문에 기재된 주요 신청 대상을 정리했습니다.</p></div></header><div class="source-detail__chips"><span>무주택자</span><span>청년</span><span>대학생</span></div></section>
    <section class="source-detail__section">
      <header><div><h2>내 조건으로 본 신청자격</h2><p>청년 · 1인 · 무주택 기준의 간편 비교입니다.</p></div></header>
      <ul class="notice-detail-a__eligibility"><li><strong>무주택 여부</strong><span>조건 일치</span></li><li><strong>가구 유형</strong><span>조건 일치</span></li><li><strong>소득·자산</strong><span>공고문 확인 필요</span></li></ul>
    </section>
    <section class="source-detail__section">
      <header><div><h2>상세 공급 일정</h2><p>입주 예정월 2026.11</p></div></header>
      <ol class="notice-detail-a__schedule"><li><time>2026.08.08</time><strong>공고 게시</strong></li><li class="is-current"><time>2026.08.10 – 08.11</time><strong>접수 기간</strong><span>현재 단계</span></li><li><time>2026.09.01</time><strong>당첨자 발표</strong></li></ol>
    </section>
    <section class="source-detail__section">
      <header><div><h2>공급 단지별 공고 요약</h2><p>총 2개 단지 · 75세대</p></div></header>
      <div class="notice-detail-a__complexes"><article><div class="notice-detail-a__image">단지 조감도</div><h3>위례 새솔 청년 행복주택</h3><p>경기 성남시 수정구 창곡동</p><strong>총 1,046세대 · 공급 48세대</strong></article><article><div class="notice-detail-a__image">단지 조감도</div><h3>판교 봇들마을 청년 행복주택</h3><p>경기 성남시 분당구 삼평동</p><strong>총 794세대 · 공급 27세대</strong></article></div>
    </section>
  </div>
</aside>
`;

const NOTICE_DETAIL_A_CSS = `
.notice-detail-a__identity {
  padding: 18px;
  border-radius: 13px;
  color: #ffffff;
  background: #315f4b;
}

.notice-detail-a__identity > div {
  display: flex;
  gap: 7px;
}

.notice-detail-a__identity > div span {
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  font-size: 11px;
  font-weight: 800;
}

.notice-detail-a__identity h1 {
  margin-top: 12px;
  font-size: 22px;
  line-height: 1.35;
}

.notice-detail-a__identity p {
  margin-top: 8px;
  color: #e2eee7;
  font-size: 12px;
}

.notice-detail-a__dday {
  display: grid;
  text-align: right;
}

.notice-detail-a__dday span,
.notice-detail-a__dday time {
  color: #748179;
  font-size: 10px;
}

.notice-detail-a__dday strong {
  color: #ec5d4e;
  font-size: 21px;
}

.notice-detail-a__eligibility,
.notice-detail-a__schedule {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.notice-detail-a__eligibility li,
.notice-detail-a__schedule li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border-radius: 9px;
  background: #f3f6f4;
  font-size: 11px;
}

.notice-detail-a__eligibility span {
  color: #147047;
  font-weight: 800;
}

.notice-detail-a__schedule time {
  color: #66756d;
}

.notice-detail-a__schedule .is-current {
  border: 1px solid #8dc8aa;
  background: #edf8f1;
}

.notice-detail-a__schedule .is-current span {
  color: #176443;
  font-weight: 800;
}

.notice-detail-a__complexes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

.notice-detail-a__complexes article {
  padding: 11px;
  border: 1px solid #e0e7e3;
  border-radius: 10px;
}

.notice-detail-a__image {
  display: grid;
  height: 80px;
  margin-bottom: 10px;
  place-items: center;
  border-radius: 8px;
  color: #6f7d75;
  background: #dfe9e3;
  font-size: 11px;
}

.notice-detail-a__complexes h3 {
  font-size: 13px;
}

.notice-detail-a__complexes p,
.notice-detail-a__complexes strong {
  display: block;
  margin-top: 5px;
  color: #6f7d75;
  font-size: 10px;
}

.notice-detail-a__complexes strong {
  color: #2e4438;
}

@media (max-width: 520px) {
  .notice-detail-a__complexes {
    grid-template-columns: 1fr;
  }
}
`;

const NOTICE_DETAIL_B_HTML = `
<aside class="source-detail notice-detail-b" aria-label="공고 상세 비교형 시안">
  <header class="notice-detail-b__sticky">
    <div><p><span>행복주택</span><span>접수중</span></p><h1>성남 청년 행복주택 예비입주자 모집 공고</h1></div>
    <strong>D-3</strong>
  </header>
  <div class="source-detail__body">
    <section class="notice-detail-b__intro"><div><strong>LH</strong><span>· 경기 성남</span><p>위례 새솔 청년 행복주택 외 1곳</p></div><span class="notice-detail-b__save">♡ 공고 저장</span></section>
    <section class="source-detail__section">
      <header><div><h2>공고 핵심 정보</h2></div><div class="notice-detail-b__deadline"><span>접수 마감</span><strong>2026.08.11 · D-3</strong></div></header>
      <dl class="source-detail__facts"><div><dt>접수기간</dt><dd>2026.08.10 – 2026.08.11</dd></div><div><dt>공급 규모</dt><dd>2개 단지 · 75세대</dd></div><div><dt>지역</dt><dd>경기 성남</dd></div><div><dt>공사</dt><dd>LH</dd></div></dl>
      <p class="notice-detail-b__meta">게시 2026.08.08 · 조회 614</p>
    </section>
    <section class="source-detail__section"><header><div><h2>신청 대상</h2><p>세부 소득·자산 기준과 최종 신청자격은 공고문에서 확인해 주세요.</p></div></header><div class="source-detail__chips"><span>무주택자</span><span>청년</span><span>대학생</span></div></section>
    <section class="source-detail__section">
      <header><div><h2>접수 일정</h2></div></header>
      <ol class="notice-detail-b__schedule"><li class="is-complete"><strong>공고 게시</strong><time>2026.08.08</time></li><li class="is-current"><strong>접수 기간</strong><time>2026.08.10 – 08.11</time><span>현재 단계</span></li><li><strong>당첨자 발표</strong><time>2026.09.01</time></li><li><strong>입주 예정월</strong><time>2026.11</time></li></ol>
    </section>
    <section class="source-detail__section">
      <header><div><h2>단지 비교</h2><p>주소와 주택형별 면적·임대조건 범위를 비교합니다.</p></div><strong>2개 단지 · 75세대</strong></header>
      <div class="notice-detail-b__complexes"><article><div class="notice-detail-b__image">단지 조감도</div><div><h3>위례 새솔 청년 행복주택</h3><p>경기 성남시 수정구 창곡동</p><dl><div><dt>전용면적</dt><dd>33.01–39.86㎡</dd></div><div><dt>월 임대료</dt><dd>12.8–15.8만 원</dd></div></dl></div></article><article><div class="notice-detail-b__image">단지 조감도</div><div><h3>판교 봇들마을 청년 행복주택</h3><p>경기 성남시 분당구 삼평동</p><dl><div><dt>전용면적</dt><dd>33.01–39.86㎡</dd></div><div><dt>월 임대료</dt><dd>15.4–18.4만 원</dd></div></dl></div></article></div>
    </section>
    <section class="source-detail__section">
      <header><div><h2>주택형 비교</h2><p>위례 새솔 청년 행복주택</p></div></header>
      <div class="notice-detail-b__types"><article><strong>45A · 투룸</strong><span>신규공급 · 12세대</span><dl><div><dt>전용면적</dt><dd>33.01㎡</dd></div><div><dt>보증금</dt><dd>3,240만 원</dd></div><div><dt>월세</dt><dd>12.8만 원</dd></div></dl><span class="notice-detail-b__plan">평면도 보기</span></article><article><strong>55A · 쓰리룸</strong><span>재공급 · 12세대</span><dl><div><dt>전용면적</dt><dd>39.72㎡</dd></div><div><dt>보증금</dt><dd>4,140만 원</dd></div><div><dt>월세</dt><dd>14.8만 원</dd></div></dl><span class="notice-detail-b__plan">평면도 보기</span></article></div>
    </section>
  </div>
  <footer class="notice-detail-b__documents"><span>PDF 링크 확인 중</span><span>공고문 링크 확인 중</span></footer>
</aside>
`;

const NOTICE_DETAIL_B_CSS = `
.notice-detail-b__sticky {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid #dce5df;
  background: #ffffff;
}

.notice-detail-b__sticky p {
  display: flex;
  gap: 6px;
}

.notice-detail-b__sticky p span {
  padding: 4px 7px;
  border-radius: 999px;
  color: #176443;
  background: #eaf6ef;
  font-size: 10px;
  font-weight: 800;
}

.notice-detail-b__sticky h1 {
  margin-top: 6px;
  font-size: 15px;
}

.notice-detail-b__sticky > strong {
  color: #ec5d4e;
  font-size: 21px;
}

.notice-detail-b__intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #315f4b;
  color: #ffffff;
  font-size: 12px;
}

.notice-detail-b__intro p {
  margin-top: 6px;
  color: #dfece5;
}

.notice-detail-b__save {
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 8px;
  white-space: nowrap;
  font-weight: 800;
}

.notice-detail-b__deadline {
  display: grid;
  gap: 3px;
  color: #718078;
  font-size: 10px;
  text-align: right;
}

.notice-detail-b__deadline strong {
  color: #34483d;
  font-size: 12px;
}

.notice-detail-b__meta {
  margin-top: 9px;
  color: #7a8780;
  font-size: 10px;
  text-align: right;
}

.notice-detail-b__schedule {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.notice-detail-b__schedule li {
  display: grid;
  gap: 5px;
  min-height: 74px;
  padding: 9px;
  border-radius: 9px;
  background: #f3f6f4;
  font-size: 10px;
}

.notice-detail-b__schedule time {
  color: #68766e;
}

.notice-detail-b__schedule .is-current {
  border: 1px solid #8bc9aa;
  background: #edf8f1;
}

.notice-detail-b__schedule .is-current span {
  color: #176443;
  font-weight: 800;
}

.notice-detail-b__complexes,
.notice-detail-b__types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

.notice-detail-b__complexes article {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 10px;
  padding: 10px;
  border: 1px solid #e0e7e3;
  border-radius: 10px;
}

.notice-detail-b__image {
  display: grid;
  min-height: 100px;
  place-items: center;
  border-radius: 8px;
  color: #6f7d75;
  background: #dfe9e3;
  font-size: 10px;
}

.notice-detail-b__complexes h3 {
  font-size: 12px;
}

.notice-detail-b__complexes p {
  margin-top: 5px;
  color: #75827b;
  font-size: 9px;
}

.notice-detail-b__complexes dl,
.notice-detail-b__types dl {
  display: grid;
  gap: 5px;
  margin-top: 8px;
}

.notice-detail-b__complexes dl div,
.notice-detail-b__types dl div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 9px;
}

.notice-detail-b__complexes dd,
.notice-detail-b__types dd {
  font-weight: 800;
}

.notice-detail-b__types article {
  display: grid;
  gap: 6px;
  padding: 11px;
  border: 1px solid #e0e7e3;
  border-radius: 10px;
  font-size: 10px;
}

.notice-detail-b__types article > strong {
  font-size: 12px;
}

.notice-detail-b__types article > span {
  color: #68766e;
}

.notice-detail-b__plan {
  justify-self: start;
  padding: 6px 8px;
  border-radius: 7px;
  color: #176443 !important;
  background: #eaf6ef;
  font-weight: 800;
}

.notice-detail-b__documents {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #dce5df;
  background: #ffffff;
}

.notice-detail-b__documents span {
  padding: 10px;
  border-radius: 9px;
  color: #7a8780;
  background: #f1f4f2;
  font-size: 11px;
  text-align: center;
}

@media (max-width: 620px) {
  .notice-detail-b__schedule,
  .notice-detail-b__complexes,
  .notice-detail-b__types {
    grid-template-columns: 1fr;
  }
}
`;

const COMPLEX_CARD_HTML = `
<article class="complex-card" aria-label="위례 새솔 청년 행복주택, 36.21제곱미터, 월 12만 8천 원">
  <div class="complex-card__media" role="img" aria-label="위례 새솔 청년 행복주택 단지 이미지">
    <div><span>접수중</span><strong>D-3</strong></div>
    <small>단지 이미지</small>
  </div>
  <section class="complex-card__summary">
    <div class="complex-card__topline"><p>경기 성남시 수정구</p><span aria-label="저장하지 않음">♡</span></div>
    <h2>위례 새솔 청년 행복주택</h2>
    <p class="complex-card__operator"><strong>LH</strong><span>행복주택</span></p>
    <div class="complex-card__tags"><span>전용 36.21㎡</span><span>준공 2020.01</span></div>
  </section>
  <aside class="complex-card__conditions" aria-label="주요 임대 조건">
    <p>주요 임대 조건</p>
    <div><span>임대보증금</span><strong>3,240만 원</strong></div>
    <div><span>월 임대료</span><strong>12만 8천 원</strong></div>
    <span class="complex-card__action">공고 확인</span>
  </aside>
</article>
`;

const COMPLEX_CARD_CSS = `
.complex-card {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) 150px;
  width: min(100%, 760px);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid #dbe4de;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(27, 55, 40, 0.08);
}

.complex-card h2,
.complex-card p {
  margin: 0;
}

.complex-card__media {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 205px;
  padding: 14px;
  color: #ffffff;
  background: linear-gradient(145deg, #5c7668, #a9bbb1);
}

.complex-card__media > div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.complex-card__media span,
.complex-card__media strong {
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(20, 48, 34, 0.6);
  font-size: 11px;
}

.complex-card__media strong {
  color: #ffd4cc;
}

.complex-card__media small {
  font-weight: 750;
}

.complex-card__summary {
  min-width: 0;
  padding: 18px;
}

.complex-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.complex-card__topline p {
  color: #607168;
  font-size: 12px;
}

.complex-card__topline > span {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid #dce5df;
  border-radius: 9px;
  font-size: 18px;
}

.complex-card__summary h2 {
  margin-top: 12px;
  font-size: 19px;
}

.complex-card__operator {
  display: flex;
  gap: 8px;
  margin-top: 9px !important;
  color: #40564a;
  font-size: 12px;
}

.complex-card__operator span::before {
  margin-right: 8px;
  content: "·";
}

.complex-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.complex-card__tags span {
  padding: 6px 8px;
  border-radius: 7px;
  color: #5d6c64;
  background: #f0f4f1;
  font-size: 11px;
}

.complex-card__conditions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-left: 1px solid #e0e7e3;
  background: #f7f9f8;
}

.complex-card__conditions > p {
  color: #6d7b73;
  font-size: 11px;
  font-weight: 800;
}

.complex-card__conditions div {
  display: grid;
  gap: 4px;
}

.complex-card__conditions div span {
  color: #7a8780;
  font-size: 10px;
}

.complex-card__conditions div strong {
  font-size: 12px;
}

.complex-card__action {
  margin-top: auto;
  padding: 9px;
  border-radius: 9px;
  color: #ffffff;
  background: #216b4d;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
}

@media (max-width: 640px) {
  .complex-card {
    grid-template-columns: 116px minmax(0, 1fr);
  }

  .complex-card__conditions {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid #e0e7e3;
    border-left: 0;
  }

  .complex-card__conditions > p,
  .complex-card__action {
    grid-column: 1 / -1;
  }
}
`;

const COMPLEX_LIST_HTML = `
<section class="source-list complex-list" aria-label="현재 단지 목록 시안">
  <nav class="source-list__tabs" aria-label="목록 종류">
    <button class="source-list__tab is-active" type="button" aria-current="page">단지 목록</button>
    <button class="source-list__tab" type="button">공고 목록</button>
  </nav>
  <div class="source-list__search-row">
    <label class="source-list__search"><span aria-hidden="true">⌕</span><input type="search" placeholder="지역·역·단지명 검색" aria-label="단지 검색"></label>
    <button class="source-list__filter" type="button">필터</button>
  </div>
  <div class="source-list__profile"><span aria-hidden="true">✦</span><strong>청년 · 1인 · 무주택 기준</strong><span>조건 수정</span></div>
  <div class="source-list__toolbar"><span>현재 지도 영역 기준</span><span>·</span><span>모집예정 포함</span></div>
  <div class="source-list__cards">
    <article class="complex-list__card is-selected"><div class="complex-list__media"><span>접수중</span><strong>D-3</strong></div><div class="complex-list__body"><p>경기 성남시 수정구</p><h3>위례 새솔 청년 행복주택</h3><span>LH · 행복주택</span><dl><div><dt>전용면적</dt><dd>36.21㎡</dd></div><div><dt>임대보증금</dt><dd>3,240만 원</dd></div><div><dt>월 임대료</dt><dd>12만 8천 원</dd></div></dl></div></article>
    <article class="complex-list__card"><div class="complex-list__media"><span class="is-upcoming">모집예정</span><strong>D-9</strong></div><div class="complex-list__body"><p>경기 성남시 수정구</p><h3>위례 포레나 신혼희망타운</h3><span>LH · 신혼희망타운</span><dl><div><dt>전용면적</dt><dd>55.83㎡</dd></div><div><dt>임대보증금</dt><dd>7,850만 원</dd></div><div><dt>월 임대료</dt><dd>21만 4천 원</dd></div></dl></div></article>
    <article class="complex-list__card"><div class="complex-list__media"><span>접수중</span><strong>D-4</strong></div><div class="complex-list__body"><p>경기 성남시 수정구</p><h3>위례 센트럴 국민임대</h3><span>LH · 국민임대</span><dl><div><dt>전용면적</dt><dd>46.72㎡</dd></div><div><dt>임대보증금</dt><dd>4,680만 원</dd></div><div><dt>월 임대료</dt><dd>17만 6천 원</dd></div></dl></div></article>
  </div>
</section>
`;

const COMPLEX_LIST_CSS = `
.complex-list__card {
  display: grid;
  grid-template-columns: 116px minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid #e0e7e3;
  border-radius: 13px;
  background: #ffffff;
}

.complex-list__card.is-selected {
  border-color: #6eaf8d;
  box-shadow: 0 0 0 2px rgba(65, 141, 101, 0.12);
}

.complex-list__media {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 144px;
  padding: 11px;
  color: #ffffff;
  background: linear-gradient(145deg, #61786c, #b3c1b9);
}

.complex-list__media span,
.complex-list__media strong {
  padding: 5px 7px;
  border-radius: 999px;
  background: rgba(24, 52, 38, 0.68);
  font-size: 10px;
}

.complex-list__media .is-upcoming {
  color: #533e0d;
  background: #ffeaa7;
}

.complex-list__media strong {
  color: #ffd4cc;
}

.complex-list__body {
  min-width: 0;
  padding: 13px;
}

.complex-list__body p,
.complex-list__body > span {
  color: #6f7d75;
  font-size: 10px;
}

.complex-list__body h3 {
  margin-top: 6px;
  font-size: 14px;
}

.complex-list__body > span {
  display: block;
  margin-top: 5px;
}

.complex-list__body dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin: 10px 0 0;
}

.complex-list__body dl div {
  padding: 7px;
  border-radius: 7px;
  background: #f2f5f3;
}

.complex-list__body dt {
  color: #7a8780;
  font-size: 9px;
}

.complex-list__body dd {
  margin: 3px 0 0;
  font-size: 10px;
  font-weight: 800;
}

@media (max-width: 520px) {
  .complex-list__card {
    grid-template-columns: 92px minmax(0, 1fr);
  }

  .complex-list__body dl {
    grid-template-columns: 1fr;
  }
}
`;

const COMPLEX_DETAIL_HTML = `
<aside class="source-detail complex-detail" aria-label="위례 새솔 청년 행복주택 단지 상세 정보">
  <header class="source-detail__header"><span>단지 상세 정보</span><strong>위례 새솔 청년 행복주택</strong></header>
  <div class="source-detail__body">
    <section class="complex-detail__hero" role="img" aria-label="위례 새솔 청년 행복주택 단지 사진"><span>단지 사진</span></section>
    <section class="complex-detail__identity"><p><strong>LH</strong> · 행복주택</p><h1>위례 새솔 청년 행복주택</h1><p>경기 성남시 수정구 창곡동 두꺼비로 80</p></section>
    <section class="source-detail__section">
      <header><div><h2>모집 요약 정보</h2><p>공고문에서 지원 판단에 필요한 내용만 정리했어요.</p></div></header>
      <div class="complex-detail__recruitment"><div><span>접수중</span><p><small>접수 마감 · 2026.08.11</small><strong>D-3</strong></p></div><dl><div><dt>접수 기간</dt><dd>2026.08.10 – 2026.08.11</dd></div><div><dt>공고 대상</dt><dd>청년 · 대학생</dd></div><div><dt>가장 최근 경쟁률</dt><dd>7.9 : 1</dd></div></dl><span>공고상세 페이지 바로가기</span></div>
    </section>
    <section class="source-detail__section">
      <header><div><h2>단지 기본 정보</h2><p>건물 특성과 단지 규모를 한눈에 확인하세요.</p></div></header>
      <dl class="source-detail__facts"><div><dt>단지명</dt><dd>위례 새솔 청년 행복주택</dd></div><div><dt>공급기관</dt><dd>LH</dd></div><div><dt>임대종류</dt><dd>행복주택</dd></div><div><dt>준공일자</dt><dd>2020.01</dd></div><div><dt>건물형태</dt><dd>아파트</dd></div><div><dt>엘리베이터</dt><dd>있음</dd></div><div><dt>난방종류</dt><dd>지역난방</dd></div><div><dt>공급 면적</dt><dd>49.97㎡</dd></div><div><dt>총세대수</dt><dd>1,046세대</dd></div><div><dt>총주차대수(세대당)</dt><dd>1,130대 (1.1대)</dd></div></dl>
    </section>
    <section class="source-detail__section">
      <header><div><h2>주택형 정보</h2><p>선택 주택형의 평면도와 상세 조건입니다.</p></div></header>
      <div class="complex-detail__tabs"><span>45A</span><span>45B</span><span>55A</span><span class="is-active">55B</span></div>
      <div class="complex-detail__housing"><div class="complex-detail__floor-plan"><span>침실 1</span><span>거실</span><span>주방</span><span>침실 2</span><span>욕실</span><span>발코니</span></div><dl class="source-detail__facts"><div><dt>주택형</dt><dd>55B</dd></div><div><dt>공급 면적</dt><dd>55.2㎡</dd></div><div><dt>전용 면적</dt><dd>39.86㎡</dd></div><div><dt>임대보증금</dt><dd>4,340만 원</dd></div><div><dt>월세</dt><dd>월 15만 8천 원</dd></div><div><dt>관리비</dt><dd>월 평균 11만 원</dd></div></dl></div>
    </section>
    <section class="source-detail__section"><header><div><h2>주변 생활 시설</h2><p>단지를 기준으로 시설별 예상 이동 시간입니다.</p></div></header><ul class="complex-detail__facilities"><li><strong>CU 창곡점</strong><span>도보 3분</span></li><li><strong>런드리24 창곡점</strong><span>도보 5분</span></li><li><strong>창곡동 주거단지 정류장</strong><span>도보 4분</span></li></ul></section>
  </div>
</aside>
`;

const COMPLEX_DETAIL_CSS = `
.complex-detail__hero {
  display: grid;
  min-height: 190px;
  place-items: end start;
  padding: 16px;
  border-radius: 13px;
  color: #ffffff;
  background: linear-gradient(145deg, #506e5e, #b6c5bd);
  font-size: 12px;
  font-weight: 800;
}

.complex-detail__identity {
  padding: 5px 4px;
}

.complex-detail__identity h1 {
  margin-top: 8px;
  font-size: 23px;
}

.complex-detail__identity p {
  margin-top: 7px;
  color: #697870;
  font-size: 12px;
}

.complex-detail__recruitment {
  display: grid;
  gap: 10px;
  padding: 13px;
  border-radius: 11px;
  background: #f3f7f4;
}

.complex-detail__recruitment > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.complex-detail__recruitment > div > span {
  padding: 5px 8px;
  border-radius: 999px;
  color: #176443;
  background: #e1f4e8;
  font-size: 10px;
  font-weight: 800;
}

.complex-detail__recruitment > div p {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.complex-detail__recruitment > div strong {
  color: #ec5d4e;
  font-size: 20px;
}

.complex-detail__recruitment dl {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 7px;
  margin: 0;
}

.complex-detail__recruitment dl div {
  padding: 8px;
  border-radius: 8px;
  background: #ffffff;
}

.complex-detail__recruitment dt {
  color: #748179;
  font-size: 9px;
}

.complex-detail__recruitment dd {
  margin: 4px 0 0;
  font-size: 10px;
  font-weight: 800;
}

.complex-detail__recruitment > span {
  justify-self: start;
  color: #176443;
  font-size: 11px;
  font-weight: 800;
}

.complex-detail__tabs {
  display: flex;
  gap: 6px;
}

.complex-detail__tabs span {
  padding: 7px 11px;
  border: 1px solid #dce5df;
  border-radius: 8px;
  color: #6a786f;
  font-size: 11px;
  font-weight: 800;
}

.complex-detail__tabs .is-active {
  color: #ffffff;
  border-color: #216b4d;
  background: #216b4d;
}

.complex-detail__housing {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 10px;
  margin-top: 10px;
}

.complex-detail__floor-plan {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  min-height: 210px;
  padding: 9px;
  border: 2px solid #b9c8c0;
  border-radius: 10px;
  background: #edf2ef;
}

.complex-detail__floor-plan span {
  display: grid;
  place-items: center;
  border: 1px solid #cbd7d0;
  border-radius: 5px;
  color: #5f7067;
  background: #ffffff;
  font-size: 9px;
}

.complex-detail__facilities {
  display: grid;
  gap: 7px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.complex-detail__facilities li {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background: #f3f6f4;
  font-size: 11px;
}

.complex-detail__facilities span {
  color: #64736b;
}

@media (max-width: 520px) {
  .complex-detail__recruitment dl,
  .complex-detail__housing {
    grid-template-columns: 1fr;
  }
}
`;

const MAP_MARKER_HTML = `
<section class="marker-board" aria-label="현재 지도 마커 시안">
  <article><span>접수중</span><div class="housing-marker is-open"><small>LH · 마감 D-3</small><p><strong>36.21㎡</strong><b>월 12만 8천 원</b></p></div></article>
  <article><span>모집예정</span><div class="housing-marker is-upcoming"><small>LH · 모집예정</small><p><strong>55.83㎡</strong><b>월 21만 4천 원</b></p></div></article>
  <article><span>상시모집</span><div class="housing-marker is-always"><small>GH · 상시모집</small><p><strong>39.72㎡</strong><b>월 16만 원</b></p></div></article>
  <article><span>접수마감</span><div class="housing-marker is-closed"><small>LH · 접수마감</small><p><strong>46.72㎡</strong><b>월 17만 6천 원</b></p></div></article>
  <article><span>선택 상태</span><div class="housing-marker is-open is-selected"><small>LH · 마감 D-3</small><p><strong>36.21㎡</strong><b>월 12만 8천 원</b></p></div></article>
  <article><span>지역 클러스터</span><div class="cluster-marker"><span>성남시</span><strong>16곳</strong></div></article>
</section>
`;

const MAP_MARKER_CSS = `
.marker-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(170px, 1fr));
  gap: 14px;
  width: min(100%, 760px);
  margin: 0 auto;
}

.marker-board article {
  display: grid;
  min-height: 170px;
  padding: 14px;
  place-items: center;
  border: 1px solid #dce5df;
  border-radius: 15px;
  background: #ffffff;
}

.marker-board article > span {
  align-self: start;
  color: #6e7c74;
  font-size: 11px;
  font-weight: 800;
}

.housing-marker {
  position: relative;
  min-width: 122px;
  border: 2px solid #2b7655;
  border-radius: 12px;
  color: #ffffff;
  background: #2b7655;
  box-shadow: 0 8px 18px rgba(28, 67, 47, 0.22);
}

.housing-marker::after {
  position: absolute;
  bottom: -9px;
  left: 50%;
  width: 16px;
  height: 16px;
  border-right: 2px solid #2b7655;
  border-bottom: 2px solid #2b7655;
  background: #ffffff;
  content: "";
  transform: translateX(-50%) rotate(45deg);
}

.housing-marker small {
  display: block;
  padding: 6px 9px;
  font-size: 9px;
  font-weight: 800;
  text-align: center;
}

.housing-marker p {
  display: grid;
  grid-template-columns: auto auto;
  gap: 8px;
  padding: 8px 9px;
  margin: 0;
  border-radius: 0 0 9px 9px;
  color: #26382e;
  background: #ffffff;
  font-size: 10px;
}

.housing-marker.is-upcoming {
  border-color: #8a6b25;
  background: #8a6b25;
}

.housing-marker.is-upcoming::after {
  border-color: #8a6b25;
}

.housing-marker.is-always {
  border-color: #316c80;
  background: #316c80;
}

.housing-marker.is-always::after {
  border-color: #316c80;
}

.housing-marker.is-closed {
  border-color: #758079;
  background: #758079;
  opacity: 0.72;
}

.housing-marker.is-closed::after {
  border-color: #758079;
}

.housing-marker.is-selected {
  outline: 4px solid rgba(43, 118, 85, 0.24);
  transform: translateY(-5px) scale(1.06);
}

.cluster-marker {
  display: grid;
  width: 82px;
  height: 68px;
  place-items: center;
  align-content: center;
  border: 3px solid #ffffff;
  border-radius: 50%;
  color: #ffffff;
  background: #294e67;
  box-shadow: 0 8px 18px rgba(30, 55, 72, 0.25);
}

.cluster-marker span {
  font-size: 11px;
}

.cluster-marker strong {
  margin-top: 2px;
  font-size: 16px;
}

@media (max-width: 640px) {
  .marker-board {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }
}
`;

const TOP_BAR_HTML = `
<header class="source-top-bar" aria-label="현재 상단 바 시안">
  <div class="source-top-bar__brand" aria-label="두꺼비집 홈"><span aria-hidden="true">⌂</span><strong>두꺼비집</strong><small>공공임대 지도</small></div>
  <span class="source-top-bar__prototype">지도 전체 시안 <b>시안 A</b></span>
  <nav class="source-top-bar__actions" aria-label="헤더 바로가기"><span>▦ 요소 UI 비교</span><span>♡ 저장한 집</span></nav>
</header>
`;

const TOP_BAR_CSS = `
body {
  display: grid;
  align-items: start;
}

.source-top-bar {
  display: flex;
  align-items: center;
  gap: 18px;
  width: min(100%, 1080px);
  min-width: 680px;
  min-height: 66px;
  margin: 0 auto;
  padding: 10px 14px;
  border: 1px solid #dce5df;
  border-radius: 15px;
  background: #ffffff;
  box-shadow: 0 10px 26px rgba(27, 55, 40, 0.09);
}

.source-top-bar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.source-top-bar__brand > span {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 11px;
  color: #ffffff;
  background: #216b4d;
  font-size: 22px;
}

.source-top-bar__brand strong {
  font-size: 18px;
}

.source-top-bar__brand small {
  padding-left: 8px;
  border-left: 1px solid #dce5df;
  color: #738078;
  font-size: 11px;
}

.source-top-bar__prototype {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  margin-left: auto;
  padding: 0 11px;
  border: 1px solid #d8e1db;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
}

.source-top-bar__prototype b {
  padding: 4px 6px;
  border-radius: 6px;
  color: #176443;
  background: #eaf6ef;
  font-size: 10px;
}

.source-top-bar__actions {
  display: flex;
  gap: 7px;
}

.source-top-bar__actions span {
  display: flex;
  align-items: center;
  min-height: 38px;
  padding: 0 11px;
  border: 1px solid #d8e1db;
  border-radius: 10px;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 800;
}

@media (max-width: 760px) {
  body {
    overflow-x: auto;
  }
}
`;

export const BUILT_IN_SHOWCASE_SOURCES: readonly BuiltInShowcaseSource[] = [
  createBuiltInSource(
    "notice-card",
    "notice-card-a-current",
    NOTICE_CARD_A_HTML,
    NOTICE_CARD_FOUNDATION_CSS,
    NOTICE_CARD_A_CSS,
  ),
  createBuiltInSource(
    "notice-card",
    "b-01",
    NOTICE_CARD_B01_HTML,
    NOTICE_CARD_FOUNDATION_CSS,
    NOTICE_CARD_B01_CSS,
  ),
  createBuiltInSource(
    "notice-card",
    "c-01",
    NOTICE_CARD_C01_HTML,
    NOTICE_CARD_FOUNDATION_CSS,
    NOTICE_CARD_C01_CSS,
  ),
  createBuiltInSource(
    "notice-card",
    "b-02",
    NOTICE_CARD_B02_HTML,
    NOTICE_CARD_FOUNDATION_CSS,
    NOTICE_CARD_B02_CSS,
  ),
  createBuiltInSource(
    "notice-card",
    "b-03",
    NOTICE_CARD_B03_HTML,
    NOTICE_CARD_FOUNDATION_CSS,
    NOTICE_CARD_B03_CSS,
  ),
  createBuiltInSource(
    "notice-card",
    "c",
    NOTICE_CARD_C_HTML,
    NOTICE_CARD_FOUNDATION_CSS,
    NOTICE_CARD_C_CSS,
  ),
  createBuiltInSource(
    "notice-card",
    "notice-card-b-current",
    NOTICE_CARD_B_CURRENT_HTML,
    NOTICE_CARD_FOUNDATION_CSS,
    NOTICE_CARD_B_CURRENT_CSS,
  ),
  createBuiltInSource(
    "notice-list",
    "notice-list-a-current",
    NOTICE_LIST_HTML,
    NOTICE_CARD_FOUNDATION_CSS,
    LIST_FOUNDATION_CSS,
    NOTICE_LIST_CSS,
  ),
  createBuiltInSource(
    "notice-detail",
    "notice-detail-a-current",
    NOTICE_DETAIL_A_HTML,
    DETAIL_FOUNDATION_CSS,
    NOTICE_DETAIL_A_CSS,
  ),
  createBuiltInSource(
    "notice-detail",
    "notice-detail-b-current",
    NOTICE_DETAIL_B_HTML,
    DETAIL_FOUNDATION_CSS,
    NOTICE_DETAIL_B_CSS,
  ),
  createBuiltInSource(
    "complex-card",
    "complex-card-a-current",
    COMPLEX_CARD_HTML,
    COMPLEX_CARD_CSS,
  ),
  createBuiltInSource(
    "complex-list",
    "complex-list-a-current",
    COMPLEX_LIST_HTML,
    LIST_FOUNDATION_CSS,
    COMPLEX_LIST_CSS,
  ),
  createBuiltInSource(
    "complex-detail",
    "complex-detail-a-current",
    COMPLEX_DETAIL_HTML,
    DETAIL_FOUNDATION_CSS,
    COMPLEX_DETAIL_CSS,
  ),
  createBuiltInSource(
    "map-marker",
    "map-marker-a-current",
    MAP_MARKER_HTML,
    MAP_MARKER_CSS,
  ),
  createBuiltInSource(
    "top-bar",
    "top-bar-a-current",
    TOP_BAR_HTML,
    TOP_BAR_CSS,
  ),
];

export const BUILT_IN_SHOWCASE_SOURCE_BY_ID = indexSourcesById(
  BUILT_IN_SHOWCASE_SOURCES,
);

export const BUILT_IN_SHOWCASE_SOURCE_CATALOG = indexSourcesByView(
  BUILT_IN_SHOWCASE_SOURCES,
);

export function getBuiltInShowcaseSource(
  viewId: ShowcaseView,
  revisionId: string,
) {
  return BUILT_IN_SHOWCASE_SOURCE_CATALOG[viewId][revisionId] ?? null;
}

export function getBuiltInShowcaseSourceById(revisionId: string) {
  return BUILT_IN_SHOWCASE_SOURCE_BY_ID[revisionId] ?? null;
}

export function getBuiltInShowcaseSources(viewId: ShowcaseView) {
  return SHOWCASE_VERSION_REGISTRY[viewId].revisions.flatMap((revision) => {
    const source = getBuiltInShowcaseSource(viewId, revision.id);
    return source ? [source] : [];
  });
}

export function getBuiltinShowcaseDesignSource(
  revisionId: string,
): ShowcaseDesignSource | null {
  const source = getBuiltInShowcaseSourceById(revisionId);
  if (!source) return null;
  const revision = SHOWCASE_VERSION_REGISTRY[source.viewId].revisions.find((item) => {
    return item.id === revisionId;
  });
  if (!revision) return null;
  return {
    ...withShowcaseDesignUrls({
      id: revision.id,
      sourceKind: "builtin",
      viewId: source.viewId,
      sequence: revision.sequence,
      title: revision.title,
      description: revision.summary,
      createdAt: null,
    }),
    html: source.html,
    css: source.css,
  };
}

function createBuiltInSource(
  viewId: ShowcaseView,
  revisionId: string,
  html: string,
  ...cssSections: readonly string[]
): BuiltInShowcaseSource {
  return Object.freeze({
    viewId,
    revisionId,
    html: html.trim(),
    css: [STANDALONE_BASE_CSS, ...cssSections]
      .map((section) => section.trim())
      .join("\n\n"),
  });
}

function indexSourcesById(sources: readonly BuiltInShowcaseSource[]) {
  const entries = sources.map((source) => [source.revisionId, source] as const);
  const indexed = Object.fromEntries(entries);
  if (Object.keys(indexed).length !== sources.length) {
    throw new Error("기존 시안 source의 revision id는 전역에서 중복될 수 없습니다.");
  }
  return Object.freeze(indexed) as Readonly<Record<string, BuiltInShowcaseSource>>;
}

function indexSourcesByView(
  sources: readonly BuiltInShowcaseSource[],
): BuiltInShowcaseSourceCatalog {
  const entries = SHOWCASE_VIEW_IDS.map((viewId) => {
    const viewSources = sources
      .filter((source) => source.viewId === viewId)
      .map((source) => [source.revisionId, source] as const);
    return [viewId, Object.freeze(Object.fromEntries(viewSources))] as const;
  });
  return Object.freeze(Object.fromEntries(entries)) as BuiltInShowcaseSourceCatalog;
}
