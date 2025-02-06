"use client"
import ProfileForm from "@/components/profile/profileForm";
import styles from "@/styles/pages/profile.module.css";

export default function ProfilePage() {
  const 
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Mon profil</h1>
        <ProfileForm />
      </div>
    </main>
  );
}
