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
      className="flex items-center gap-3 no-underline text-text-lighter-color"
      >
        <div className="max-w-[42px] max-h-[42px]">
          <Image
            src={project?.logo || "/default-project-logo.webp"}
            width={42}
            height={42}
            alt="project logo"
            data-active={isActive} // Ajout de data-active sur l'image aussi
            className="w-[42px] h-[42px] max-w-[42px] max-h-[42px] rounded-full"
          />
        </div>
        {open && <span>{project?.name}</span>}
      </Link>
    </div>
  );
}
