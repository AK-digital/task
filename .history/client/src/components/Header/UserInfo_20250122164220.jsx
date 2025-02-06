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
  const { uid, user } = useContext(AuthContext);

  return (
    <div className={styles.container}>
      <FontAwesomeIcon icon={faBell} />
      <Link href={"/profil"}>
        <div className={styles.wrapper}>
          <span className={styles["user-name"]}>{user?.firstName}</span>
          <Image
            src={user?.picture || "/default-pfp.webp"}
            alt={`Photo de profil de ${user?.firstName}`}
            width={30}
            height={50}
            quality={100}
            style={{ borderRadius: "50%" }}
          />
        </div>
      </Link>
      <SignOut />
    </div>
  );
}
