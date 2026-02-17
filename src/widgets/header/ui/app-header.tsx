import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleUserRound } from "lucide-react";
import type { AppSection } from "@/pages/dashboard/ui/dashboard-page";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

interface AppHeaderProps {
  activeSection: AppSection;
  isAuthenticated: boolean;
  userEmail: string;
  hasProAccess: boolean;
  isAuthBusy: boolean;
  onOpenDay: () => void;
  onOpenPricing: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
}

export function AppHeader({
  activeSection,
  isAuthenticated,
  userEmail,
  hasProAccess,
  isAuthBusy,
  onOpenDay,
  onOpenPricing,
  onOpenSettings,
  onSignOut,
  onSignIn
}: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

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
          <button
            type="button"
            className="rounded-lg bg-ink px-2 py-1 text-xs font-semibold text-white"
            onClick={onOpenDay}
            aria-label="하루 관리 열기"
          >
            BG
          </button>
          <p className="font-['Avenir_Next','Segoe_UI',sans-serif] text-sm font-semibold tracking-wide">
            Burnout Guard
          </p>
          {isAuthenticated && (
            <Badge variant={hasProAccess ? "warning" : "secondary"}>
              {hasProAccess ? "Pro" : "Free"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={activeSection === "day" ? "default" : "outline"}
            onClick={onOpenDay}
          >
            하루 관리
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeSection === "pricing" ? "default" : "outline"}
            onClick={onOpenPricing}
          >
            요금제
          </Button>

          {!isAuthenticated ? (
            <Button
              type="button"
              size="sm"
              onClick={onSignIn}
              disabled={isAuthBusy}
              aria-label="Google 로그인"
            >
              로그인
            </Button>
          ) : (
            <div className="relative" ref={menuWrapRef}>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1 rounded-full border border-slate-300 bg-white px-3 text-sm font-medium text-ink hover:bg-slate-50"
                onClick={() => setIsMenuOpen((current) => !current)}
                aria-label="프로필 메뉴 열기"
              >
                <CircleUserRound className="h-4 w-4" aria-hidden />
                <ChevronDown className="h-4 w-4" aria-hidden />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-11 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-panel">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs uppercase tracking-[0.14em] text-calm">
                      계정 정보
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
                      개인 설정
                    </button>
                    <button
                      type="button"
                      className="rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-slate-100"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenPricing();
                      }}
                    >
                      요금제
                    </button>
                    <button
                      type="button"
                      className="rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-slate-100"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onSignOut();
                      }}
                    >
                      로그아웃
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
