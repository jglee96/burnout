import type { AppLocale } from "@/shared/lib/i18n/locale";

export const BRAND_CATCHPHRASE =
  "Keep one clear priority, cap in-progress work, and review completion momentum before overload builds up.";

export interface DashboardCopy {
  authInitError: string;
  authSignInError: string;
  authSignOutError: string;
  checkingAuth: string;
  preLoginDescription: string;
  sessionBeforeWork: string;
  sessionWorking: string;
  sessionAfterWork: string;
  stateBeforeWork: string;
  stateWorking: string;
  stateAfterWork: string;
  finishHint: string;
  finishDay: string;
  resetHint: string;
  restart: string;
  settingsTitle: string;
}

const DASHBOARD_COPY: Record<AppLocale, DashboardCopy> = {
  ko: {
    authInitError: "로그인 상태를 불러오지 못했습니다. 잠시 후 다시 시도하세요.",
    authSignInError: "Google 로그인에 실패했습니다. 잠시 후 다시 시도하세요.",
    authSignOutError: "로그아웃에 실패했습니다. 잠시 후 다시 시도하세요.",
    checkingAuth: "로그인 상태를 확인하는 중입니다.",
    preLoginDescription:
      "업무 시작 전 로그인하고, 퇴근 전 냉정한 리뷰를 남겨 번아웃을 예방하세요.",
    sessionBeforeWork: "오늘 업무를 시작할 준비 단계입니다.",
    sessionWorking: "업무 진행 중입니다. Doing을 최소화해 집중을 유지하세요.",
    sessionAfterWork: "업무 마무리 상태입니다. 평가를 확인하고 다음 날을 준비하세요.",
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
  },
  ja: {
    authInitError: "ログイン状態を取得できませんでした。しばらくして再試行してください。",
    authSignInError:
      "Googleログインに失敗しました。しばらくして再試行してください。",
    authSignOutError:
      "ログアウトに失敗しました。しばらくしてから再試行してください。",
    checkingAuth: "ログイン状態を確認しています。",
    preLoginDescription:
      "業務開始前にログインし、退勤前に客観レビューを残してバーンアウトを防ぎましょう。",
    sessionBeforeWork: "今日の業務を開始する準備段階です。",
    sessionWorking: "業務中です。Doingを最小化して集中を維持してください。",
    sessionAfterWork: "業務終了状態です。評価を確認して翌日の準備をしてください。",
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
  },
  en: {
    authInitError:
      "We couldn't load your sign-in status. Please try again in a moment.",
    authSignInError:
      "Google sign-in failed. Please try again in a moment.",
    authSignOutError: "Sign-out failed. Please try again shortly.",
    checkingAuth: "Checking your sign-in status.",
    preLoginDescription:
      "Sign in before work and leave an objective review before you leave to prevent burnout.",
    sessionBeforeWork: "You're in pre-start mode for today.",
    sessionWorking: "You are in work mode. Keep Doing minimal to protect focus.",
    sessionAfterWork: "You are in wrap-up mode. Review today and prepare tomorrow.",
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
  }
};

export function getDashboardCopy(locale: AppLocale): DashboardCopy {
  return DASHBOARD_COPY[locale];
}
