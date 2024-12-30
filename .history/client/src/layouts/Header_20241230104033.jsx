"use client"
import { AuthContext } from "@/context/auth"
import { useContext } from "react"

export default function Header() {
    const { uid, user } = useContext(AuthContext)
    console.log(context)
    return (
        <header>
            <nav>

            </nav>
        </header>
    )
}