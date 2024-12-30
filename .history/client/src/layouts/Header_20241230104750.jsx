"use client"
import { AuthContext } from "@/context/auth"
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

                </div>
                {/* user */}
                <div>
                    <span>{user?.firstName}</span>
                    <img src={user?.picture || "/default-php.webp"} alt="" />
                </div>
            </nav>
        </header>
    )
}