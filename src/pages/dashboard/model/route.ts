import type { AppSection } from "./types";

export function sectionFromPath(pathname: string): AppSection {
  if (pathname === "/pricing" || pathname.startsWith("/app/pricing")) {
    return "pricing";
  }
  if (pathname.startsWith("/app/settings")) {
    return "settings";
  }
  return "day";
}
