import { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { signInWithGoogle } from "@/shared/api/auth-client";
import { navigate } from "@/shared/lib/router/navigation";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const featureCards = [
  {
    title: "AI 하루 리뷰",
    description:
      "완료/미완료와 위험도 변화를 기반으로 내일의 실행 가능한 개선안을 제안합니다."
  },
  {
    title: "시작-마무리 루프",
    description:
      "출근 시 시작, 퇴근 전 마무리를 고정해 과부하 누적을 하루 단위에서 끊습니다."
  },
  {
    title: "실행 중심 보드",
    description:
      "To Do -> Doing -> Done 흐름으로 집중 대상을 줄이고 완료 기준선을 유지합니다."
  }
];

const workflow = [
  "출근 후 Google 로그인",
  "하루 시작으로 작업 세션 열기",
  "퇴근 전 냉정한 평가 실행",
  "내일 개선안으로 다음 날 시작"
];

export function ProductPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage("");
    try {
      await signInWithGoogle("/app/day");
    } catch {
      setErrorMessage("로그인에 실패했습니다. Google OAuth 설정을 확인하세요.");
      setIsSigningIn(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#dff1e7_0%,#f8fafc_45%),radial-gradient(circle_at_90%_10%,#e5ecff_0%,#f8fafc_35%)] text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-ink text-center text-xs font-semibold leading-8 text-white">
              BG
            </div>
            <p className="text-sm font-semibold tracking-wide">Burnout Guard</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/app/pricing")}
            >
              Pricing
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => navigate("/app/day")}
            >
              Open App
            </Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <Badge variant="secondary">Product</Badge>
            <h1 className="font-['Avenir_Next','Segoe_UI',sans-serif] text-4xl font-semibold leading-tight sm:text-5xl">
              하루의 과부하를 예측하고
              <br />
              다음 날 실행안으로 바로 전환합니다.
            </h1>
            <p className="max-w-2xl text-base text-calm">
              Cursor Product 페이지처럼 제품 중심으로 설계된 랜딩입니다.
              로그인하면 하루 시작 화면으로 이동하고, 작업 루프와 AI 평가를
              하나의 흐름으로 관리할 수 있습니다.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                size="lg"
                onClick={onSignIn}
                disabled={isSigningIn}
              >
                Google 로그인 후 시작
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => navigate("/app/pricing")}
              >
                요금제 보기
              </Button>
            </div>
            {errorMessage && (
              <p className="text-sm text-danger">{errorMessage}</p>
            )}
          </div>

          <Card className="bg-slate-950 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Live Loop Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border border-white/20 bg-white/5 p-3">
                <p className="text-white/70">오늘 위험도</p>
                <p className="text-2xl font-semibold">Moderate (42)</p>
              </div>
              <div className="space-y-2 rounded-xl border border-white/20 bg-white/5 p-3">
                <p className="text-white/70">내일 우선 액션</p>
                <p>1. To Do 상단 3개만 유지</p>
                <p>2. 오전 50분 집중 블록 확보</p>
                <p>3. Doing 2개 초과 시 신규 착수 중단</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <Card
              key={feature.title}
              className="border-slate-200/90 bg-white/90"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <Sparkles className="h-4 w-4 text-calm" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-calm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-calm" aria-hidden />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-calm">
              Daily Workflow
            </h2>
          </div>
          <ol className="grid gap-3 md:grid-cols-2">
            {workflow.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-ink"
              >
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 text-success"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
