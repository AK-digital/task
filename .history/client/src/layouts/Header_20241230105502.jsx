"use client"
import ProjectsDropdown from "@/components/Header/ProjectsDropdown"
import { AuthContext } from "@/context/auth"
import Image from "next/image"
import { useContext } from "react"

export default function Header() {
    const { uid, user } = useContext(AuthContext)
    console.log(user)
    return (
        <header>
            <nav>
                {/* Logo */}
                <div>
                    <span>Täsk</span>
                </div>
                {/* Project list */}
                <div>
                    <ProjectsDropdown />
                </div>
                {/* user */}
                <div>
                    <span>{user?.firstName}</span>
                    <Image src={user?.picture || "/default-pfp.webp"} alt={`Photo de profil de ${user?.firstName}`} width={30} height={30} />
                </div>
            </nav>
        </header>
    )
}