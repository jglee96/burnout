import { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { AiAccessSummary } from "@/widgets/ai-access";

interface SettingsPageProps {
  userEmail: string;
  hasSavedApiKey: boolean;
  hasProAccess: boolean;
  onSaveApiKey: (apiKey: string) => void;
  onClearApiKey: () => void;
}

export function SettingsPage({
  userEmail,
  hasSavedApiKey,
  hasProAccess,
  onSaveApiKey,
  onClearApiKey
}: SettingsPageProps) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const isSaveDisabled = apiKeyInput.trim().length < 20;

  return (
    <section className="space-y-5">
      <Card className="border-slate-200/90 bg-white/80">
        <CardHeader className="space-y-3">
          <Badge variant="secondary" className="w-fit">
            Settings
          </Badge>
          <CardTitle className="font-['Avenir_Next','Segoe_UI',sans-serif] text-2xl font-semibold leading-tight sm:text-3xl">
            개인 설정과 AI 접근 키를 한곳에서 관리합니다.
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-calm">
          계정 보안과 키 상태를 점검하고, 세션 만료 시에도 로컬 작업 상태가
          이어지는지 확인할 수 있습니다.
        </CardContent>
      </Card>

      <AiAccessSummary
        hasSavedApiKey={hasSavedApiKey}
        hasProAccess={hasProAccess}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200/90 bg-white/90">
          <CardHeader>
            <CardTitle>계정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-calm">
            <p>
              로그인 계정:{" "}
              <span className="font-medium text-ink">{userEmail}</span>
            </p>
            <p>
              세션이 만료되어도 하루 시작 상태와 작업 목록은 로컬에 저장되어
              이어집니다.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>AI API Key (BYOK)</CardTitle>
            <Badge variant={hasSavedApiKey ? "secondary" : "warning"}>
              {hasSavedApiKey ? "저장됨" : "미저장"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-calm">
              Pro 결제 없이도 개인 키를 등록하면 AI 상세 평가를 사용할 수
              있습니다.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="password"
                value={apiKeyInput}
                onChange={(event) => setApiKeyInput(event.target.value)}
                placeholder="AI API key 입력"
                aria-label="AI API key 입력"
              />
              <Button
                type="button"
                onClick={() => {
                  onSaveApiKey(apiKeyInput.trim());
                  setApiKeyInput("");
                }}
                disabled={isSaveDisabled}
                aria-label="AI key 저장"
              >
                키 저장
              </Button>
            </div>
            {hasSavedApiKey && (
              <Button
                type="button"
                variant="outline"
                onClick={onClearApiKey}
                aria-label="AI key 삭제"
              >
                저장된 키 삭제
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
