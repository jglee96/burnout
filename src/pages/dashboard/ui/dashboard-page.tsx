import { useEffect, useMemo, useState } from "react";
import { CreateTaskForm } from "@/features/task/create-task/ui/create-task-form";
import { calculateBurnoutRisk } from "@/entities/task/model/calculate-burnout-risk";
import { evaluateDay } from "@/entities/task/model/evaluate-day";
import type {
  AiAccessMode,
  DayEvaluationReport,
  Task,
  TaskPriority,
  TaskStatus
} from "@/entities/task/model/types";
import { getAiDetailedSuggestion } from "@/shared/api/ai-evaluation-client";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { DayEndReport } from "@/widgets/day-session/ui/day-end-report";
import { DayStartPanel } from "@/widgets/day-session/ui/day-start-panel";
import { BurnoutSummary } from "@/widgets/burnout-summary/ui/burnout-summary";
import { InfoDeskHeader } from "@/widgets/info-desk/ui/info-desk-header";
import { LandingPage } from "@/pages/landing/ui/landing-page";
import { PricingPage } from "@/pages/pricing/ui/pricing-page";
import { SettingsPage } from "@/pages/settings/ui/settings-page";
import { TaskBoard } from "@/widgets/task-board/ui/task-board";
import { AppToolbar } from "@/widgets/toolbar/ui/app-toolbar";

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
type AppSection = "day" | "pricing" | "settings";

const AI_KEY_STORAGE_KEY = "burnout-ai-key";
const AI_PRO_STORAGE_KEY = "burnout-ai-pro";
const DAY_SESSION_STORAGE_KEY = "burnout-day-session";
const LOCAL_AUTH_BYPASS_KEY = "burnout-local-auth-bypass";
const TASKS_STORAGE_KEY = "burnout-tasks";

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
  const [daySessionState, setDaySessionState] = useState<DaySessionState>(
    readStoredDaySessionState
  );
  const [activeSection, setActiveSection] = useState<AppSection>("day");
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
    () => calculateBurnoutRisk({ tasks, completedTodayCount }),
    [tasks, completedTodayCount]
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
      burnoutRiskReport: burnoutReport
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
      dayEvaluationReport: report
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
          import("@/shared/api/auth-client"),
          import("@/shared/api/supabase-client")
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
        setAuthMessage(
          "인증 초기화에 실패했습니다. Supabase URL/Publishable Key를 점검하세요."
        );
      }
    }

    void bootstrapAuthState();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [isLocalAuthBypass]);

  const onSignInWithGoogle = async () => {
    setIsAuthBusy(true);
    setAuthMessage("");
    try {
      const { signInWithGoogle } = await import("@/shared/api/auth-client");
      await signInWithGoogle();
    } catch {
      setAuthStatus("error");
      setAuthMessage("Google 로그인에 실패했습니다. OAuth 설정을 확인하세요.");
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
      const { signOut } = await import("@/shared/api/auth-client");
      await signOut();
      setAuthStatus("anonymous");
      setAuthUserEmail("");
    } catch {
      setAuthStatus("error");
      setAuthMessage("로그아웃에 실패했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      setIsAuthBusy(false);
    }
  };

  if (authStatus === "checking") {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-calm">
            Daily Resilience Dashboard
          </p>
          <h1 className="text-3xl font-semibold leading-tight">
            Burnout Guard
          </h1>
        </header>
        <Card>
          <CardContent className="p-5 text-sm text-calm">
            로그인 상태를 확인하는 중입니다.
          </CardContent>
        </Card>
      </main>
    );
  }

  if (authStatus === "anonymous" || authStatus === "error") {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-calm">
            Daily Resilience Dashboard
          </p>
          <h1 className="text-3xl font-semibold leading-tight">
            Burnout Guard
          </h1>
          <p className="max-w-2xl text-sm text-calm">
            업무 시작 전 로그인하고, 퇴근 전 냉정한 리뷰를 남겨 번아웃을
            예방하세요.
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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-calm">
          Daily Resilience Dashboard
        </p>
        <h1 className="text-3xl font-semibold leading-tight">Burnout Guard</h1>
        <p className="max-w-2xl text-sm text-calm">
          Keep one clear priority, cap in-progress work, and review completion
          momentum before overload builds up.
        </p>
      </header>
      <AppToolbar
        activeSection={activeSection}
        userEmail={authUserEmail}
        hasProAccess={hasProAccess}
        onChangeSection={setActiveSection}
        onSignOut={onSignOutGoogle}
        isSignOutBusy={isAuthBusy}
      />
      <InfoDeskHeader />

      {activeSection === "day" && (
        <>
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
                    퇴근 전 하루를 마감하면, 완료/미완료 비율과 위험도를
                    기준으로 내일 개선 계획을 제안합니다.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onFinishDay}
                    aria-label="하루 마무리하기"
                  >
                    하루 마무리하기
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
                  종료 평가는 새로고침으로 초기화되었습니다. 다시 시작해서 오늘
                  작업을 이어갈 수 있습니다.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrepareNextDay}
                  aria-label="다시 시작하기"
                >
                  다시 시작하기
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeSection === "pricing" && (
        <PricingPage
          hasProAccess={hasProAccess}
          onActivateProAccess={onActivateProAccess}
          onDeactivateProAccess={onDeactivateProAccess}
        />
      )}

      {activeSection === "settings" && (
        <SettingsPage
          userEmail={authUserEmail}
          hasSavedApiKey={Boolean(storedAiKey)}
          onSaveApiKey={onSaveAiKey}
          onClearApiKey={onClearAiKey}
        />
      )}
    </main>
  );
}
