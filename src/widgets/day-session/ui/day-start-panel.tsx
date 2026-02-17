import { PlayCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface DayStartPanelProps {
  onStartDay: () => void;
}

export function DayStartPanel({ onStartDay }: DayStartPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>하루 시작</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="max-w-2xl text-sm text-calm">
          출근 직후 오늘의 작업을 시작합니다. 시작 후에는 To Do 우선순위를
          정리하고, Doing은 1~2개로 제한해 작업 전환 비용을 낮추세요.
        </p>
        <Button
          type="button"
          size="lg"
          onClick={onStartDay}
          aria-label="하루 시작하기"
        >
          <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
          하루 시작하기
        </Button>
      </CardContent>
    </Card>
  );
}
