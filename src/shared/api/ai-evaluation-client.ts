import { buildAiDetailedSuggestion } from "@/entities/task/model/build-ai-detailed-suggestion";
import type {
  AIDetailedSuggestion,
  AiAccessMode,
  BurnoutRiskReport,
  DayEvaluationReport,
  Task
} from "@/entities/task/model/types";
import { requestJson } from "@/shared/api/client";
import { getClientEnv } from "@/shared/lib/env/client-env";
import type { AppLocale } from "@/shared/lib/i18n/locale";

interface AiEvaluationRequest {
  accessMode: Exclude<AiAccessMode, "none">;
  apiKey?: string;
  tasks: Task[];
  completedTodayCount: number;
  burnoutRiskReport: BurnoutRiskReport;
  dayEvaluationReport: DayEvaluationReport;
  locale: AppLocale;
}

function isAiDetailedSuggestion(data: unknown): data is AIDetailedSuggestion {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const record = data as Record<string, unknown>;
  return (
    (record.accessMode === "byok" || record.accessMode === "pro") &&
    typeof record.diagnosis === "string" &&
    Array.isArray(record.riskDrivers) &&
    Array.isArray(record.tomorrowFocusPlan) &&
    Array.isArray(record.scheduleTemplate) &&
    Array.isArray(record.stopRules)
  );
}

export async function getAiDetailedSuggestion({
  accessMode,
  apiKey,
  tasks,
  completedTodayCount,
  burnoutRiskReport,
  dayEvaluationReport,
  locale
}: AiEvaluationRequest): Promise<AIDetailedSuggestion> {
  const { apiBaseUrl } = getClientEnv();
  const endpoint = apiBaseUrl
    ? new URL("/api/ai/evaluate-day", apiBaseUrl).toString()
    : "/api/ai/evaluate-day";
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 3500);

  try {
    return await requestJson<AIDetailedSuggestion>(
      endpoint,
      {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({
          accessMode,
          apiKey,
          tasks,
          completedTodayCount,
          burnoutRiskReport,
          dayEvaluationReport,
          locale
        })
      },
      isAiDetailedSuggestion
    );
  } catch {
    return buildAiDetailedSuggestion({
      accessMode,
      tasks,
      completedTodayCount,
      burnoutRiskReport,
      dayEvaluationReport,
      locale
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}
