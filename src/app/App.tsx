import { useEffect, useState } from "react";
import { DashboardPage } from "@/pages/dashboard";
import { ProductPage } from "@/pages/product";

function readPathname() {
  return window.location.pathname;
}

function isAppRoute(pathname: string) {
  return pathname === "/pricing" || pathname === "/app" || pathname.startsWith("/app/");
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
      <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#dff1e7_0%,#f8fafc_45%),radial-gradient(circle_at_90%_10%,#e5ecff_0%,#f8fafc_35%)] text-ink">
        <DashboardPage />
      </div>
    );
  }

  return <ProductPage />;
}
