"use client";
import { logout } from "@/api/auth";
import { deleteCookie, setCookie } from "cookies-next";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();
  async function handleLogout(e) {
    e.preventDefault();
    const response = await logout();
    if (!response.success) {
      return;
    }

    router.push("/");
  }
  return <LogOut onClick={handleLogout} size={24} cursor={"pointer"} />;
}
