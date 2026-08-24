# toadzip-ui

공공주택 모집공고 UI를 화면 요소별로 비교하고 공유하는 **두꺼비집 UI 시안 보관함**입니다.

백엔드와 분리된 화면 구성 검토용 저장소이며, 현재 데이터는 고정된 예시 데이터입니다.

## 제공 화면

- 지도·목록·상세 패널을 함께 보는 전체 탐색 프로토타입
- 지도 전체 구도를 위한 시안 A/B/C 선택 영역
- 단지 목록 카드·목록·상세 UI
- 공고 목록 카드 UI
- 공고 목록 UI
- 공고 상세 UI
- 지도 마커와 상단 바 UI
- 화면별 시안 A/B/C 동시 비교

현재 UI는 각 화면의 시안 A에 배치되어 있습니다. 공고 목록 카드에는 신규 제안 B도 있으며,
그 밖의 B/C 칸은 이후 시안을 추가할 수 있는 빈 자리입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 지도 포함 전체 프로토타입이 표시됩니다.

메인 화면의 `지도 전체 시안`은 전체 지도 화면용 A/B/C 자리입니다. `요소 UI 비교`는
`/showcase`에서 공고·단지 UI, 지도 마커와 상단 바를 각각 비교합니다.

단지 UI는 `/showcase/complex-card`, `/showcase/complex-list`,
`/showcase/complex-detail`에서 확인합니다. 지도 마커와 상단 바는
`/showcase/map-marker`, `/showcase/top-bar`에서 확인합니다.

기존 검토 주소인 `/notice-card`, `/notice-list`, `/notice-detail`도 유지합니다.

## 검증

```bash
npm run check
```

## 참고

- 화면 안의 데이터와 동작은 시안 검토를 위한 예시입니다.
- 실제 공고문/PDF/API 연결은 아직 예시 동작입니다.
