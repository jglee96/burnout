import { useState } from "react";
import type { AppLocale } from "@/shared/lib/i18n/locale";
import { useAppLocale } from "@/shared/lib/i18n/locale";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { AiAccessSummary } from "@/widgets/ai-access";

interface SettingsPageProps {
  userEmail: string;
  hasSavedApiKey: boolean;
  hasProAccess: boolean;
  onActivateProAccess: () => void;
  onSaveApiKey: (apiKey: string) => void;
  onClearApiKey: () => void;
}

export function SettingsPage({
  userEmail,
  hasSavedApiKey,
  hasProAccess,
  onActivateProAccess,
  onSaveApiKey,
  onClearApiKey
}: SettingsPageProps) {
  const { locale, setLocale } = useAppLocale();
  const [apiKeyInput, setApiKeyInput] = useState("");
  const isSaveDisabled = apiKeyInput.trim().length < 20;

  const copy =
    locale === "ko"
      ? {
          badge: "Settings",
          title: "개인 설정과 AI 접근 키를 한곳에서 관리합니다.",
          description:
            "계정 보안과 키 상태를 점검하고, 세션 만료 시에도 로컬 작업 상태가 이어지는지 확인할 수 있습니다.",
          languageTitle: "사용 언어",
          languageDescription:
            "지역 기반 기본값으로 시작하며, 지원하지 않는 지역 언어는 영어로 설정됩니다.",
          languageLabel: "언어 선택",
          accountTitle: "계정",
          loginAccount: "로그인 계정:",
          accountNote:
            "세션이 만료되어도 하루 시작 상태와 작업 목록은 로컬에 저장되어 이어집니다.",
          keyTitle: "AI API Key (BYOK)",
          keySaved: "저장됨",
          keyMissing: "미저장",
          keyDescription:
            "Pro 결제 없이도 개인 키를 등록하면 AI 상세 평가를 사용할 수 있습니다.",
          keyPlaceholder: "AI API key 입력",
          saveKey: "키 저장",
          clearKey: "저장된 키 삭제"
        }
      : locale === "ja"
        ? {
            badge: "Settings",
            title: "個人設定とAIアクセスキーを一箇所で管理します。",
            description:
              "アカウントとキー状態を確認し、セッションが切れてもローカルの作業状態を引き継げます。",
            languageTitle: "表示言語",
            languageDescription:
              "地域ベースの初期値を使い、未対応の言語は英語を既定にします。",
            languageLabel: "言語を選択",
            accountTitle: "アカウント",
            loginAccount: "ログインアカウント:",
            accountNote:
              "セッション切れでも、勤務開始状態とタスク一覧はローカルに保持されます。",
            keyTitle: "AI API Key (BYOK)",
            keySaved: "保存済み",
            keyMissing: "未保存",
            keyDescription:
              "Pro決済がなくても、個人キーを登録すればAI詳細評価を利用できます。",
            keyPlaceholder: "AI API key を入力",
            saveKey: "キーを保存",
            clearKey: "保存済みキーを削除"
          }
        : {
            badge: "Settings",
            title: "Manage personal settings and AI access keys in one place.",
            description:
              "Review account and key status, and keep local day-session data after auth expiry.",
            languageTitle: "Language",
            languageDescription:
              "Initial language follows your region. If unsupported, English is used.",
            languageLabel: "Select language",
            accountTitle: "Account",
            loginAccount: "Signed-in account:",
            accountNote:
              "Even if the session expires, day-session state and task list continue from local storage.",
            keyTitle: "AI API Key (BYOK)",
            keySaved: "Saved",
            keyMissing: "Not saved",
            keyDescription:
              "You can use detailed AI evaluation with your own key without Pro billing.",
            keyPlaceholder: "Enter AI API key",
            saveKey: "Save key",
            clearKey: "Remove saved key"
          };

  const localeOptions: Array<{ value: AppLocale; label: string }> = [
    { value: "en", label: "English" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" }
  ];

  return (
    <section className="space-y-5">
      <Card className="border-slate-200/90 bg-white/80">
        <CardHeader className="space-y-3">
          <Badge variant="secondary" className="w-fit">
            {copy.badge}
          </Badge>
          <CardTitle className="font-['Avenir_Next','Segoe_UI',sans-serif] text-2xl font-semibold leading-tight sm:text-3xl">
            {copy.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-calm">{copy.description}</CardContent>
      </Card>

      <AiAccessSummary
        hasSavedApiKey={hasSavedApiKey}
        hasProAccess={hasProAccess}
        onActivateProAccess={onActivateProAccess}
      />

      <Card className="border-slate-200/90 bg-white/90">
        <CardHeader>
          <CardTitle>{copy.languageTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-calm">{copy.languageDescription}</p>
          <label htmlFor="language-select" className="sr-only">
            {copy.languageLabel}
          </label>
          <select
            id="language-select"
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            value={locale}
            onChange={(event) => setLocale(event.target.value as AppLocale)}
            aria-label={copy.languageLabel}
          >
            {localeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200/90 bg-white/90">
          <CardHeader>
            <CardTitle>{copy.accountTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-calm">
            <p>
              {copy.loginAccount}{" "}
              <span className="font-medium text-ink">{userEmail}</span>
            </p>
            <p>{copy.accountNote}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>{copy.keyTitle}</CardTitle>
            <Badge variant={hasSavedApiKey ? "secondary" : "warning"}>
              {hasSavedApiKey ? copy.keySaved : copy.keyMissing}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-calm">{copy.keyDescription}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="password"
                value={apiKeyInput}
                onChange={(event) => setApiKeyInput(event.target.value)}
                placeholder={copy.keyPlaceholder}
                aria-label={copy.keyPlaceholder}
              />
              <Button
                type="button"
                onClick={() => {
                  onSaveApiKey(apiKeyInput.trim());
                  setApiKeyInput("");
                }}
                disabled={isSaveDisabled}
                aria-label={copy.saveKey}
              >
                {copy.saveKey}
              </Button>
            </div>
            {hasSavedApiKey && (
              <Button
                type="button"
                variant="outline"
                onClick={onClearApiKey}
                aria-label={copy.clearKey}
              >
                {copy.clearKey}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
