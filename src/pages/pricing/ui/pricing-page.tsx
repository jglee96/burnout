import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface PricingPageProps {
  hasProAccess: boolean;
  onActivateProAccess: () => void;
  onDeactivateProAccess: () => void;
}

export function PricingPage({
  hasProAccess,
  onActivateProAccess,
  onDeactivateProAccess
}: PricingPageProps) {
  const comparisonRows = [
    {
      feature: "작업 보드와 하루 시작/마무리 루프",
      free: "포함",
      pro: "포함"
    },
    {
      feature: "기본 리스크 평가",
      free: "포함",
      pro: "포함"
    },
    {
      feature: "AI 상세 진단",
      free: "미지원",
      pro: "지원"
    },
    {
      feature: "내일 집중 계획 + 시간표 템플릿",
      free: "미지원",
      pro: "지원"
    },
    {
      feature: "중단 규칙(Stop Rules) 자동 제안",
      free: "미지원",
      pro: "지원"
    }
  ];

  return (
    <section className="space-y-6 pt-1">
      <div className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          Pricing
        </Badge>
        <h1 className="font-['Avenir_Next','Segoe_UI',sans-serif] text-4xl font-semibold leading-tight sm:text-5xl">
          명확한 무료 플랜,
          <br />
          집중도를 높이는 Pro 플랜.
        </h1>
        <p className="max-w-2xl text-sm text-calm">
          Cursor pricing 페이지처럼 단순한 2단 플랜 구조로 구성했습니다.
          로그인이 없어도 볼 수 있고, 로그인 후에는 바로 Pro 상태를 변경할 수
          있습니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200/90 bg-white/90">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-2xl">Free</CardTitle>
              <Badge variant="secondary">₩0 / month</Badge>
            </div>
            <p className="text-sm text-calm">
              개인 루틴을 안정적으로 유지하기 위한 기본 플로우.
            </p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-calm">
            <p>To Do/Doing/Done 보드</p>
            <p>하루 시작/마무리 세션 관리</p>
            <p>기본 번아웃 리스크 평가</p>
            <p>룰 기반 내일 개선안</p>
          </CardContent>
        </Card>

        <Card className="border-slate-900/20 bg-slate-950 text-white">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-2xl text-white">Pro</CardTitle>
              <Badge variant="warning">₩19,000 / month</Badge>
            </div>
            <p className="text-sm text-slate-300">
              과부하 원인 분석과 다음 날 실행 템플릿까지 자동으로 제공.
            </p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-200">
            <p>AI 상세 진단 + 리스크 드라이버 분석</p>
            <p>내일 집중 계획 + 시간표 템플릿</p>
            <p>Stop Rules 자동 제안</p>
            <p>결제 기반 권한 관리</p>

            <div className="pt-2">
              {!hasProAccess ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onActivateProAccess}
                  aria-label="Pro 활성화"
                  className="border-slate-500 bg-white text-ink hover:bg-slate-100"
                >
                  Pro 결제 완료 처리
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onDeactivateProAccess}
                  aria-label="Pro 비활성화"
                  className="border-slate-500 bg-white text-ink hover:bg-slate-100"
                >
                  Pro 비활성화
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/90 bg-white/90">
        <CardHeader>
          <CardTitle>Free vs Pro 비교</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-calm">
                <th className="px-3 py-2 text-left font-medium">Feature</th>
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
