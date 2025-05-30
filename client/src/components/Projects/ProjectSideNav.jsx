"use client";
import Image from "next/image";
import styles from "@/styles/layouts/side-nav.module.css";
import { useEffect } from "react";
import Link from "next/link";

export default function ProjectSideNav({ project, open, isActive }) {
  useEffect(() => {
    document.querySelector(`[data-active="true"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, [isActive]);

  return (
    <div
      className={styles.project}
      data-active={isActive} // Utilisation de data-active au lieu d'une classe
    >
      <Link href={`/projects/${project._id}`}>
        <div className={styles.projectLogo}>
          <Image
            src={project?.logo || "/default-project-logo.webp"}
            width={42}
            height={42}
            alt="project logo"
            style={{ borderRadius: "50%" }}
            data-active={isActive} // Ajout de data-active sur l'image aussi
          />
        </div>
        {open && <span>{project?.name}</span>}
      </Link>
    </div>
  );
}
