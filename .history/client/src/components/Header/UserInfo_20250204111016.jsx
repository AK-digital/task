"use client";
import styles from "@/styles/components/header/user-info.module.css";
import { AuthContext } from "@/context/auth";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useContext } from "react";
import SignOut from "../auth/SignOut";
import Link from "next/link";

export default function UserInfo() {
  const { user } = useContext(AuthContext);

  return (
    <Link href={"/profile"}>
      <Image
        src={user?.picture || "/default-pfp.webp"}
        alt={`Photo de profil de ${user?.firstName}`}
        width={30}
        height={30}
        quality={100}
        style={{ borderRadius: "50%" }}
      />
    </Link>
  );
}
