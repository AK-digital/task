"use client";
import { I18nextProvider } from "react-i18next";
import { Suspense } from "react";
import i18n from "@/helpers/i18n";

// Composant de fallback pendant le chargement des traductions
function LoadingFallback() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "16px",
        color: "#666",
      }}
    >
      Loading translations...
    </div>
  );
}

export default function I18nProvider({ children }) {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </I18nextProvider>
  );
}
