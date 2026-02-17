import type { AppLocale } from "@/shared/lib/i18n/locale";

export interface WeatherSnapshot {
  temperatureC: number;
  apparentTemperatureC: number;
  conditionLabel: string;
}

interface LocationInput {
  latitude: number;
  longitude: number;
}

interface OpenMeteoCurrent {
  temperature_2m: number;
  apparent_temperature: number;
  weather_code: number;
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
}

function isOpenMeteoResponse(data: unknown): data is OpenMeteoResponse {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const current = (data as { current?: unknown }).current;
  if (typeof current !== "object" || current === null) {
    return false;
  }

  const record = current as Record<string, unknown>;
  return (
    typeof record.temperature_2m === "number" &&
    typeof record.apparent_temperature === "number" &&
    typeof record.weather_code === "number"
  );
}

function weatherCodeToLabel(code: number, locale: AppLocale): string {
  const labels =
    locale === "ko"
      ? {
          clear: "맑음",
          mostlyClear: "대체로 맑음",
          cloudy: "흐림",
          fog: "안개",
          rain: "비",
          snow: "눈",
          thunder: "뇌우",
          unknown: "날씨 데이터 확인 중"
        }
      : locale === "ja"
        ? {
            clear: "晴れ",
            mostlyClear: "概ね晴れ",
            cloudy: "くもり",
            fog: "霧",
            rain: "雨",
            snow: "雪",
            thunder: "雷雨",
            unknown: "天気データを確認中"
          }
        : {
            clear: "Clear",
            mostlyClear: "Mostly clear",
            cloudy: "Cloudy",
            fog: "Fog",
            rain: "Rain",
            snow: "Snow",
            thunder: "Thunderstorm",
            unknown: "Checking weather data"
          };

  if (code === 0) {
    return labels.clear;
  }
  if (code === 1 || code === 2) {
    return labels.mostlyClear;
  }
  if (code === 3) {
    return labels.cloudy;
  }
  if (code >= 45 && code <= 48) {
    return labels.fog;
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return labels.rain;
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return labels.snow;
  }
  if (code >= 95) {
    return labels.thunder;
  }
  return labels.unknown;
}

export async function fetchWeatherSnapshot({
  latitude,
  longitude,
  locale = "en"
}: LocationInput & { locale?: AppLocale }): Promise<WeatherSnapshot> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,weather_code"
  );
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      `Weather fetch failed (${response.status}). Check connection and retry.`
    );
  }

  const data: unknown = await response.json();
  if (!isOpenMeteoResponse(data)) {
    throw new Error(
      "Weather payload shape is invalid. Verify upstream schema before using it."
    );
  }

  return {
    temperatureC: data.current.temperature_2m,
    apparentTemperatureC: data.current.apparent_temperature,
    conditionLabel: weatherCodeToLabel(data.current.weather_code, locale)
  };
}
