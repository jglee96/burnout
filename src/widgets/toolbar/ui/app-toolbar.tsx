import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

type AppSection = "day" | "pricing" | "settings";

interface AppToolbarProps {
  activeSection: AppSection;
  userEmail: string;
  hasProAccess: boolean;
  onChangeSection: (section: AppSection) => void;
  onSignOut: () => void;
  isSignOutBusy: boolean;
}

const sectionItems: Array<{ key: AppSection; label: string }> = [
  { key: "day", label: "하루 관리" },
  { key: "pricing", label: "요금제" },
  { key: "settings", label: "개인 설정" }
];

export function AppToolbar({
  activeSection,
  userEmail,
  hasProAccess,
  onChangeSection,
  onSignOut,
  isSignOutBusy
}: AppToolbarProps) {
  return (
    <Card className="border-slate-200/80 bg-white/80">
      <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <p className="max-w-full truncate text-sm font-medium text-ink/85">
            {userEmail}
          </p>
          <Badge variant={hasProAccess ? "warning" : "secondary"}>
            {hasProAccess ? "Pro" : "Free"}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/90 bg-white p-1">
          {sectionItems.map((item) => (
            <Button
              key={item.key}
              type="button"
              size="sm"
              variant={activeSection === item.key ? "default" : "outline"}
              onClick={() => onChangeSection(item.key)}
              aria-label={`${item.label} 페이지 열기`}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onSignOut}
            disabled={isSignOutBusy}
            aria-label="로그아웃"
          >
            로그아웃
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
