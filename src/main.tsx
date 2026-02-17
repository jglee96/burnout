import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import "@/app/styles.css";
import { AppLocaleProvider } from "@/shared/lib/i18n/locale";
import { registerServiceWorker } from "@/shared/lib/pwa/register-service-worker";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppLocaleProvider>
      <App />
    </AppLocaleProvider>
  </React.StrictMode>
);

registerServiceWorker();
