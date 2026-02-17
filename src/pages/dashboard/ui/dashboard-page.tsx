import { useEffect, useMemo, useState } from "react";
import { calculateBurnoutRisk } from "@/entities/task/model/calculate-burnout-risk";
import { evaluateDay } from "@/entities/task/model/evaluate-day";
import type {
  AiAccessMode,
  DayEvaluationReport,
  Task,
  TaskPriority,
  TaskStatus
} from "@/entities/task/model/types";
import { CreateTaskForm } from "@/features/task/create-task";
import { LandingPage } from "@/pages/landing";
import { PricingPage } from "@/pages/pricing";
import { SettingsPage } from "@/pages/settings";
import { getAiDetailedSuggestion } from "@/shared/api/ai-evaluation-client";
import { useAppLocale } from "@/shared/lib/i18n/locale";
import { navigate } from "@/shared/lib/router/navigation";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { BurnoutSummary } from "@/widgets/burnout-summary";
import { DayEndReport, DayStartPanel } from "@/widgets/day-session";
import { AppHeader } from "@/widgets/header";
import { InfoDeskHeader } from "@/widgets/info-desk";
import { TaskBoard } from "@/widgets/task-board";

const initialTasks: Task[] = [
  {
    id: "seed-1",
    title: "Ship today's focused feature",
    priority: "high",
    status: "doing",
    createdAt: "2026-02-17T09:00:00.000Z"
  },
  {
    id: "seed-2",
    title: "Write tests for risk score logic",
    priority: "medium",
    status: "todo",
    createdAt: "2026-02-17T09:10:00.000Z"
  },
  {
    id: "seed-3",
    title: "Close one small maintenance task",
    priority: "low",
    status: "done",
    createdAt: "2026-02-17T08:00:00.000Z",
    completedAt: "2026-02-17T11:00:00.000Z"
  }
];

function startOfTodayIso() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

type DaySessionState = "before-work" | "working" | "after-work";
type AuthStatus = "checking" | "anonymous" | "authenticated" | "error";
export type AppSection = "day" | "pricing" | "settings";

const AI_KEY_STORAGE_KEY = "burnout-ai-key";
const AI_PRO_STORAGE_KEY = "burnout-ai-pro";
const DAY_SESSION_STORAGE_KEY = "burnout-day-session";
const LOCAL_AUTH_BYPASS_KEY = "burnout-local-auth-bypass";
const TASKS_STORAGE_KEY = "burnout-tasks";
const BRAND_CATCHPHRASE =
  "Keep one clear priority, cap in-progress work, and review completion momentum before overload builds up.";
const authClientModulePromise = import("@/shared/api/auth-client");
const supabaseClientModulePromise = import("@/shared/api/supabase-client");

async function loadAuthClient() {
  return authClientModulePromise;
}

async function loadSupabaseClient() {
  return supabaseClientModulePromise;
}

function sectionFromPath(pathname: string): AppSection {
  if (pathname === "/pricing" || pathname.startsWith("/app/pricing")) {
    return "pricing";
  }
  if (pathname.startsWith("/app/settings")) {
    return "settings";
  }
  return "day";
}

function dateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function isDaySessionState(value: unknown): value is DaySessionState {
  return (
    value === "before-work" || value === "working" || value === "after-work"
  );
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return value === "low" || value === "medium" || value === "high";
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "todo" || value === "doing" || value === "done";
}

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const hasValidCompletedAt =
    record.completedAt === undefined || typeof record.completedAt === "string";

  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    isTaskPriority(record.priority) &&
    isTaskStatus(record.status) &&
    typeof record.createdAt === "string" &&
    hasValidCompletedAt
  );
}

