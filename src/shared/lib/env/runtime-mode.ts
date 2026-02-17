export type RuntimeMode = "development" | "production" | "test";

function isRuntimeMode(value: unknown): value is RuntimeMode {
  return (
    value === "development" || value === "production" || value === "test"
  );
}

function resolveRuntimeMode(): RuntimeMode {
  const appEnv = import.meta.env.VITE_APP_ENV;
  if (isRuntimeMode(appEnv)) {
    return appEnv;
  }

  if (import.meta.env.MODE === "test") {
    return "test";
  }

  return import.meta.env.PROD ? "production" : "development";
}

export const runtimeMode = resolveRuntimeMode();
export const isProductionRuntime = runtimeMode === "production";
export const isDevOrTestRuntime = !isProductionRuntime;
