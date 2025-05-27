"use client";
import styles from "@/styles/components/popups/confirmationDelete.module.css";

export default function ConfirmationDelete({ title, onCancel, onConfirm }) {
  return (
    <div className={styles.confirmationOverlay}>
      <div className={styles.confirmationDialog}>
        <h3>Confirmation de suppression</h3>
        <p>
          Êtes-vous sûr de vouloir supprimer votre {title} ? Cette action est
          irréversible.
        </p>
        <div className={styles.confirmationButtons}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Annuler
          </button>
          <button className={styles.confirmDeleteBtn} onClick={onConfirm}>
            Confirmer la suppression
          </button>
        </div>
      </div>
    </div>
  );
}
