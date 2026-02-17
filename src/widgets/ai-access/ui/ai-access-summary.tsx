import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useAppLocale } from "@/shared/lib/i18n/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface AiAccessSummaryProps {
  hasSavedApiKey: boolean;
  hasProAccess: boolean;
  onOpenSettings?: () => void;
  onActivateProAccess?: () => void;
}

export function AiAccessSummary({
  hasSavedApiKey,
  hasProAccess,
  onOpenSettings,
  onActivateProAccess
}: AiAccessSummaryProps) {
  const { locale } = useAppLocale();
  const copy =
    locale === "ko"
      ? {
          title: "BYOK vs Pro 요약",
          description:
            "BYOK는 개인 키를 등록해 사용하고, Pro는 결제로 키 없이 AI 평가를 사용합니다.",
          byok: "BYOK",
          byokEnabled: "활성",
          byokDisabled: "미설정",
          byokDescription: "본인 API 키를 입력해 AI 상세 평가를 사용합니다.",
          toSettings: "설정으로 이동",
          pro: "Pro",
          proEnabled: "활성",
          proDisabled: "비활성",
          proDescription: "결제 상태로 권한을 받아 키 없이 AI 상세 평가를 사용합니다.",
          activatePro: "Pro 활성화"
        }
      : locale === "ja"
        ? {
            title: "BYOK vs Pro 概要",
            description:
              "BYOKは個人キー登録で利用し、Proは決済によりキーなしでAI評価を利用します。",
            byok: "BYOK",
            byokEnabled: "有効",
            byokDisabled: "未設定",
            byokDescription: "個人APIキーでAI詳細評価を利用します。",
            toSettings: "設定へ移動",
            pro: "Pro",
            proEnabled: "有効",
            proDisabled: "無効",
            proDescription: "決済権限でキーなしAI詳細評価を利用します。",
            activatePro: "Proを有効化"
          }
        : {
            title: "BYOK vs Pro summary",
            description:
              "BYOK uses your personal key, while Pro provides keyless AI evaluation through billing.",
            byok: "BYOK",
            byokEnabled: "Enabled",
            byokDisabled: "Not set",
            byokDescription:
              "Use detailed AI evaluation by registering your own API key.",
            toSettings: "Go to settings",
            pro: "Pro",
            proEnabled: "Enabled",
            proDisabled: "Disabled",
            proDescription:
              "Use detailed AI evaluation without a key through paid entitlement.",
            activatePro: "Activate Pro"
          };

  return (
    <Card className="border-slate-200/90 bg-white/90">
      <CardHeader className="space-y-2">
        <CardTitle>{copy.title}</CardTitle>
        <p className="text-sm text-calm">{copy.description}</p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">{copy.byok}</p>
            <Badge variant={hasSavedApiKey ? "secondary" : "warning"}>
              {hasSavedApiKey ? copy.byokEnabled : copy.byokDisabled}
            </Badge>
          </div>
          <p className="text-sm text-calm">{copy.byokDescription}</p>
          {onOpenSettings && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onOpenSettings}
              aria-label={copy.toSettings}
            >
              {copy.toSettings}
            </Button>
          )}
        </section>

        <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">{copy.pro}</p>
            <Badge variant={hasProAccess ? "warning" : "secondary"}>
              {hasProAccess ? copy.proEnabled : copy.proDisabled}
            </Badge>
          </div>
          <p className="text-sm text-calm">{copy.proDescription}</p>
          {!hasProAccess && onActivateProAccess && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onActivateProAccess}
              aria-label={copy.activatePro}
            >
              {copy.activatePro}
            </Button>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
