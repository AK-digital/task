"use client";

import { useTranslation } from "react-i18next";

export default function AuthLayout({ children }) {
  const { t } = useTranslation();
  return (
    <main className="flex flex-col items-center h-[100svh] mx-5 text-text-lighter-color">
      {children}
      <span
        className="relative bottom-[9%] left-[340px] text-[2rem] text-text-darker-color"
        dangerouslySetInnerHTML={{ __html: t("auth.clynt_slogan") }}
      />
    </main>
  );
}
