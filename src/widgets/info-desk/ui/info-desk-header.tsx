import { useEffect, useMemo, useState } from "react";
import { CloudSun, Clock3, CalendarDays } from "lucide-react";
import { fetchWeatherSnapshot } from "@/shared/api/weather-client";
import { toIntlLocale, useAppLocale } from "@/shared/lib/i18n/locale";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";

type WeatherStatus = "idle" | "loading" | "ready" | "denied" | "error";

export function InfoDeskHeader() {
  const { locale } = useAppLocale();
  const [now, setNow] = useState(() => new Date());
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus>("idle");
  const copy =
    locale === "ko"
      ? {
          loading: "날씨 로딩 중",
          geoUnsupported: "위치 기능 미지원",
          weatherFailed: "날씨 데이터를 불러오지 못했습니다",
          geoDenied: "위치 권한 없음",
          feelsLike: "체감",
          infoDesk: "Info Desk"
        }
      : locale === "ja"
        ? {
            loading: "天気を読み込み中",
            geoUnsupported: "位置情報が未対応です",
            weatherFailed: "天気データを取得できませんでした",
            geoDenied: "位置情報の許可がありません",
            feelsLike: "体感",
            infoDesk: "Info Desk"
          }
        : {
            loading: "Loading weather",
            geoUnsupported: "Geolocation is not supported",
            weatherFailed: "Could not load weather data",
            geoDenied: "Location permission denied",
            feelsLike: "Feels like",
            infoDesk: "Info Desk"
          };
  const [weatherLabel, setWeatherLabel] = useState(copy.loading);

  useEffect(() => {
    setWeatherLabel(copy.loading);
  }, [copy.loading]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setWeatherStatus("error");
      setWeatherLabel(copy.geoUnsupported);
      return;
    }

    setWeatherStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const weather = await fetchWeatherSnapshot({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locale
          });
          setWeatherStatus("ready");
          setWeatherLabel(
            `${weather.conditionLabel} ${Math.round(weather.temperatureC)}°C (${copy.feelsLike} ${Math.round(weather.apparentTemperatureC)}°C)`
          );
        } catch {
          setWeatherStatus("error");
          setWeatherLabel(copy.weatherFailed);
        }
      },
      () => {
        setWeatherStatus("denied");
        setWeatherLabel(copy.geoDenied);
      },
      { timeout: 8000 }
    );
  }, [copy.feelsLike, copy.geoDenied, copy.geoUnsupported, copy.weatherFailed, locale]);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(toIntlLocale(locale), {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
      }).format(now),
    [locale, now]
  );

  const timeLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(toIntlLocale(locale), {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).format(now),
    [locale, now]
  );

  return (
    <Card>
      <CardContent className="grid gap-3 p-4 sm:grid-cols-3 sm:items-center">
        <div className="flex items-center gap-2 text-sm text-calm">
          <CalendarDays className="h-4 w-4" aria-hidden />
          <span>{dateLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Clock3 className="h-4 w-4" aria-hidden />
          <span>{timeLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-calm">
          <CloudSun className="h-4 w-4" aria-hidden />
          <span>{weatherLabel}</span>
          <Badge
            variant={weatherStatus === "error" ? "destructive" : "secondary"}
          >
            {copy.infoDesk}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
