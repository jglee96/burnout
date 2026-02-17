import { PlayCircle } from "lucide-react";
import { useAppLocale } from "@/shared/lib/i18n/locale";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface DayStartPanelProps {
  onStartDay: () => void;
}

export function DayStartPanel({ onStartDay }: DayStartPanelProps) {
  const { locale } = useAppLocale();
  const copy =
    locale === "ko"
      ? {
          title: "하루 시작",
          description:
            "출근 직후 오늘의 작업을 시작합니다. 시작 후에는 우선순위를 정리하고, 진행 중 작업은 1~2개로 제한해 전환 비용을 낮추세요.",
          button: "하루 시작하기"
        }
      : locale === "ja"
        ? {
            title: "勤務開始",
            description:
              "出勤直後に今日の作業を開始します。開始後は優先順位を整理し、進行中タスクを1〜2件に絞って切り替えコストを抑えてください。",
            button: "勤務を開始"
          }
        : {
            title: "Start the day",
            description:
              "Start your workday and trim priorities first. Keep in-progress tasks to 1-2 to reduce context-switching cost.",
            button: "Start day"
          };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="max-w-2xl text-sm text-calm">{copy.description}</p>
        <Button
          type="button"
          size="lg"
          onClick={onStartDay}
          aria-label={copy.button}
        >
          <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
          {copy.button}
        </Button>
      </CardContent>
    </Card>
  );
}
