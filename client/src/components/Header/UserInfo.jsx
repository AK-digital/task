"use client";
import { AuthContext } from "@/context/auth";
import Image from "next/image";
import { useContext } from "react";
import Link from "next/link";

export default function UserInfo() {
  const { user } = useContext(AuthContext);

  return (
    <Link href={"/profile"}>
      <Image
        src={user?.picture || "/default-pfp.webp"}
        alt={`Photo de profil de ${user?.firstName}`}
        width={40}
        height={40}
        quality={100}
        className="rounded-full"
      />
    </Link>
  );
}
