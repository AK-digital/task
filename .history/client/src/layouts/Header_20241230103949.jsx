"use client"
import { AuthContext } from "@/context/auth"

export default function Header() {
    const context = AuthContext()
    console.log(context)
    return (
        <header>
            <nav>

            </nav>
        </header>
    )
}