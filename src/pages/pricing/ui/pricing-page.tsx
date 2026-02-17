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
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Free</CardTitle>
          <Badge variant="secondary">기본 제공</Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-calm">
          <p>할 일/한 일 관리</p>
          <p>기본 번아웃 리스크 평가</p>
          <p>하루 시작/종료 플로우</p>
          <p>기본 개선안(룰 기반)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Pro</CardTitle>
          <Badge variant="warning">
            {hasProAccess ? "활성화됨" : "업그레이드"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-calm">
          <p>AI 상세 진단 + 원인 분석</p>
          <p>내일 집중 계획/시간표 템플릿</p>
          <p>중단 규칙(Stop Rules) 자동 제안</p>
          <p>결제 기반 권한 관리</p>

          {!hasProAccess ? (
            <Button
              type="button"
              variant="outline"
              onClick={onActivateProAccess}
              aria-label="Pro 활성화"
            >
              Pro 결제 완료 처리
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onDeactivateProAccess}
              aria-label="Pro 비활성화"
            >
              Pro 비활성화
            </Button>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
