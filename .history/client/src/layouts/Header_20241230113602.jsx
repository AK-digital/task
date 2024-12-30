"use server"
import styles from "@/styles/layouts/header.module.css"
import CreateProject from "@/components/Header/CreateProject"
import ProjectsDropdown from "@/components/Header/ProjectsDropdown"
import UserInfo from "@/components/Header/UserInfo"

export default async function Header({ searchParams }) {
    const p = await searchParams;
    console.log(p, 'les params');
    return (
        <header className={styles.container}>
            <nav>
                {/* Logo */}
                <div>
                    <span>Täsk</span>
                </div>
                {/* Project list */}
                <div className={styles.projects}>
                    <ProjectsDropdown />
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