interface Env {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  OPENAI_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  TOSS_SECRET_KEY?: string;
  TOSS_WEBHOOK_SECRET?: string;
}

type BillingProvider = "stripe" | "toss";

interface BillingWebhookPayload {
  id?: string;
  type?: string;
  user_id?: string;
  [key: string]: unknown;
}

interface AiEvaluatePayload {
  accessMode?: "byok" | "pro";
  completedTodayCount?: number;
  dayEvaluationReport?: {
    metrics?: {
      activeCount?: number;
      highPriorityActiveCount?: number;
      burnoutRiskLevel?: "low" | "moderate" | "high";
      burnoutRiskScore?: number;
    };
  };
}

function json(
  data: unknown,
  init: ResponseInit = { status: 200 }
): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {})
    }
  });
}

function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice("Bearer ".length);
}

async function verifySupabaseUser(
  request: Request,
  env: Env
): Promise<{ id: string } | null> {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { id?: unknown };
  if (typeof data.id !== "string") {
    return null;
  }

  return { id: data.id };
}

async function supabaseRestRequest(
  env: Env,
  path: string,
  init: RequestInit
): Promise<Response> {
  return fetch(`${env.SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
      "content-type": "application/json",
      ...(init.headers ?? {})
    }
  });
}

function parsePlanFromEventType(eventType: string | undefined): {
  plan: "free" | "pro";
  status: "active" | "canceled" | "past_due" | "incomplete";
} | null {
  if (!eventType) {
    return null;
  }

  if (
    eventType === "checkout.session.completed" ||
    eventType === "customer.subscription.created" ||
    eventType === "customer.subscription.updated" ||
    eventType === "payment.succeeded"
  ) {
    return { plan: "pro", status: "active" };
  }

  if (
    eventType === "customer.subscription.deleted" ||
    eventType === "subscription.canceled"
  ) {
    return { plan: "free", status: "canceled" };
  }

  if (eventType === "invoice.payment_failed") {
    return { plan: "pro", status: "past_due" };
  }

  return null;
}

async function handleBillingWebhook(
  request: Request,
  env: Env
): Promise<Response> {
  const providerParam = new URL(request.url).searchParams.get("provider");
  const provider: BillingProvider =
    providerParam === "toss" ? "toss" : "stripe";

  const payload = (await request.json()) as BillingWebhookPayload;
  const providerEventId =
    typeof payload.id === "string" ? payload.id : crypto.randomUUID();
  const eventType = typeof payload.type === "string" ? payload.type : "unknown";

  const eventInsertResponse = await supabaseRestRequest(
    env,
    "/rest/v1/payment_events?on_conflict=billing_provider,provider_event_id",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify({
        billing_provider: provider,
        provider_event_id: providerEventId,
        event_type: eventType,
        payload,
        process_status: "received"
      })
    }
  );

  if (!eventInsertResponse.ok) {
    return json(
      {
        error:
          "Failed to persist payment event. Check Supabase secret key and schema."
      },
      { status: 500 }
    );
  }

  if (typeof payload.user_id === "string") {
    const parsedPlan = parsePlanFromEventType(eventType);
    if (parsedPlan) {
      const userFilter = encodeURIComponent(`eq.${payload.user_id}`);

      await supabaseRestRequest(
        env,
        `/rest/v1/subscriptions?user_id=${userFilter}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            plan: parsedPlan.plan,
            status: parsedPlan.status,
            billing_provider: provider
          })
        }
      );

      await supabaseRestRequest(
        env,
        `/rest/v1/ai_entitlements?user_id=${userFilter}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(
            parsedPlan.plan === "pro"
              ? { access_mode: "pro", source: "subscription" }
              : { access_mode: "none", source: "none" }
          )
        }
      );
    }
  }

  await supabaseRestRequest(
    env,
    `/rest/v1/payment_events?billing_provider=eq.${provider}&provider_event_id=eq.${encodeURIComponent(providerEventId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        process_status: "processed",
        processed_at: new Date().toISOString()
      })
    }
  );

  return json({ ok: true, provider, providerEventId, eventType });
}

function buildAiSuggestion(payload: AiEvaluatePayload) {
  const activeCount = payload.dayEvaluationReport?.metrics?.activeCount ?? 0;
  const highPriorityActiveCount =
    payload.dayEvaluationReport?.metrics?.highPriorityActiveCount ?? 0;
  const riskLevel =
    payload.dayEvaluationReport?.metrics?.burnoutRiskLevel ?? "moderate";
  const riskScore = payload.dayEvaluationReport?.metrics?.burnoutRiskScore ?? 0;

  const riskDrivers = [
    activeCount >= 4
      ? "미완료 항목이 많아 전환 비용이 누적됩니다."
      : "미완료 항목은 관리 가능하지만 증가 추세를 주의해야 합니다.",
    highPriorityActiveCount >= 2
      ? "high 작업 동시 진행 수가 높아 집중 저하가 발생하기 쉽습니다."
      : "high 작업 수는 낮지만 착수 시점 고정이 필요합니다."
  ];

  return {
    accessMode: payload.accessMode ?? "pro",
    diagnosis: `현재 위험도는 ${riskLevel}(${riskScore})이며, 미완료 ${activeCount}개를 기준으로 내일 시작 시 우선순위 압축이 필요합니다.`,
    riskDrivers,
    tomorrowFocusPlan: [
      "출근 후 10분 안에 To Do를 3개로 제한합니다.",
      "첫 50분 블록에서 완료 가능한 작업 1개를 닫아 완료 기준선을 만듭니다.",
      "신규 요청은 기존 To Do 1개 제거 후에만 추가합니다."
    ],
    scheduleTemplate: [
      "09:00-09:10 계획 정리",
      "09:10-10:00 Deep work #1",
      "10:00-10:10 회복 블록",
      "14:00-14:50 Deep work #2",
      "17:40-17:55 종료 점검"
    ],
    stopRules: [
      "Doing이 2개를 넘으면 신규 착수를 중단합니다.",
      "high 작업은 동시 1개만 진행합니다.",
      "퇴근 30분 전에는 신규 작업 착수를 금지합니다."
    ]
  };
}

async function handleAiEvaluate(request: Request, env: Env): Promise<Response> {
  const user = await verifySupabaseUser(request, env);
  if (!user) {
    return json(
      { error: "Unauthorized. Provide Supabase user bearer token." },
      { status: 401 }
    );
  }

  const payload = (await request.json()) as AiEvaluatePayload;
  if (payload.accessMode !== "byok" && payload.accessMode !== "pro") {
    return json(
      { error: "AI access denied. Access mode must be byok or pro." },
      { status: 403 }
    );
  }

  return json(buildAiSuggestion(payload));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({ ok: true, service: "burnout-api" });
    }

    if (url.pathname === "/api/billing/webhook" && request.method === "POST") {
      return handleBillingWebhook(request, env);
    }

    if (url.pathname === "/api/ai/evaluate-day" && request.method === "POST") {
      return handleAiEvaluate(request, env);
    }

    return json({ error: "Not found" }, { status: 404 });
  }
};

