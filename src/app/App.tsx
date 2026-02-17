import { useEffect, useState } from "react";
import { DashboardPage } from "@/pages/dashboard/ui/dashboard-page";
import { ProductPage } from "@/pages/product/ui/product-page";

function readPathname() {
  return window.location.pathname;
}

function isAppRoute(pathname: string) {
  return pathname === "/app" || pathname.startsWith("/app/");
}

export function App() {
  const [pathname, setPathname] = useState(readPathname);

  useEffect(() => {
    const onPathChange = () => setPathname(readPathname());
    window.addEventListener("popstate", onPathChange);
    return () => window.removeEventListener("popstate", onPathChange);
  }, []);

  if (isAppRoute(pathname)) {
    return (
      <div className="min-h-screen bg-surface text-ink">
        <DashboardPage />
      </div>
    );
  }

  return <ProductPage />;
}
