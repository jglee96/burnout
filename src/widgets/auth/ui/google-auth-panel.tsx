import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type AuthStatus = "checking" | "anonymous" | "authenticated" | "error";

interface GoogleAuthPanelProps {
  authStatus: AuthStatus;
  isBusy: boolean;
  userEmail?: string;
  message?: string;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function GoogleAuthPanel({
  authStatus,
  isBusy,
  userEmail,
  message,
  onSignIn,
  onSignOut
}: GoogleAuthPanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Google 로그인</CardTitle>
        <Badge
          variant={authStatus === "authenticated" ? "secondary" : "warning"}
        >
          {authStatus === "authenticated" ? "연결됨" : "연결 필요"}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          {authStatus === "checking" && (
            <p className="text-sm text-calm">인증 상태를 확인하고 있습니다.</p>
          )}
          {authStatus === "anonymous" && (
            <p className="text-sm text-calm">
              결제 상태와 사용자 데이터를 동기화하려면 로그인하세요.
            </p>
          )}
          {authStatus === "authenticated" && (
            <p className="text-sm text-calm">
              로그인됨:{" "}
              <span className="font-medium text-ink">{userEmail}</span>
            </p>
          )}
          {authStatus === "error" && (
            <p className="text-sm text-danger">
              {message ??
                "로그인 상태를 확인하지 못했습니다. 설정을 점검하세요."}
            </p>
          )}
          {authStatus !== "error" && message && (
            <p className="text-xs text-calm">{message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {authStatus === "authenticated" ? (
            <Button
              type="button"
              variant="outline"
              onClick={onSignOut}
              disabled={isBusy}
              aria-label="Google 로그아웃"
            >
              로그아웃
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSignIn}
              disabled={isBusy || authStatus === "checking"}
              aria-label="Google 로그인"
            >
              Google 로그인
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
