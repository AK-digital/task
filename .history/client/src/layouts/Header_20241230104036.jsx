"use client"
import { AuthContext } from "@/context/auth"
import { useContext } from "react"

export default function Header() {
    const { uid, user } = useContext(AuthContext)
    console.log(uid)
    return (
        <header>
            <nav>

            </nav>
        </header>
    )
}