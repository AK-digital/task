"use client";
import SignOut from "@/components/auth/SignOut";
import PictureForm from "@/components/Profile/PictureForm";
import ProfileForm from "@/components/Profile/ProfileForm";
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
    <main className="relative h-full w-full">
      <div
        className="absolute top-5 left-[120px] cursor-pointer"
        onClick={handleBack}
      >
        <ArrowLeftCircle size={32} />
      </div>
      <div className="flex flex-col items-center justify-center gap-6 h-full w-full">
        <h1 className="select-none">{t("profile.my_profile")}</h1>
        <div className="bg-secondary rounded-2xl w-full p-[44px] max-w-[540px]">
          <PictureForm />
          <ProfileForm />
        </div>
        <SignOut />
      </div>
    </main>
  );
}
