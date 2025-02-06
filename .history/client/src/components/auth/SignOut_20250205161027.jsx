"use client";
import { logout } from "@/api/auth";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();
  async function handleLogout(e) {
    e.preventDefault();
    await logout();
    router.push("/");
  }
  return (
    <>
      <LogOut onClick={handleLogout} />
      {/* <FontAwesomeIcon onClick={handleLogout} icon={faRightFromBracket} /> */}
    </>
  );
}
