# Burnout Guard

Burnout Guard는 직장인의 하루 업무를 `시작 → 실행 → 마무리` 루프로 관리하고, 퇴근 전 냉정한 평가와 다음 날 개선안을 제안하는 웹 앱입니다.

English README: [README.en.md](./README.en.md)

## 목차

- [핵심 기능](#핵심-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [요구 사항](#요구-사항)
- [빠른 시작](#빠른-시작)
- [스크립트](#스크립트)
- [테스트 실행 가이드](#테스트-실행-가이드)
- [Supabase 설정](#supabase-설정)
- [Cloudflare 배포](#cloudflare-배포)
- [PWA](#pwa)
- [보안 주의사항](#보안-주의사항)
- [참고 문서](#참고-문서)

## 핵심 기능

- 하루 시작/종료 세션 관리
- To Do / Doing / Done 기반 작업 보드 (드래그 앤 드롭 지원)
- 번아웃 위험도 계산 및 요약
- 하루 마무리 평가 + AI 상세 개선안
- Google 로그인(Supabase Auth)
- BYOK(개인 AI 키) 또는 Pro 플랜 기반 AI 접근 제어
- PWA 설치 지원 (manifest + service worker)
- 다국어 지원 (`en`, `ko`, `ja`)

## 기술 스택

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Auth/DB: Supabase
- API/Webhook: Cloudflare Workers
- Test: Vitest, Testing Library, Playwright
- 구조: Feature-Sliced Design(FSD) 기반

## 프로젝트 구조

```text
src/
  app/         # 앱 엔트리/전역 스타일
  pages/       # 라우트 단위 화면 (dashboard, product, pricing, settings ...)
  widgets/     # 화면 조합 컴포넌트
  features/    # 사용자 액션 단위 기능
  entities/    # 도메인 모델/표현
  shared/      # 공용 API, lib, UI

workers/api/   # Cloudflare Worker API
supabase/      # SQL migration
docs/          # 배포/디자인 문서
```

## 요구 사항

- Node.js 22 LTS
- pnpm

## 빠른 시작

1. 의존성 설치

```bash
pnpm i
```

2. 환경변수 설정

`.env.example`을 복사해 `.env` 생성:

```env
VITE_APP_ENV=development
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
# Optional
# VITE_API_BASE_URL=https://your-worker-domain.workers.dev
```

3. 개발 서버 실행

```bash
pnpm dev
```

기본 접속:

- 홈: `http://localhost:5173/`
- 앱: `http://localhost:5173/app/day`
- 요금제: `http://localhost:5173/pricing`

## 스크립트

- `pnpm dev`: 로컬 개발 서버
- `pnpm build`: 프로덕션 빌드
- `pnpm lint`: ESLint
- `pnpm typecheck`: TypeScript 타입 검사
- `pnpm test`: 단위 테스트(Vitest)
- `pnpm test:e2e`: E2E 테스트(Playwright)
- `pnpm format`: Prettier 포맷

## 테스트 실행 가이드

PR 전 권장 순서:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

## Supabase 설정

1. Supabase 프로젝트 생성
2. migration 실행:
   - `supabase/migrations/20260217_000001_init_auth_billing.sql`
3. Google Provider 활성화
4. Redirect URL 등록 (로컬/배포 도메인)

자세한 체크리스트:

- `docs/deploy/cloudflare-supabase-setup-checklist.md`

## Cloudflare 배포

### Frontend (Pages)

- Build command: `pnpm build`
- Output directory: `dist`
- Deploy command: 비워두는 것을 권장 (Pages 정적 배포)

### Worker (API)

- 위치: `workers/api`
- 주요 엔드포인트:
  - `GET /api/health`
  - `POST /api/ai/evaluate-day`
  - `POST /api/billing/webhook?provider=stripe|toss`

자동 배포:

- `.github/workflows/deploy-worker.yml`
- 필요 GitHub Secrets:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

## PWA

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/*`
- `public/screenshots/*`

서비스워커는 다음 환경에서 등록됩니다:

- `production`
- `localhost` / `127.0.0.1` (로컬 검증용)

아이콘/manifest가 갱신되지 않으면:

1. DevTools → Application → Service Workers → Unregister
2. Application → Clear storage → Clear site data
3. 강력 새로고침

## 보안 주의사항

- `.env` 및 키/토큰은 절대 커밋하지 않습니다.
- 클라이언트에는 `VITE_SUPABASE_PUBLISHABLE_KEY`만 사용합니다.
- 서버 전용 키(`SUPABASE_SECRET_KEY` 등)는 Worker Secret으로만 관리합니다.

## 참고 문서

- 배포 체크리스트: `docs/deploy/cloudflare-supabase-setup-checklist.md`
- UI 기준 문서: `docs/ui/hig-dashboard-foundation.md`
- Worker 문서: `workers/api/README.md`
