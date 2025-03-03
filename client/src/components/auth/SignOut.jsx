"use client";
import { logout } from "@/api/auth";
import styles from "@/styles/components/profile/profile-form.module.css";
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
  return (
    <a className={styles.signOut} onClick={handleLogout} >
      <LogOut size={18} /> {' '}
      Se déconnecter
    </a >
  );
}
