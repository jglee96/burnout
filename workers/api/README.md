# Burnout API Worker

Cloudflare Worker 템플릿이다. 아래 키 명칭은 Supabase 최신 권장 방식(`publishable/secret`) 기준이다.

## Routes (template)

- `POST /api/billing/webhook?provider=stripe|toss`
- `POST /api/ai/evaluate-day`
- `GET /api/health`

## Required Secrets

아래는 Worker secret으로 등록한다.

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `OPENAI_API_KEY` (선택)
- `STRIPE_SECRET_KEY` (Stripe 사용 시)
- `STRIPE_WEBHOOK_SECRET` (Stripe 사용 시)
- `TOSS_SECRET_KEY` (Toss 사용 시)
- `TOSS_WEBHOOK_SECRET` (Toss 사용 시)

## Deploy (pnpm dlx 사용)

```bash
cd workers/api
pnpm dlx wrangler secret put SUPABASE_URL
pnpm dlx wrangler secret put SUPABASE_SECRET_KEY
pnpm dlx wrangler deploy
```

## Notes

1. 현재 구현은 스캐폴딩이다.
2. 결제 웹훅 서명 검증, provider payload 정규화, 멱등 처리 고도화가 추가로 필요하다.
3. AI 평가는 템플릿 응답이며, 실제 LLM 호출 연결은 별도 구현이 필요하다.

