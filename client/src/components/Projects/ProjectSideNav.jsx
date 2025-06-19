"use client";
import Image from "next/image";
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
    // Utilisation de data-active au lieu d'une classe
    <div data-active={isActive}>
      <Link
        href={`/projects/${project._id}`}
        className="container_ProjectSideNav group relative flex items-center gap-3 cursor-pointer transition-all ease-linear duration-150 text-text-lighter-color"
        data-active={isActive}
      >
        <div className="max-w-[42px] max-h-[42px]">
          <Image
            src={project?.logo || "/default/default-project-logo.webp"}
            width={42}
            height={42}
            alt="project logo"
            data-active={isActive} // Ajout de data-active sur l'image aussi
            title={project?.name}
            className="rounded-full min-w-[42px] min-h-[42px] w-full h-full object-fill border-2 group-hover:border-2 group-hover:bg-accent-color"
          />
        </div>
        {open && (
          <span className="text-small whitespace-nowrap overflow-hidden text-ellipsis mr-5 font-light">
            {project?.name}
          </span>
        )}
      </Link>
    </div>
  );
}
