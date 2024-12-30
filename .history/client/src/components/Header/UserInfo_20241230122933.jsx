"use client";
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
      <span>{user?.firstName}</span>
      <Image
        src={user?.picture || "/default-pfp.webp"}
        alt={`Photo de profil de ${user?.firstName}`}
        width={30}
        height={30}
        style={{ borderRadius: "50%" }}
      />
    </>
  );
}
