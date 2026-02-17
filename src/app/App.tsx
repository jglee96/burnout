import { useEffect, useState } from "react";
import { DashboardPage } from "@/pages/dashboard/ui/dashboard-page";
import { PricingPage } from "@/pages/pricing/ui/pricing-page";
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

  if (pathname === "/pricing") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#dff1e7_0%,#f8fafc_45%),radial-gradient(circle_at_90%_10%,#e5ecff_0%,#f8fafc_35%)] text-ink">
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-3 sm:px-6">
          <PricingPage
            hasProAccess={false}
            onActivateProAccess={() => {}}
            onDeactivateProAccess={() => {}}
          />
        </main>
      </div>
    );
  }

  if (isAppRoute(pathname)) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#dff1e7_0%,#f8fafc_45%),radial-gradient(circle_at_90%_10%,#e5ecff_0%,#f8fafc_35%)] text-ink">
        <DashboardPage />
      </div>
    );
  }

  return <ProductPage />;
}
