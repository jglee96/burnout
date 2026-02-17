import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export const APP_LOCALE_STORAGE_KEY = "burnout-app-locale";
export const SUPPORTED_LOCALES = ["en", "ko", "ja"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

interface AppLocaleContextValue {
  locale: AppLocale;
  setLocale: (nextLocale: AppLocale) => void;
}

const defaultContextValue: AppLocaleContextValue = {
  locale: "en",
  setLocale: () => {}
};

const AppLocaleContext =
  createContext<AppLocaleContextValue>(defaultContextValue);

function isSupportedLocale(value: unknown): value is AppLocale {
  return value === "en" || value === "ko" || value === "ja";
}

function matchLocaleCandidate(raw: string): AppLocale | null {
  if (!raw) {
    return null;
  }

  try {
    const locale = new Intl.Locale(raw);
    const language = locale.language.toLowerCase();
    const region = locale.region?.toUpperCase();

    if (language === "ko" || region === "KR") {
      return "ko";
    }
    if (language === "ja" || region === "JP") {
      return "ja";
    }
    if (language === "en") {
      return "en";
    }
  } catch {
    // Ignore invalid locale candidates and continue fallback chain.
  }

  return null;
}

export function detectLocaleFromRegion(): AppLocale {
  const candidates = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const candidate of candidates) {
    const matched = matchLocaleCandidate(candidate);
    if (matched) {
      return matched;
    }
  }

  return "en";
}

function readStoredLocale(): AppLocale | null {
  try {
    const stored = window.localStorage.getItem(APP_LOCALE_STORAGE_KEY);
    if (isSupportedLocale(stored)) {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
}

export function resolveInitialLocale(): AppLocale {
  return readStoredLocale() ?? detectLocaleFromRegion();
}

export function toIntlLocale(locale: AppLocale): string {
  if (locale === "ko") {
    return "ko-KR";
  }
  if (locale === "ja") {
    return "ja-JP";
  }
  return "en-US";
}

export function AppLocaleProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<AppLocale>(resolveInitialLocale);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    try {
      window.localStorage.setItem(APP_LOCALE_STORAGE_KEY, nextLocale);
    } catch {
      // Ignore persistence errors and keep in-memory state.
    }
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== APP_LOCALE_STORAGE_KEY || !event.newValue) {
        return;
      }
      if (isSupportedLocale(event.newValue)) {
        setLocaleState(event.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <AppLocaleContext.Provider value={value}>
      {children}
    </AppLocaleContext.Provider>
  );
}

export function useAppLocale() {
  return useContext(AppLocaleContext);
}
