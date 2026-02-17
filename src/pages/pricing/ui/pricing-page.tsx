import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useAppLocale } from "@/shared/lib/i18n/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { AiAccessSummary } from "@/widgets/ai-access";

interface PricingPageProps {
  hasSavedApiKey: boolean;
  hasProAccess: boolean;
  onOpenSettings: () => void;
  onActivateProAccess: () => void;
  onDeactivateProAccess: () => void;
}

export function PricingPage({
  hasSavedApiKey,
  hasProAccess,
  onOpenSettings,
  onActivateProAccess,
  onDeactivateProAccess
}: PricingPageProps) {
  const { locale } = useAppLocale();
  const copy =
    locale === "ko"
      ? {
          badge: "Pricing",
          titleTop: "명확한 무료 플랜,",
          titleBottom: "집중도를 높이는 Pro 플랜.",
          description:
            "단순한 2단 플랜 구조입니다. 로그인 없이 조회할 수 있고, 로그인 후에는 Pro 상태를 바로 변경할 수 있습니다.",
          freeDesc: "개인 루틴을 안정적으로 유지하기 위한 기본 플로우.",
          freeItems: [
            "To Do/Doing/Done 보드",
            "하루 시작/마무리 세션 관리",
            "기본 번아웃 리스크 평가",
            "룰 기반 내일 개선안"
          ],
          proDesc: "과부하 원인 분석과 다음 날 실행 템플릿까지 자동으로 제공.",
          proItems: [
            "AI 상세 진단 + 리스크 드라이버 분석",
            "내일 집중 계획 + 시간표 템플릿",
            "Stop Rules 자동 제안",
            "결제 기반 권한 관리"
          ],
          activatePro: "Pro 결제 완료 처리",
          deactivatePro: "Pro 비활성화",
          compareTitle: "Free vs Pro 비교",
          feature: "기능"
        }
      : locale === "ja"
        ? {
            badge: "Pricing",
            titleTop: "明確な無料プラン、",
            titleBottom: "集中を高めるProプラン。",
            description:
              "シンプルな2段プラン構成です。ログインなしで閲覧でき、ログイン後はPro状態をすぐ変更できます。",
            freeDesc: "個人の業務リズムを安定させる基本フロー。",
            freeItems: [
              "To Do/Doing/Done ボード",
              "勤務開始/終了セッション管理",
              "基本バーンアウトリスク評価",
              "ルールベースの翌日改善案"
            ],
            proDesc:
              "過負荷要因の分析から翌日の実行テンプレートまで自動で提供。",
            proItems: [
              "AI詳細診断 + リスクドライバー分析",
              "翌日の集中計画 + 時間割テンプレート",
              "Stop Rules 自動提案",
              "決済ベース権限管理"
            ],
            activatePro: "Pro 決済完了として有効化",
            deactivatePro: "Pro を無効化",
            compareTitle: "Free vs Pro 比較",
            feature: "機能"
          }
        : {
            badge: "Pricing",
            titleTop: "A clear free plan,",
            titleBottom: "and a Pro plan for deeper focus.",
            description:
              "Simple two-tier pricing. You can view it without login, and switch Pro status instantly after login.",
            freeDesc: "Core flow for maintaining a stable daily routine.",
            freeItems: [
              "To Do/Doing/Done board",
              "Start/end-of-day session flow",
              "Baseline burnout risk score",
              "Rule-based next-day actions"
            ],
            proDesc:
              "Automatic overload diagnosis and next-day execution template.",
            proItems: [
              "Detailed AI diagnosis + risk drivers",
              "Tomorrow focus plan + schedule template",
              "Automatic stop-rules",
              "Billing-based entitlement"
            ],
            activatePro: "Mark Pro payment complete",
            deactivatePro: "Deactivate Pro",
            compareTitle: "Free vs Pro comparison",
            feature: "Feature"
          };

  const comparisonRows = [
    {
      feature:
        locale === "ko"
          ? "작업 보드와 하루 시작/마무리 루프"
          : locale === "ja"
            ? "タスクボードと開始/終了ループ"
            : "Task board and start/end loop",
      free: locale === "en" ? "Included" : locale === "ja" ? "含む" : "포함",
      pro: locale === "en" ? "Included" : locale === "ja" ? "含む" : "포함"
    },
    {
      feature:
        locale === "ko"
          ? "기본 리스크 평가"
          : locale === "ja"
            ? "基本リスク評価"
            : "Baseline risk evaluation",
      free: locale === "en" ? "Included" : locale === "ja" ? "含む" : "포함",
      pro: locale === "en" ? "Included" : locale === "ja" ? "含む" : "포함"
    },
    {
      feature:
        locale === "ko" ? "AI 상세 진단" : locale === "ja" ? "AI詳細診断" : "Detailed AI diagnosis",
      free: locale === "en" ? "Not included" : locale === "ja" ? "未対応" : "미지원",
      pro: locale === "en" ? "Included" : locale === "ja" ? "対応" : "지원"
    },
    {
      feature:
        locale === "ko"
          ? "내일 집중 계획 + 시간표 템플릿"
          : locale === "ja"
            ? "翌日の集中計画 + 時間割テンプレート"
            : "Tomorrow focus plan + schedule template",
      free: locale === "en" ? "Not included" : locale === "ja" ? "未対応" : "미지원",
      pro: locale === "en" ? "Included" : locale === "ja" ? "対応" : "지원"
    },
    {
      feature:
        locale === "ko"
          ? "중단 규칙(Stop Rules) 자동 제안"
          : locale === "ja"
            ? "停止ルール(Stop Rules) 自動提案"
            : "Automatic stop-rules suggestion",
      free: locale === "en" ? "Not included" : locale === "ja" ? "未対応" : "미지원",
      pro: locale === "en" ? "Included" : locale === "ja" ? "対応" : "지원"
    }
  ];

  return (
    <section className="space-y-6 pt-1">
      <div className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          {copy.badge}
        </Badge>
        <h1 className="font-['Avenir_Next','Segoe_UI',sans-serif] text-4xl font-semibold leading-tight sm:text-5xl">
          {copy.titleTop}
          <br />
          {copy.titleBottom}
        </h1>
        <p className="max-w-2xl text-sm text-calm">{copy.description}</p>
      </div>

      <AiAccessSummary
        hasSavedApiKey={hasSavedApiKey}
        hasProAccess={hasProAccess}
        onOpenSettings={onOpenSettings}
        onActivateProAccess={onActivateProAccess}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200/90 bg-white/90">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-2xl">Free</CardTitle>
              <Badge variant="secondary">₩0 / month</Badge>
            </div>
            <p className="text-sm text-calm">{copy.freeDesc}</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-calm">
            {copy.freeItems.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-900/20 bg-slate-950 text-white">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-2xl text-white">Pro</CardTitle>
              <Badge variant="warning">₩19,000 / month</Badge>
            </div>
            <p className="text-sm text-slate-300">{copy.proDesc}</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-200">
            {copy.proItems.map((item) => (
              <p key={item}>{item}</p>
            ))}

            <div className="pt-2">
              {!hasProAccess ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onActivateProAccess}
                  aria-label="Pro 활성화"
                  className="border-slate-500 bg-white text-ink hover:bg-slate-100"
                >
                  {copy.activatePro}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onDeactivateProAccess}
                  aria-label="Pro 비활성화"
                  className="border-slate-500 bg-white text-ink hover:bg-slate-100"
                >
                  {copy.deactivatePro}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/90 bg-white/90">
        <CardHeader>
          <CardTitle>{copy.compareTitle}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-calm">
                <th className="px-3 py-2 text-left font-medium">{copy.feature}</th>
                <th className="px-3 py-2 text-left font-medium">Free</th>
                <th className="px-3 py-2 text-left font-medium">Pro</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-ink">{row.feature}</td>
                  <td className="px-3 py-2 text-calm">{row.free}</td>
                  <td className="px-3 py-2 font-medium text-ink">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
