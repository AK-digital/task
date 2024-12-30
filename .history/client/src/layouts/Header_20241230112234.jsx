"use server"
import styles from "@/styles/layouts/header.module.css"
import CreateProject from "@/components/Header/CreateProject"
import ProjectsDropdown from "@/components/Header/ProjectsDropdown"
import UserInfo from "@/components/Header/UserInfo"

export default async function Header() {
    return (
        <header className={styles.container}>
            <nav>
                {/* Logo */}
                <div>
                    <span>Täsk</span>
                </div>
                {/* Project list */}
                <ProjectsDropdown />
                <span>OU</span>
                <CreateProject />
                {/* user */}
                <UserInfo />
            </nav>
        </header>
    )
}