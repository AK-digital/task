"use client";
import { deleteBoard } from "@/actions/board";
import styles from "@/styles/components/boards/BoardHeader.module.css";
import { Trash, X } from "lucide-react";
import { useTransition, useState } from "react";

export default function DeleteBoard({ boardId, projectId }) {
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);

    function handleDeleteBoard() {
        startTransition(async () => {
            await deleteBoard(boardId, projectId);
        });
    }

    return (
        <div className={styles.deleteIcon}>
            <Trash
                size={20}
                onClick={() => setShowConfirm(true)}
                className={styles.trashIcon}
            />

            {showConfirm && (
                <div className={styles.popupConfirm}>
                    <div className={styles.arrow}></div>
                    <div className={styles.popupContent}>
                        <p>Supprimer ce tableau ?</p>
                        <div className={styles.confirmButtons}>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className={styles.cancelButton}
                            >
                                Non
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteBoard();
                                    setShowConfirm(false);
                                }}
                                className={styles.deleteButton}
                            >
                                Oui
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}