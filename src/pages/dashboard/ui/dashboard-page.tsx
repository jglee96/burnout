import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  BRAND_CATCHPHRASE,
  clearLocalAuthBypassFlag,
  clearStoredAiKey,
  countCompletedToday,
  disableStoredAiProFlag,
  enableStoredAiProFlag,
  getDashboardCopy,
  readLocalAuthBypassFlag,
  readStoredAiKey,
  readStoredAiProFlag,
  readStoredDaySessionState,
  readStoredTasks,
  saveLocalAuthBypassFlag,
  saveStoredAiKey,
  sectionFromPath,
  writeStoredDaySessionState,
  writeStoredTasks
} from "@/pages/dashboard/model";
import type {
  AppSection,
  AuthStatus,
  DaySessionState
} from "@/pages/dashboard/model";
import { LandingPage } from "@/pages/landing";
import { PricingPage } from "@/pages/pricing";
import { SettingsPage } from "@/pages/settings";
import { getAiDetailedSuggestion } from "@/shared/api/ai-evaluation-client";
import { isDevOrTestRuntime } from "@/shared/lib/env/runtime-mode";
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

const authClientModulePromise = import("@/shared/api/auth-client");
const supabaseClientModulePromise = import("@/shared/api/supabase-client");

async function loadAuthClient() {
  return authClientModulePromise;
}

async function loadSupabaseClient() {
  return supabaseClientModulePromise;
}
export type { AppSection } from "@/pages/dashboard/model";

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
  const copy = useMemo(() => getDashboardCopy(locale), [locale]);
  const canUseLocalBypass = isDevOrTestRuntime;

  const aiAccessMode: AiAccessMode = hasProAccess
    ? "pro"
    : storedAiKey
      ? "byok"
      : "none";

  const completedTodayCount = useMemo(() => countCompletedToday(tasks), [tasks]);

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

  const openPricingSection = useCallback(() => {
    setActiveSection("pricing");
    navigate("/app/pricing");
  }, []);

  const openSettingsSection = useCallback(() => {
    setActiveSection("settings");
    navigate("/app/settings");
  }, []);

  const onSaveAiKey = (nextAiKey: string) => {
    setStoredAiKey(nextAiKey);
    saveStoredAiKey(nextAiKey);
  };

  const onClearAiKey = () => {
    setStoredAiKey("");
    clearStoredAiKey();
  };

  const onActivateProAccess = () => {
    setHasProAccess(true);
    enableStoredAiProFlag();
  };

  const onDeactivateProAccess = () => {
    setHasProAccess(false);
    disableStoredAiProFlag();
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
    if (canUseLocalBypass || !isLocalAuthBypass) {
      return;
    }
    clearLocalAuthBypassFlag();
    setIsLocalAuthBypass(false);
  }, [canUseLocalBypass, isLocalAuthBypass]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    async function bootstrapAuthState() {
      if (canUseLocalBypass && isLocalAuthBypass) {
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
  }, [canUseLocalBypass, copy.authInitError, isLocalAuthBypass]);

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
    if (!canUseLocalBypass) {
      return;
    }
    saveLocalAuthBypassFlag();
    setIsLocalAuthBypass(true);
    setAuthStatus("authenticated");
    setAuthUserEmail("local-test@burnout.dev");
    setAuthMessage("");
  };

  const onSignOutGoogle = async () => {
    if (isLocalAuthBypass) {
      clearLocalAuthBypassFlag();
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
          onOpenPricing={openPricingSection}
          onOpenSettings={openSettingsSection}
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
        onOpenPricing={openPricingSection}
        onOpenSettings={openSettingsSection}
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
          onOpenSettings={openSettingsSection}
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
