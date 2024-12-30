"use server"
import ProjectsDropdown from "@/components/Header/ProjectsDropdown"
import { AuthContext } from "@/context/auth"
import Image from "next/image"
import { useContext } from "react"

export default async function Header() {

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
                    {/* <ProjectsDropdown /> */}
                </div>
                {/* user */}
                <div>

                </div>
            </nav>
        </header>
    )
}