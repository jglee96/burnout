# Cloudflare + Supabase Setup Checklist

이 문서는 Burnout Guard를 무료 플랜 기준으로 배포하기 위한 실행 체크리스트다.

## 1) Supabase 프로젝트 생성

1. Supabase에서 새 프로젝트를 생성한다. (리전은 사용자 근접 리전 권장)
2. SQL Editor에서 `/supabase/migrations/20260217_000001_init_auth_billing.sql`를 실행한다.
3. `Authentication > Providers > Google`에서 Google 로그인을 활성화한다.
4. `Settings > API`에서 `Publishable key`, `Secret key`를 확인한다.
5. Redirect URL을 아래와 같이 등록한다.
   - 개발: `http://localhost:5173`
   - 배포: `https://<your-cloudflare-domain>`

## 2) Google OAuth 설정

1. Google Cloud Console에서 OAuth Client(Web)를 만든다.
2. Authorized JavaScript origins:
   - `http://localhost:5173`
   - `https://<your-cloudflare-domain>`
3. Authorized redirect URIs:
   - `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
4. 발급된 Client ID/Secret을 Supabase Google Provider 설정에 입력한다.

## 3) Cloudflare Pages 배포

1. Cloudflare Pages에 Git 저장소를 연결한다.
2. Build 설정:
   - Framework preset: `Vite`
   - Build command: `pnpm build`
   - Build output: `dist`
   - Deploy command: 비워둔다. (`npx wrangler deploy` 사용 금지)
3. Pages 환경 변수 등록:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_APP_ENV=production`
4. 배포 후 발급된 도메인을 Supabase Auth Redirect URL 목록에 추가한다.

## 4) Cloudflare Worker(API/Billing Webhook) 배포

결제 웹훅/AI 평가 프록시는 클라이언트에서 직접 처리하지 말고 Worker에서 처리한다.

1. Worker에 비밀키를 등록한다.
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `OPENAI_API_KEY` (또는 사용 LLM 키)
   - `STRIPE_SECRET_KEY` 또는 `TOSS_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET` 또는 PG 웹훅 검증키
2. `/api/billing/webhook` 엔드포인트에서:
   - `payment_events`에 이벤트를 멱등 저장
   - `subscriptions`, `ai_entitlements`를 트랜잭션으로 업데이트
3. `/api/ai/evaluate-day` 엔드포인트에서:
   - 로그인 사용자 검증
   - `ai_entitlements` 조회 후 접근 제어
   - BYOK 모드면 `ai_credentials` 복호화 키 사용

### Worker 자동 배포 (권장)

1. 저장소에 있는 GitHub Actions 워크플로우를 사용한다:
   - `.github/workflows/deploy-worker.yml`
2. GitHub Repository Secrets를 등록한다:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. `main` 브랜치에 `workers/api/**` 변경이 push되면 Worker가 자동 배포된다.

## 5) 사용자별 AI 접근 정책 연결

1. 기본값은 `ai_entitlements.access_mode = 'none'`.
2. 사용자가 키를 저장하면:
   - `ai_credentials` upsert
   - `ai_entitlements`를 `byok/self_key`로 업데이트
3. 결제 성공 웹훅이 오면:
   - `subscriptions.plan='pro', status='active'`
   - `ai_entitlements`를 `pro/subscription`으로 업데이트
4. 결제 취소/만료 시:
   - `subscriptions.status='canceled'` 또는 `past_due`
   - BYOK 키가 없으면 `ai_entitlements`를 `none`으로 변경

## 6) SNS CI 추가 시 해야 할 일

1. 본인인증 공급자에서 CI 원문을 수신한다.
2. 서버에서 `ci_hash = sha256(ci + server_salt)`로 해시한다.
3. `user_identities(provider='sns_ci', ci_hash=...)` upsert로 계정 연결한다.
4. CI 원문은 DB/로그에 저장하지 않는다.

## 7) 최소 운영 점검 (배포 전)

1. Google 로그인 성공/재로그인 성공
2. 신규 유저 가입 시 `profiles/subscriptions/ai_entitlements` 자동 생성 확인
3. 결제 웹훅 멱등 처리 확인 (`payment_events` unique)
4. 무료 사용자 AI 차단, BYOK/Pro 사용자 AI 허용 확인
5. 취소/환불 시 Pro 권한 회수 확인

## 8) 지금 사용자(당신)가 바로 해야 할 일

1. Supabase 프로젝트 생성 + migration 실행
2. Google OAuth Client 생성 후 Supabase Provider에 연결
3. Cloudflare Pages에 현재 저장소 연결 및 환경변수 주입
4. Pages Deploy command가 비어있는지 확인
5. Worker 비밀키 설정
6. GitHub Secrets(`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) 설정
7. 결제사 웹훅 URL 등록 (`/api/billing/webhook`)
8. 배포 도메인을 Supabase/Google Redirect URL에 모두 반영

## 9) Key 용어 정리 (중요)

1. 신규 프로젝트는 `Publishable key`(클라이언트), `Secret key`(서버) 기준으로 구성한다.
2. `anon`, `service_role` 키는 레거시 호환 키로만 취급하고 신규 설계 기준으로 사용하지 않는다.
