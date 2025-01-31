"use server";
import styles from "@/styles/layouts/header.module.css";
import UserInfo from "@/components/Header/UserInfo";
import { getProjects } from "@/api/project";
import ProjectTitle from "@/components/Projects/ProjectTitle";

export default async function Header() {
  const projects = await getProjects();

  return (
    <header className={styles.container}>
      <nav>
        {/* Logo or Project Title */}
        <ProjectTitle projects={projects} />
        {/* user */}
        <UserInfo />
      </nav>
    </header>
  );
}