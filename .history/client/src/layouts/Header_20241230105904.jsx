"use server"
import ProjectsDropdown from "@/components/Header/ProjectsDropdown"
import UserInfo from "@/components/Header/UserInfo"

export default async function Header() {


    return (
        <header>
            <nav>
                {/* Logo */}
                <div>
                    <span>Täsk</span>
                </div>
                {/* Project list */}
                <ProjectsDropdown />
                {/* user */}
                <UserInfo />
            </nav>
        </header>
    )
}