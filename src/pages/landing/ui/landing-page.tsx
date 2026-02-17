import { Button } from "@/shared/ui/button";
import { useAppLocale } from "@/shared/lib/i18n/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface LandingPageProps {
  isBusy: boolean;
  message?: string;
  canUseBypass: boolean;
  onSignInWithGoogle: () => void;
  onContinueWithLocalBypass: () => void;
}

export function LandingPage({
  isBusy,
  message,
  canUseBypass,
  onSignInWithGoogle,
  onContinueWithLocalBypass
}: LandingPageProps) {
  const { locale } = useAppLocale();
  const copy =
    locale === "ko"
      ? {
          title: "Burnout Guard 시작하기",
          description:
            "업무 시작 전 로그인하면 오늘의 시작/종료 흐름과 AI 개선안을 계정 기준으로 관리할 수 있습니다.",
          signIn: "Google로 로그인",
          signInAria: "Google로 로그인",
          localMode: "로컬 테스트 모드",
          localModeAria: "로컬 테스트 모드"
        }
      : locale === "ja"
        ? {
            title: "Burnout Guard を開始",
            description:
              "業務開始前にログインすると、開始/終了フローとAI改善案をアカウント基準で管理できます。",
            signIn: "Googleでログイン",
            signInAria: "Googleでログイン",
            localMode: "ローカルテストモード",
            localModeAria: "ローカルテストモード"
          }
        : {
            title: "Get started with Burnout Guard",
            description:
              "Sign in before work to manage your daily start/end loop and AI improvement guidance with your account.",
            signIn: "Sign in with Google",
            signInAria: "Sign in with Google",
            localMode: "Local test mode",
            localModeAria: "Local test mode"
          };

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-calm">{copy.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="lg"
              onClick={onSignInWithGoogle}
              disabled={isBusy}
              aria-label={copy.signInAria}
            >
              {copy.signIn}
            </Button>
            {canUseBypass && (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={onContinueWithLocalBypass}
                aria-label={copy.localModeAria}
              >
                {copy.localMode}
              </Button>
            )}
          </div>
          {message && <p className="text-sm text-danger">{message}</p>}
        </CardContent>
      </Card>
    </section>
  );
}
