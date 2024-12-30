"use client"
import { AuthContext } from "@/context/auth"
import { useContext } from "react"

export default function Header() {
    const { uid, user } = useContext(AuthContext)

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
            </nav>
        </header>
    )
}