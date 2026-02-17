# AGENTS.md — Codex Project Instructions

## 0) Goal (한 문단 요약)

- 이 저장소의 목적: burnout syndrome을 방지하고자 할 일, 할 일을 관리하고 평가하는 웹앱 서비스를 만든다.
- 최우선 가치:
  - 사용자의 한 일, 할 일을 올바르게 꾸밈없이 기억하고, 올바른 평가를 내려 사용자의 burnout을 방지한다.
  - 웹의 성능을 중요시하며 이와 관련된 기술을 사용한다.
- “완료”의 정의:
  - 전체 기능이 완벽히 동작해야하며 이를 점검하기 위한 테스트 코드가 있어야한다.
  - 이전 완료에서 수정된 사항에 대한 테스트가 통과해야한다.
  - 배포가 가능해야한다.

## 1) Repo map (5줄 내)

- Featured Slicde Desing (FSD) 규칙을 따른다.
- FSD lint를 통과해야한다.

## 2) Golden rules (Codex 작업 규칙)

- 변경은 항상 **최소 단위로**: 작은 커밋/작은 diff 선호
- 추측 금지: 모호하면 코드/문서/테스트를 먼저 확인하고 근거를 남긴다
- 새 의존성 추가는 기본적으로 피하고, 필요 시 이유/대안/영향을 적는다
- 사용자 입력/외부 데이터는 반드시 검증하고 안전한 기본값을 둔다
- 로깅/에러 메시지는 “원인 + 행동”을 담게 쓴다

## 3) Build / Run / Test (가장 중요)

### Prerequisites

- Node: v22 LTS
- Package manager: pnpm
- 기타: <docker, python 등>

### Commands

- Install: pnpm i
- Dev: pnpm dev
- Unit test: pnpm test
- E2E test: pnpm test:e2e
- Lint/Format: pnpm lint, pnpm format
- Typecheck: pnpm typecheck

### CI parity

- PR 전 반드시 실행: Lint, Typecheck, Unit test, E2E test
- CI에서만 실행: build

## 4) Coding conventions

- 언어/런타임: frontend - react, ts
- 스타일: prettier/eslint, gofmt
- 상태/비동기 규칙: React는 서버/클라 경계 엄수, fetch 래퍼 사용

## 5) Architecture & boundaries

- 금지된 의존:
  - web -> api 직접 호출 금지, 반드시 client 사용
- 데이터 흐름: <간단 다이어그램/서술>

## 6) Security & privacy (필요 시)

- 비밀정보: `.env`/키/토큰은 절대 커밋 금지

## 7) “How to work with Codex” (행동 지침)

- 작업 시작 시: 관련 파일을 먼저 열고, 현재 동작/테스트 상태를 확인한다
- 변경 후: 최소한 `<unit test + lint + typecheck>`는 실행한다
- 모호하면: (1) 근거 탐색 → (2) 가장 보수적인 선택 → (3) TODO/이슈로 남긴다

## 8) Where to find deeper docs

- Design/Spec: `docs/` 또는 `PLANS.md`
- ADR(의사결정 기록): `docs/adr/`
- API contracts: `docs/api/`
