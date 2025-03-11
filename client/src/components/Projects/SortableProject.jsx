"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "@/styles/layouts/side-nav.module.css";
import { useState, useRef, useEffect } from "react";

export default function SortableProject({ project, open, isActive }) {
  const router = useRouter();
  const mouseDownTime = useRef(null);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: project._id });

  const style = {
    transform: isActive ? "none" : CSS.Transform.toString(transform),
    transition: transition || "transform 0.3s ease", // Ajout d'une transition par défaut
  };

  const handleMouseDown = () => {
    mouseDownTime.current = Date.now();
  };

  const handleMouseUp = () => {
    const mouseUpTime = Date.now();
    const clickDuration = mouseUpTime - mouseDownTime.current;

    if (clickDuration < 200) {
      // Si le clic dure moins de 200ms
      router.push(`/projects/${project._id}`);
    }
  };

  useEffect(() => {
    document.querySelector(`[data-active="true"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, [isActive]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      ref={setNodeRef}
      className={styles.project}
      data-active={isActive} // Utilisation de data-active au lieu d'une classe
      style={style}
      {...attributes}
      {...listeners}
    >
      <Image
        src={project?.logo || "/default-project-logo.webp"}
        width={42}
        height={42}
        alt="project logo"
        style={{ borderRadius: "50%" }}
        data-active={isActive} // Ajout de data-active sur l'image aussi
      />
      {open && <span>{project?.name}</span>}
    </div>
  );
}
