"use client";
import { deleteBoard } from "@/actions/board";
import styles from "@/styles/components/boards/BoardHeader.module.css";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTransition } from "react";

export default function DeleteBoard({ boardId, projectId }) {
    const [isPending, startTransition] = useTransition();

    function handleDeleteBoard(e) {
        e.preventDefault();
        startTransition(async () => {
            await deleteBoard(boardId, projectId);
        });
    }

    return (
        <div className={styles.deleteIcon}>
            <FontAwesomeIcon
                icon={faTrash}
                onClick={handleDeleteBoard}
                className={styles.trashIcon}
                style={{ opacity: isPending ? 0.5 : 1 }}
            />
        </div>
    );
}