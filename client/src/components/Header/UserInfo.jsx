"use client";
import { AuthContext } from "@/context/auth";
import Image from "next/image";
import { useContext } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function UserInfo() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  return (
    <Link href={"/profile"}>
      <Image
        src={user?.picture || "/default-pfp.webp"}
        alt={`${t("general.profile_picture_alt")} ${user?.firstName}`}
        width={40}
        height={40}
        quality={100}
        className="rounded-full max-h-10 max-w-10"
      />
    </Link>
  );
}
