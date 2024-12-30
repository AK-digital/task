"use client";
import styles from "@/styles/components/header/user-info.module.css";
import { AuthContext } from "@/context/auth";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useContext } from "react";

export default function UserInfo() {
  const { uid, user } = useContext(AuthContext);

  return (
    <>
      <FontAwesomeIcon icon={faBell} />
      <span className={styles["user-name"]}>{user?.firstName}</span>
      <Image
        src={user?.picture || "/default-pfp.webp"}
        alt={`Photo de profil de ${user?.firstName}`}
        width={25}
        height={25}
        style={{ borderRadius: "50%" }}
      />
    </>
  );
}
