import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import "@/app/styles.css";
import { AppLocaleProvider } from "@/shared/lib/i18n/locale";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppLocaleProvider>
      <App />
    </AppLocaleProvider>
  </React.StrictMode>
);
