"use client"
import { AuthContext } from "@/context/auth"
import Image from "next/image"
import { useContext } from "react"

export default function UserInfo() {
    const { uid, user } = useContext(AuthContext)

    return (
        <>
            <span>{user?.firstName}</span>
            <Image src={user?.picture || "/default-pfp.webp"} alt={`Photo de profil de ${user?.firstName}`} width={30} height={30} style={{ borderRadius: "50%" }} />
        </>
    )
}