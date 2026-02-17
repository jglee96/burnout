import { useState } from "react";
import type { AiAccessMode } from "@/entities/task/model/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

interface AiAccessPanelProps {
  accessMode: AiAccessMode;
  hasSavedApiKey: boolean;
  hasProAccess: boolean;
  onSaveApiKey: (apiKey: string) => void;
  onClearApiKey: () => void;
  onActivateProAccess: () => void;
  onDeactivateProAccess: () => void;
}

function modeBadge(accessMode: AiAccessMode) {
  if (accessMode === "pro") {
    return <Badge variant="warning">AI Pro 활성화</Badge>;
  }
  if (accessMode === "byok") {
    return <Badge variant="secondary">BYOK 활성화</Badge>;
  }
  return <Badge variant="secondary">AI 잠금</Badge>;
}

export function AiAccessPanel({
  accessMode,
  hasSavedApiKey,
  hasProAccess,
  onSaveApiKey,
  onClearApiKey,
  onActivateProAccess,
  onDeactivateProAccess
}: AiAccessPanelProps) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const isSaveDisabled = apiKeyInput.trim().length < 20;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>AI 평가 접근</CardTitle>
        {modeBadge(accessMode)}
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-ink">1) 내 AI 키로 사용</h3>
          <p className="text-sm text-calm">
            키를 등록하면 하루 종료 시 AI 상세 개선안을 제공합니다.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="password"
              placeholder="AI API key 입력"
              value={apiKeyInput}
              onChange={(event) => setApiKeyInput(event.target.value)}
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
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-calm">
              상태: {hasSavedApiKey ? "저장됨" : "미저장"}
            </p>
            {hasSavedApiKey && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClearApiKey}
                aria-label="저장된 AI key 삭제"
              >
                키 삭제
              </Button>
            )}
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-ink">
            2) 결제로 AI Pro 사용
          </h3>
          <p className="text-sm text-calm">
            결제 후 Pro가 활성화되면 키 없이 AI 상세 평가를 사용할 수 있습니다.
          </p>
          <div className="flex items-center gap-2">
            {!hasProAccess ? (
              <Button
                type="button"
                variant="outline"
                onClick={onActivateProAccess}
                aria-label="AI Pro 결제 활성화"
              >
                Pro 결제 완료 처리
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={onDeactivateProAccess}
                aria-label="AI Pro 비활성화"
              >
                Pro 비활성화
              </Button>
            )}
          </div>
          <p className="text-xs text-calm">
            상태: {hasProAccess ? "Pro 활성화" : "Pro 비활성"}
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
