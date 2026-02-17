import { Button } from "@/shared/ui/button";
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
  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Burnout Guard 시작하기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-calm">
            업무 시작 전 로그인하면 오늘의 시작/종료 흐름과 AI 개선안을 계정
            기준으로 관리할 수 있습니다.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="lg"
              onClick={onSignInWithGoogle}
              disabled={isBusy}
              aria-label="Google로 로그인"
            >
              Google로 로그인
            </Button>
            {canUseBypass && (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={onContinueWithLocalBypass}
                aria-label="로컬 테스트 모드"
              >
                로컬 테스트 모드
              </Button>
            )}
          </div>
          {message && <p className="text-sm text-danger">{message}</p>}
        </CardContent>
      </Card>
    </section>
  );
}
