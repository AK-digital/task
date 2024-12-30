"use server"
import styles from "@/styles/layouts/header.module.css"
import CreateProject from "@/components/Header/CreateProject"
import ProjectsDropdown from "@/components/Header/ProjectsDropdown"
import UserInfo from "@/components/Header/UserInfo"
import { getProjects } from "@/api/project"

export default async function Header() {
    const projects = await getProjects()
    return (
        <header className={styles.container}>
            <nav>
                {/* Logo */}
                <div>
                    <span>Täsk</span>
                </div>
                {/* Project list */}
                <div className={styles.projects}>
                    <ProjectsDropdown projects={projects} />
                    <span>OU</span>
                    <CreateProject />
                </div>
                {/* user */}
                <div className={styles.user}>
                    <UserInfo />
                </div>
            </nav>
        </header>
    )
}