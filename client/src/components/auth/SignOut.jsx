"use client";
import { userLogout } from "@/api/auth";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function SignOut() {
  const { t } = useTranslation();
  const router = useRouter();
  async function handleLogout(e) {
    e.preventDefault();
    const response = await userLogout();

    if (!response.success) {
      return;
    }

    router.push("/");
  }
  return (
    <a
      onClick={handleLogout}
      className="flex items-center flex-row my-6 gap-2 cursor-pointer select-none"
    >
      <LogOut size={18} /> {t("profile.sign_out")}
    </a>
  );
}
