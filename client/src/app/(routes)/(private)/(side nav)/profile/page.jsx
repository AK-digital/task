"use server";
import SignOut from "@/components/auth/SignOut";
import PictureForm from "@/components/Profile/PictureForm";
import ProfileForm from "@/components/Profile/ProfileForm";
import styles from "@/styles/pages/profile.module.css";

export default async function ProfilePage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Mon profil</h1>
        <div className={styles.wrapper}>
          <PictureForm />
          <ProfileForm />
        </div>
        <SignOut />
      </div>
    </main>
  );
}
