"use server";

import styles from "@/styles/pages/projects.module.css";
import { getProjects } from "@/api/project";
import Image from "next/image";
import { isNotEmpty } from "@/utils/utils";
import { ListTodo, Users } from "lucide-react";
import Link from "next/link";

export default async function Projects() {
  const projects = await getProjects();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Vos projets</h1>
        </div>
        {isNotEmpty(projects) ? (
          <div className={styles.elements}>
            {projects?.map((project) => (
              <div key={project?._id} className={styles.element}>
                <Link href={`/projects/${project?._id}`}>
                  <Image
                    className={styles.logo}
                    src={project?.logo || "/default-project-logo.webp"}
                    alt="project"
                    width={45}
                    height={45}
                    style={{ borderRadius: "50%", cursor: "pointer" }}
                  />
                  <div className={styles.infos}>
                    <div className={styles.name}>
                      <span>{project?.name}</span>
                    </div>
                    <div className={styles.stats}>
                      <span>
                        <ListTodo size={16} />
                        {project?.tasksCount}
                      </span>
                      <span>
                        <Users size={16} />
                        {project?.guests?.length + 1}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>Créez ou sélectionnez un projet.</div>
        )}
      </div>
    </main>
  );
}
