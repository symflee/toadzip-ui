# toadzip-ui

공공주택 모집공고 UI를 화면 요소별로 비교하고 공유하는 **두꺼비집 UI 시안 보관함**입니다.

주요 화면은 고정된 예시 데이터로 동작합니다. 요소 시안 보드에는 기존 React 시안과 별도로
HTML/CSS 시안을 등록하고 공유하는 Neon 저장 영역을 연결할 수 있습니다. 등록 기능은
`DATABASE_URL`이 없는 환경에서도 기존 화면을 유지하며, 등록 영역만 저장소 미연결 상태로
표시됩니다.

## 제공 화면

- 지도·목록·상세 패널을 함께 보는 전체 탐색 프로토타입
- 지도 전체 구도를 위한 시안 A/B/C 선택 영역
- 단지 목록 카드·목록·상세 UI
- 공고 목록 카드 UI
- 공고 목록 UI
- 공고 상세 UI
- 지도 마커와 상단 바 UI
- 화면별 시안 A/B/C 동시 비교
- 기존 A/B/C·과거 시안 15개의 대표 상태 HTML/CSS 보기·복사·다운로드
- 요소별 HTML/CSS 작성, 격리 미리보기와 등록 시안 최신순 목록

현재 UI는 각 화면의 시안 A에 배치되어 있습니다. 공고 목록 카드와 공고 상세에는 신규 제안
B도 있으며, 공고 상세 C와 나머지 화면의 B/C는 이후 시안을 추가할 수 있는 빈 자리입니다.

## 실행

```bash
npm ci
npm run dev
```

Node.js 22.x를 사용합니다.

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 지도 포함 전체 프로토타입이 표시됩니다.

메인 화면의 `지도 전체 시안`은 전체 지도 화면용 A/B/C 자리입니다. `요소 UI 비교`는
`/showcase`에서 공고·단지 UI, 지도 마커와 상단 바를 각각 비교합니다.

단지 UI는 `/showcase/complex-card`, `/showcase/complex-list`,
`/showcase/complex-detail`에서 확인합니다. 지도 마커와 상단 바는
`/showcase/map-marker`, `/showcase/top-bar`에서 확인합니다.

기존 검토 주소인 `/notice-card`, `/notice-list`, `/notice-detail`도 유지합니다.

## HTML/CSS 시안 등록

각 `/showcase` 요소 페이지는 서로 섞이지 않는 두 영역으로 구성됩니다.

- `기존 시안`: 기존 React A/B/C와 과거 revision을 그대로 보여주며, 15개 revision의 대표
  상태를 정적 HTML/CSS 전달본으로 제공합니다.
- `등록 시안`: 제목, 선택 설명, HTML fragment, CSS를 입력해 독립적인 검토 시안을
  등록합니다. 로그인이나 승인 없이 즉시 공개되며 수정·삭제 기능은 없습니다.

등록 시안은 실제 React 화면에 적용되지 않습니다. 미리보기는 빈 `sandbox` iframe에서
실행되며 JavaScript, 폼, 중첩 프레임, 외부 네트워크와 CSS `@import`/외부 `url()`을
허용하지 않습니다. HTML과 CSS 원문 합계는 UTF-8 기준 512KiB 이하입니다.

## Neon 설정

`DATABASE_URL`은 서버 전용 환경 변수입니다. 현재 Vercel 배포는 사이트 전체가 테스트용이므로
Development, Preview, Production이 같은 Neon `main` 브랜치와 제한된 런타임 로그인 역할을
공유합니다. 테스트용 범위를 벗어나 운영 데이터가 생기면 환경별 브랜치와 역할로 분리합니다.
스키마 소유자 URL은 migration과 권한 설정에만 사용합니다.

```bash
DATABASE_URL='postgresql://schema-owner...' npm run db:migrate
psql 'postgresql://schema-owner...' -f drizzle/runtime-role-grants.sql
```

전용 데이터베이스에서 권한 SQL을 실행한 뒤 스키마 소유자로 런타임 로그인에 append-only
capability 역할을 부여합니다. 권한 SQL은 `public`의 `PUBLIC CREATE`도 회수합니다.

```sql
ALTER ROLE "your_neon_runtime_login"
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS INHERIT;
GRANT showcase_design_writer TO "your_neon_runtime_login";
```

애플리케이션과 Vercel의 `DATABASE_URL`에는 이 런타임 로그인 URL만 둡니다. 런타임 역할은
`showcase_designs`의 `SELECT`, `INSERT`와 identity sequence 사용만 허용하며 `UPDATE`,
`DELETE` 권한은 없습니다. 상세 절차는 `drizzle/README.md`를 확인합니다.

`DATABASE_URL`이 없어도 기존 시안 보드는 정상적으로 빌드되고 표시됩니다. 이때 등록 시안
영역만 저장소 연결 오류와 다시 시도 상태를 보여줍니다.

## 검증

```bash
npm run check
```

## 참고

- 화면 안의 데이터와 동작은 시안 검토를 위한 예시입니다.
- 실제 공고문/PDF/API 연결은 아직 예시 동작입니다.
