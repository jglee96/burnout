import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleUserRound } from "lucide-react";
import { useAppLocale } from "@/shared/lib/i18n/locale";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

interface AppHeaderProps {
  isAuthenticated: boolean;
  userEmail: string;
  hasProAccess: boolean;
  isAuthBusy: boolean;
  onOpenSettings: () => void;
  onOpenPricing: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
}

export function AppHeader({
  isAuthenticated,
  userEmail,
  hasProAccess,
  isAuthBusy,
  onOpenSettings,
  onOpenPricing,
  onSignOut,
  onSignIn
}: AppHeaderProps) {
  const { locale } = useAppLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);
  const copy =
    locale === "ko"
      ? {
          signIn: "로그인",
          signInAria: "Google 로그인",
          profileMenuAria: "프로필 메뉴 열기",
          accountInfo: "계정 정보",
          settings: "개인 설정",
          pricing: "요금제",
          signOut: "로그아웃",
          pro: "Pro",
          free: "Free"
        }
      : locale === "ja"
        ? {
            signIn: "ログイン",
            signInAria: "Googleログイン",
            profileMenuAria: "プロフィールメニューを開く",
            accountInfo: "アカウント情報",
            settings: "個人設定",
            pricing: "料金プラン",
            signOut: "ログアウト",
            pro: "Pro",
            free: "Free"
          }
        : {
            signIn: "Sign in",
            signInAria: "Sign in with Google",
            profileMenuAria: "Open profile menu",
            accountInfo: "Account",
            settings: "Settings",
            pricing: "Pricing",
            signOut: "Sign out",
            pro: "Pro",
            free: "Free"
          };

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!menuWrapRef.current) {
        return;
      }
      if (!menuWrapRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  return (
    <Card className="sticky top-0 z-30 border-slate-200/90 bg-white/85 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-ink px-2 py-1 text-xs font-semibold text-white">
            BG
          </div>
          <p className="font-['Avenir_Next','Segoe_UI',sans-serif] text-sm font-semibold tracking-wide">
            Burnout Guard
          </p>
          {isAuthenticated && (
            <Badge variant={hasProAccess ? "warning" : "secondary"}>
              {hasProAccess ? copy.pro : copy.free}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <Button
              type="button"
              size="sm"
              onClick={onSignIn}
              disabled={isAuthBusy}
              aria-label={copy.signInAria}
            >
              {copy.signIn}
            </Button>
          ) : (
            <div className="relative" ref={menuWrapRef}>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1 rounded-full border border-slate-300 bg-white px-3 text-sm font-medium text-ink hover:bg-slate-50"
                onClick={() => setIsMenuOpen((current) => !current)}
                aria-label={copy.profileMenuAria}
              >
                <CircleUserRound className="h-4 w-4" aria-hidden />
                <ChevronDown className="h-4 w-4" aria-hidden />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-11 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-panel">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs uppercase tracking-[0.14em] text-calm">
                      {copy.accountInfo}
                    </p>
                    <p className="truncate text-sm font-medium text-ink">
                      {userEmail}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-col gap-1">
                    <button
                      type="button"
                      className="rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-slate-100"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenSettings();
                      }}
                    >
                      {copy.settings}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-slate-100"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenPricing();
                      }}
                    >
                      {copy.pricing}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-slate-100"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onSignOut();
                      }}
                    >
                      {copy.signOut}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
