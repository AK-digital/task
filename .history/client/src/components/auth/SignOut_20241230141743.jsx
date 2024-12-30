"use client";
import { logout } from "@/api/auth";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();
  async function handleLogout(e) {
    e.preventDefault();
    await logout();
  }
  return (
    <>
      <FontAwesomeIcon onClick={handleLogout} icon={faRightFromBracket} />
    </>
  );
}
