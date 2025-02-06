"use server";
import styles from "@/styles/layouts/side-nav.module.css";
import { getProjects } from "@/api/project";
import CreateProject from "@/components/Header/CreateProject";
import Link from "next/link";

export default async function SideNav() {
  const projects = await getProjects();

  return (
    <aside className={styles.container}>
      <div className={styles.projects}>
        {/* list of project */}
        <nav className={styles.nav}>
          <ul className={styles.projectsList}>
            {projects?.map((project) => {
              return (
                <li className={styles.projectsItem} key={project?._id}>
                  <Link href={`/project/${project?._id}`}>{project.name}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* create a project */}
        <CreateProject />
      </div>
      <div className={styles.user}></div>
    </aside>
  );
}
