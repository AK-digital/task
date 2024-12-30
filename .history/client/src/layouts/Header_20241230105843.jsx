"use server"
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
                <div>
                    {/* <ProjectsDropdown /> */}
                </div>
                {/* user */}
                <UserInfo />
            </nav>
        </header>
    )
}