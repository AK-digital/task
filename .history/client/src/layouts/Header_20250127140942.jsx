"use server";
import styles from "@/styles/layouts/header.module.css";
import CreateProject from "@/components/Projects/CreateProject";
import ProjectsDropdown from "@/components/Header/ProjectsDropdown";
import UserInfo from "@/components/Header/UserInfo";
import { getProjects } from "@/api/project";

export default async function Header() {
  // Fetch the projects of the authentified user
  const projects = await getProjects();

  return (
    <header className={styles.container}>
      <nav>
        {/* Logo */}
        <div>
          <span>Täsk</span>
        </div>
        {/* user */}

        <UserInfo />
      </nav>
    </header>
  );
}
