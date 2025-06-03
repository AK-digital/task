"use client";
import SignOut from "@/components/auth/SignOut";
import PictureForm from "@/components/Profile/PictureForm";
import ProfileForm from "@/components/Profile/ProfileForm";
import styles from "@/styles/pages/profile.module.css";
import { ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <main className={styles.main}>
      <div className={styles.back} onClick={handleBack}>
        <ArrowLeftCircle size={32} />
      </div>
      <div className={styles.container}>
        <h1>{t("profile.my_profile")}</h1>
        <div className={styles.wrapper}>
          <PictureForm />
          <ProfileForm />
        </div>
        <SignOut />
      </div>
    </main>
  );
}
