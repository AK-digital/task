"use client"
import { AuthContext } from "@/context/auth"
import { useContext } from "react"

export default function Header() {
    const context = useContext(AuthContext)
    console.log(context)
    return (
        <header>
            <nav>

            </nav>
        </header>
    )
}