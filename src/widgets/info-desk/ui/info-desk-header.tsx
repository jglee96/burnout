import { useEffect, useMemo, useState } from "react";
import { CloudSun, Clock3, CalendarDays } from "lucide-react";
import { fetchWeatherSnapshot } from "@/shared/api/weather-client";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";

type WeatherStatus = "idle" | "loading" | "ready" | "denied" | "error";

export function InfoDeskHeader() {
  const [now, setNow] = useState(() => new Date());
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus>("idle");
  const [weatherLabel, setWeatherLabel] = useState("날씨 로딩 전");

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setWeatherStatus("error");
      setWeatherLabel("위치 기능 미지원");
      return;
    }

    setWeatherStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const weather = await fetchWeatherSnapshot({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setWeatherStatus("ready");
          setWeatherLabel(
            `${weather.conditionLabel} ${Math.round(weather.temperatureC)}°C (체감 ${Math.round(weather.apparentTemperatureC)}°C)`
          );
        } catch {
          setWeatherStatus("error");
          setWeatherLabel("날씨 데이터를 불러오지 못했습니다");
        }
      },
      () => {
        setWeatherStatus("denied");
        setWeatherLabel("위치 권한 없음");
      },
      { timeout: 8000 }
    );
  }, []);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
      }).format(now),
    [now]
  );

  const timeLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).format(now),
    [now]
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
            Info Desk
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
