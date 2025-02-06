import styles from "@/styles/pages/profile.module.css";
import ProfileForm from "../../../../components/profile/profileForm";

export default function ProfilePage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Mon profil</h1>
        <ProfileForm />
      </div>
    </main>
  );
}
