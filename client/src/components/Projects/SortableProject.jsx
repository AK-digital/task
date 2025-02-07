"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "@/styles/layouts/side-nav.module.css";
import { useState, useRef } from "react";

export default function SortableProject({ project, projectId, isActive }) {
    const router = useRouter();
    const [isDragging, setIsDragging] = useState(false);
    const mouseDownTime = useRef(null);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: project._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 0.3s ease', // Ajout d'une transition par défaut
    };

    const handleMouseDown = () => {
        mouseDownTime.current = Date.now();
    };

    const handleMouseUp = () => {
        const mouseUpTime = Date.now();
        const clickDuration = mouseUpTime - mouseDownTime.current;

        if (clickDuration < 200) { // Si le clic dure moins de 200ms
            router.push(`/project/${project._id}`);
        }
        setIsDragging(false);
    };

    return (
        <li
            ref={setNodeRef}
            className={styles.projectsItem}
            data-active={isActive} // Utilisation de data-active au lieu d'une classe
            style={style}
            {...attributes}
            {...listeners}
        >
            <div
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                className={styles.dragHandle}
            >
                <Image
                    src={project?.logo || project?.favicon || "/default-project-logo.webp"}
                    width={52}
                    height={52}
                    alt="project logo"
                    style={{ borderRadius: "50%" }}
                    data-active={isActive} // Ajout de data-active sur l'image aussi
                    onError={(e) => {
                        // Si le favicon n'est pas accessible, on utilise le logo par défaut
                        e.target.src = "/default-project-logo.webp";
                    }}
                />
            </div>
        </li>
    );
}