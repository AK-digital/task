"use client";
import ProfileForm from "@/components/profile/profileForm";
import { AuthContext } from "@/context/auth";
import styles from "@/styles/pages/profile.module.css";
import { useContext } from "react";

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Mon profil</h1>
        <ProfileForm />
      </div>
    </main>
  );
}
