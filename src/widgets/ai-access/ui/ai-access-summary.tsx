import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface AiAccessSummaryProps {
  hasSavedApiKey: boolean;
  hasProAccess: boolean;
}

export function AiAccessSummary({
  hasSavedApiKey,
  hasProAccess
}: AiAccessSummaryProps) {
  return (
    <Card className="border-slate-200/90 bg-white/90">
      <CardHeader className="space-y-2">
        <CardTitle>BYOK vs Pro 요약</CardTitle>
        <p className="text-sm text-calm">
          BYOK는 개인 키를 등록해 사용하고, Pro는 결제로 키 없이 AI 평가를
          사용합니다.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">BYOK</p>
            <Badge variant={hasSavedApiKey ? "secondary" : "warning"}>
              {hasSavedApiKey ? "활성" : "미설정"}
            </Badge>
          </div>
          <p className="text-sm text-calm">
            본인 API 키를 입력해 AI 상세 평가를 사용합니다.
          </p>
        </section>

        <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">Pro</p>
            <Badge variant={hasProAccess ? "warning" : "secondary"}>
              {hasProAccess ? "활성" : "비활성"}
            </Badge>
          </div>
          <p className="text-sm text-calm">
            결제 상태로 권한을 받아 키 없이 AI 상세 평가를 사용합니다.
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
