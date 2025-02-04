"use client";
import styles from "@/styles/components/modals/project-options-modal.module.css";
import { deleteProject } from "@/api/project";
import { useRouter } from "next/navigation";

export default function ProjectOptionsModal({ projectId, setOpenModal }) {
    const router = useRouter();

    async function handleDeleteProject() {
        const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?");
        if (confirmed) {
            await deleteProject(projectId);
            router.push("/project");
        }
    }

    return (
        <div className={styles.container} id="modal">
            <div className={styles.modalContent}>
                <h3>Options du projet</h3>
                <button className={styles.deleteBtn} onClick={handleDeleteProject}>
                    Supprimer le projet
                </button>
                <button className={styles.closeBtn} onClick={() => setOpenModal(false)}>
                    Annuler
                </button>
            </div>
        </div>
    );
}