"use client";
import styles from "@/styles/components/popups/confirmationDelete.module.css";
import { useTranslation } from "react-i18next";

export default function ConfirmationDelete({ title, onCancel, onConfirm }) {
  const { t } = useTranslation();

  return (
    <div className={styles.confirmationOverlay}>
      <div className={styles.confirmationDialog}>
        <h3>{t("general.confirm_deletion")}</h3>
        <p>{t("general.confirm_deletion_message", { title })}</p>
        <div className={styles.confirmationButtons}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {t("general.cancel")}
          </button>
          <button className={styles.confirmDeleteBtn} onClick={onConfirm}>
            {t("general.confirm_delete_button")}
          </button>
        </div>
      </div>
    </div>
  );
}
