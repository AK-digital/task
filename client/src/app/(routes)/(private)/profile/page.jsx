import { getSession } from "@/api/auth";
import ProfileForm from "./ProfileForm";
import styles from "@/styles/pages/profile.module.css";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session?.data;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Mon profil</h1>
        <ProfileForm user={user} />
      </div>
    </main>
  );
}