function readStoredAiKey(): string {
  try {
    return window.localStorage.getItem(AI_KEY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function readStoredAiProFlag(): boolean {
  try {
    return window.localStorage.getItem(AI_PRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function readStoredTasks(): Task[] {
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      return initialTasks;
    }

    const parsed = JSON.parse(raw) as { date?: unknown; tasks?: unknown };
    if (parsed.date !== dateKey() || !Array.isArray(parsed.tasks)) {
      return initialTasks;
    }

    if (!parsed.tasks.every((task) => isTask(task))) {
      return initialTasks;
    }

    return parsed.tasks;
  } catch {
    return initialTasks;
  }
}

function readStoredDaySessionState(): DaySessionState {
  try {
    const raw = window.localStorage.getItem(DAY_SESSION_STORAGE_KEY);
    if (!raw) {
      return "before-work";
    }
    const parsed = JSON.parse(raw) as { date?: unknown; state?: unknown };
    if (
      parsed.date === dateKey() &&
      parsed.state &&
      isDaySessionState(parsed.state)
    ) {
      return parsed.state;
    }
    return "before-work";
  } catch {
    return "before-work";
  }
}

function writeStoredDaySessionState(state: DaySessionState) {
  window.localStorage.setItem(
    DAY_SESSION_STORAGE_KEY,
    JSON.stringify({ date: dateKey(), state })
  );
}

function writeStoredTasks(tasks: Task[]) {
  window.localStorage.setItem(
    TASKS_STORAGE_KEY,
    JSON.stringify({ date: dateKey(), tasks })
  );
}

function readLocalAuthBypassFlag(): boolean {
  try {
    return window.localStorage.getItem(LOCAL_AUTH_BYPASS_KEY) === "true";
  } catch {
    return false;
  }
}

export function DashboardPage() {
  const { locale } = useAppLocale();
  const [daySessionState, setDaySessionState] = useState<DaySessionState>(
    readStoredDaySessionState
  );
  const [activeSection, setActiveSection] = useState<AppSection>(() =>
    sectionFromPath(window.location.pathname)
  );
  const [tasks, setTasks] = useState<Task[]>(readStoredTasks);
  const [storedAiKey, setStoredAiKey] = useState<string>(readStoredAiKey);
  const [hasProAccess, setHasProAccess] =
    useState<boolean>(readStoredAiProFlag);
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [authUserEmail, setAuthUserEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [isLocalAuthBypass, setIsLocalAuthBypass] = useState(
    readLocalAuthBypassFlag
  );
  const [dayEndReport, setDayEndReport] = useState<DayEvaluationReport | null>(
    null
  );
  const copy =
    locale === "ko"
      ? {
          authInitError:
            "인증 초기화에 실패했습니다. Supabase URL/Publishable Key를 점검하세요.",
          authSignInError:
            "Google 로그인에 실패했습니다. OAuth 설정을 확인하세요.",
          authSignOutError: "로그아웃에 실패했습니다. 잠시 후 다시 시도하세요.",
          checkingAuth: "로그인 상태를 확인하는 중입니다.",
          preLoginDescription:
            "업무 시작 전 로그인하고, 퇴근 전 냉정한 리뷰를 남겨 번아웃을 예방하세요.",
          sessionBeforeWork: "오늘 업무를 시작할 준비 단계입니다.",
          sessionWorking:
            "업무 진행 중입니다. Doing을 최소화해 집중을 유지하세요.",
          sessionAfterWork:
            "업무 마무리 상태입니다. 평가를 확인하고 다음 날을 준비하세요.",
          stateBeforeWork: "하루 시작 전",
          stateWorking: "근무 중",
          stateAfterWork: "하루 마무리",
          finishHint:
            "퇴근 전 하루를 마감하면, 완료/미완료 비율과 위험도를 기준으로 내일 개선 계획을 제안합니다.",
          finishDay: "하루 마무리하기",
          resetHint:
            "종료 평가는 새로고침으로 초기화되었습니다. 다시 시작해서 오늘 작업을 이어갈 수 있습니다.",
          restart: "다시 시작하기",
          settingsTitle: "개인 설정"
        }
      : locale === "ja"
        ? {
            authInitError:
              "認証の初期化に失敗しました。Supabase URL/Publishable Key を確認してください。",
            authSignInError:
              "Googleログインに失敗しました。OAuth設定を確認してください。",
            authSignOutError:
              "ログアウトに失敗しました。しばらくしてから再試行してください。",
            checkingAuth: "ログイン状態を確認しています。",
            preLoginDescription:
              "業務開始前にログインし、退勤前に客観レビューを残してバーンアウトを防ぎましょう。",
            sessionBeforeWork: "今日の業務を開始する準備段階です。",
            sessionWorking:
              "業務中です。Doingを最小化して集中を維持してください。",
            sessionAfterWork:
              "業務終了状態です。評価を確認して翌日の準備をしてください。",
            stateBeforeWork: "開始前",
            stateWorking: "勤務中",
            stateAfterWork: "終了後",
            finishHint:
              "退勤前に1日を締めると、完了/未完了比率とリスクに基づいて明日の改善計画を提案します。",
            finishDay: "1日を締める",
            resetHint:
              "終了評価はリロードで初期化されました。再開して今日の作業を引き継げます。",
            restart: "再開する",
            settingsTitle: "個人設定"
          }
        : {
            authInitError:
              "Failed to initialize authentication. Check Supabase URL/Publishable Key.",
            authSignInError:
              "Google sign-in failed. Check your OAuth configuration.",
            authSignOutError: "Sign-out failed. Please try again shortly.",
            checkingAuth: "Checking your sign-in status.",
            preLoginDescription:
              "Sign in before work and leave an objective review before you leave to prevent burnout.",
            sessionBeforeWork: "You're in pre-start mode for today.",
            sessionWorking:
              "You are in work mode. Keep Doing minimal to protect focus.",
            sessionAfterWork:
              "You are in wrap-up mode. Review today and prepare tomorrow.",
            stateBeforeWork: "Before work",
            stateWorking: "Working",
            stateAfterWork: "After work",
            finishHint:
              "When you close the day before leaving, the app proposes tomorrow's improvements using completion ratio and risk.",
            finishDay: "Finish day",
            resetHint:
              "End-of-day review was reset after refresh. You can restart and continue today's work.",
            restart: "Start again",
            settingsTitle: "Settings"
          };
  const canUseLocalBypass = import.meta.env.VITE_APP_ENV !== "production";

  const aiAccessMode: AiAccessMode = hasProAccess
    ? "pro"
    : storedAiKey
      ? "byok"
      : "none";

  const todayIso = startOfTodayIso();
  const completedTodayCount = tasks.filter(
    (task) =>
      task.status === "done" && task.completedAt && task.completedAt >= todayIso
  ).length;

  const burnoutReport = useMemo(
    () => calculateBurnoutRisk({ tasks, completedTodayCount, locale }),
    [tasks, completedTodayCount, locale]
  );

  const onCreateTask = ({
    title,
    priority
  }: {
    title: string;
    priority: TaskPriority;
  }) => {
    const id = `task-${Date.now()}`;
    const createdAt = new Date().toISOString();
    setTasks((current) => [
      {
        id,
        title,
        priority,
        status: "todo",
        createdAt
      },
      ...current
    ]);
  };

  const onStatusChange = (taskId: string, status: TaskStatus) => {
    const completedAt =
      status === "done" ? new Date().toISOString() : undefined;
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        return {
          ...task,
          status,
          completedAt
        };
      })
    );
  };

  const onStartDay = () => {
    setDaySessionState("working");
    setDayEndReport(null);
  };

  const onFinishDay = () => {
    const report: DayEvaluationReport = evaluateDay({
      tasks,
      completedTodayCount,
      burnoutRiskReport: burnoutReport,
      locale
    });
    setDayEndReport(report);
    setDaySessionState("after-work");

    if (aiAccessMode === "none") {
      return;
    }

    setIsAiEvaluating(true);
    void getAiDetailedSuggestion({
      accessMode: aiAccessMode,
      apiKey: aiAccessMode === "byok" ? storedAiKey : undefined,
      tasks,
      completedTodayCount,
      burnoutRiskReport: burnoutReport,
      dayEvaluationReport: report,
      locale
    })
      .then((aiSuggestion) => {
        setDayEndReport((current) =>
          current
            ? {
                ...current,
                aiSuggestion
              }
            : current
        );
      })
      .finally(() => {
        setIsAiEvaluating(false);
      });
  };

  const onPrepareNextDay = () => {
    setDaySessionState("before-work");
  };

  const onSaveAiKey = (nextAiKey: string) => {
    setStoredAiKey(nextAiKey);
    window.localStorage.setItem(AI_KEY_STORAGE_KEY, nextAiKey);
  };

  const onClearAiKey = () => {
    setStoredAiKey("");
    window.localStorage.removeItem(AI_KEY_STORAGE_KEY);
  };

  const onActivateProAccess = () => {
    setHasProAccess(true);
    window.localStorage.setItem(AI_PRO_STORAGE_KEY, "true");
  };

  const onDeactivateProAccess = () => {
    setHasProAccess(false);
    window.localStorage.removeItem(AI_PRO_STORAGE_KEY);
  };

  useEffect(() => {
    writeStoredDaySessionState(daySessionState);
  }, [daySessionState]);

  useEffect(() => {
    const onPathChange = () =>
      setActiveSection(sectionFromPath(window.location.pathname));
    window.addEventListener("popstate", onPathChange);
    return () => window.removeEventListener("popstate", onPathChange);
  }, []);

  useEffect(() => {
    writeStoredTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    async function bootstrapAuthState() {
      if (isLocalAuthBypass) {
        setAuthStatus("authenticated");
        setAuthUserEmail("local-test@burnout.dev");
        return;
      }

      try {
        const [{ getCurrentSession }, { supabase }] = await Promise.all([
          loadAuthClient(),
          loadSupabaseClient()
        ]);

        const session = await getCurrentSession();
        if (!isMounted) {
          return;
        }

        if (session?.user) {
          setAuthStatus("authenticated");
          setAuthUserEmail(session.user.email ?? session.user.id);
        } else {
          setAuthStatus("anonymous");
          setAuthUserEmail("");
        }

        const { data } = supabase.auth.onAuthStateChange(
          (_event, nextSession) => {
            if (!isMounted) {
              return;
            }

            if (nextSession?.user) {
              setAuthStatus("authenticated");
              setAuthUserEmail(nextSession.user.email ?? nextSession.user.id);
              setAuthMessage("");
              return;
            }

            setAuthStatus("anonymous");
            setAuthUserEmail("");
          }
        );

        unsubscribe = () => data.subscription.unsubscribe();
      } catch {
        if (!isMounted) {
          return;
        }
        setAuthStatus("error");
        setAuthUserEmail("");
        setAuthMessage(copy.authInitError);
      }
    }

    void bootstrapAuthState();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [copy.authInitError, isLocalAuthBypass]);

  const onSignInWithGoogle = async () => {
    setIsAuthBusy(true);
    setAuthMessage("");
    try {
      const { signInWithGoogle } = await loadAuthClient();
      await signInWithGoogle();
    } catch {
      setAuthStatus("error");
      setAuthMessage(copy.authSignInError);
    } finally {
      setIsAuthBusy(false);
    }
  };

  const onContinueWithLocalBypass = () => {
    window.localStorage.setItem(LOCAL_AUTH_BYPASS_KEY, "true");
    setIsLocalAuthBypass(true);
    setAuthStatus("authenticated");
    setAuthUserEmail("local-test@burnout.dev");
    setAuthMessage("");
  };

  const onSignOutGoogle = async () => {
    if (isLocalAuthBypass) {
      window.localStorage.removeItem(LOCAL_AUTH_BYPASS_KEY);
      setIsLocalAuthBypass(false);
      setAuthStatus("anonymous");
      setAuthUserEmail("");
      setAuthMessage("");
      return;
    }

    setIsAuthBusy(true);
    setAuthMessage("");
    try {
      const { signOut } = await loadAuthClient();
      await signOut();
      setAuthStatus("anonymous");
      setAuthUserEmail("");
    } catch {
      setAuthStatus("error");
      setAuthMessage(copy.authSignOutError);
    } finally {
      setIsAuthBusy(false);
    }
  };

  if (authStatus === "checking") {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-3 sm:px-6">
        <AppHeader
          isAuthenticated={false}
          userEmail=""
          hasProAccess={hasProAccess}
          isAuthBusy={isAuthBusy}
          onOpenPricing={() => {
            setActiveSection("pricing");
            navigate("/app/pricing");
          }}
          onOpenSettings={() => {
            setActiveSection("settings");
            navigate("/app/settings");
          }}
          onSignOut={onSignOutGoogle}
          onSignIn={onSignInWithGoogle}
        />
          <Card>
          <CardContent className="p-5 text-sm text-calm">
            {copy.checkingAuth}
          </CardContent>
        </Card>
      </main>
    );
  }

  if (
    (authStatus === "anonymous" || authStatus === "error") &&
    activeSection !== "pricing"
  ) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-calm">
            Daily Resilience Dashboard
          </p>
          <h1 className="font-['Avenir_Next','Segoe_UI',sans-serif] text-3xl font-semibold leading-tight">
            Burnout Guard
          </h1>
          <p className="max-w-2xl text-sm text-calm">
            {copy.preLoginDescription}
          </p>
        </header>
        <LandingPage
          isBusy={isAuthBusy}
          message={authMessage}
          canUseBypass={canUseLocalBypass}
          onSignInWithGoogle={onSignInWithGoogle}
          onContinueWithLocalBypass={onContinueWithLocalBypass}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-3 sm:px-6">
      <AppHeader
        isAuthenticated={authStatus === "authenticated"}
        userEmail={authUserEmail}
        hasProAccess={hasProAccess}
        isAuthBusy={isAuthBusy}
        onOpenPricing={() => {
          setActiveSection("pricing");
          navigate("/app/pricing");
        }}
        onOpenSettings={() => {
          setActiveSection("settings");
          navigate("/app/settings");
        }}
        onSignOut={onSignOutGoogle}
        onSignIn={onSignInWithGoogle}
      />

      {activeSection === "day" && (
        <>
          <header className="space-y-3 pt-1">
            <Badge variant="secondary" className="w-fit">
              Workspace
            </Badge>
            <h1 className="font-['Avenir_Next','Segoe_UI',sans-serif] text-3xl font-semibold leading-tight sm:text-4xl">
              Burnout Guard App
            </h1>
            <p className="max-w-2xl text-sm text-calm">
              {BRAND_CATCHPHRASE}
            </p>
          </header>

          <InfoDeskHeader />

          <Card className="border-slate-200/90 bg-white/80">
            <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-calm">
                {daySessionState === "before-work" &&
                  copy.sessionBeforeWork}
                {daySessionState === "working" &&
                  copy.sessionWorking}
                {daySessionState === "after-work" &&
                  copy.sessionAfterWork}
              </p>
              <Badge variant="secondary">
                {daySessionState === "before-work" && copy.stateBeforeWork}
                {daySessionState === "working" && copy.stateWorking}
                {daySessionState === "after-work" && copy.stateAfterWork}
              </Badge>
            </CardContent>
          </Card>

          {daySessionState === "before-work" && (
            <DayStartPanel onStartDay={onStartDay} />
          )}

          {daySessionState === "working" && (
            <>
              <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <CreateTaskForm onCreateTask={onCreateTask} />
                <BurnoutSummary
                  report={burnoutReport}
                  completedTodayCount={completedTodayCount}
                />
              </section>

              <TaskBoard tasks={tasks} onStatusChange={onStatusChange} />

              <Card>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-calm">
                    {copy.finishHint}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onFinishDay}
                    aria-label={copy.finishDay}
                  >
                    {copy.finishDay}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {daySessionState === "after-work" && dayEndReport && (
            <DayEndReport
              report={dayEndReport}
              aiAccessMode={aiAccessMode}
              isAiEvaluating={isAiEvaluating}
              onPrepareNextDay={onPrepareNextDay}
            />
          )}

          {daySessionState === "after-work" && !dayEndReport && (
            <Card>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-calm">
                  {copy.resetHint}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrepareNextDay}
                  aria-label={copy.restart}
                >
                  {copy.restart}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeSection === "pricing" && (
        <PricingPage
          hasSavedApiKey={Boolean(storedAiKey)}
          hasProAccess={hasProAccess}
          onOpenSettings={() => {
            setActiveSection("settings");
            navigate("/app/settings");
          }}
          onActivateProAccess={onActivateProAccess}
          onDeactivateProAccess={onDeactivateProAccess}
        />
      )}

      {activeSection === "settings" && (
        <>
          <header className="space-y-3 pt-1">
            <Badge variant="secondary" className="w-fit">
              Workspace
            </Badge>
            <h1 className="font-['Avenir_Next','Segoe_UI',sans-serif] text-3xl font-semibold leading-tight sm:text-4xl">
              {copy.settingsTitle}
            </h1>
          </header>
          <SettingsPage
            userEmail={authUserEmail}
            hasSavedApiKey={Boolean(storedAiKey)}
            hasProAccess={hasProAccess}
            onActivateProAccess={onActivateProAccess}
            onSaveApiKey={onSaveAiKey}
            onClearApiKey={onClearAiKey}
          />
        </>
      )}
    </main>
  );
}
