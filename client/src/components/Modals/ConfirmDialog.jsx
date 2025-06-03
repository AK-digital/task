import styles from "@/styles/components/modals/confirm-dialog.module.css";
import { useTranslation } from "react-i18next";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, message }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className={styles.container}>
      <div className={styles.popupConfirm}>
        <div className={styles.arrow}></div>
        <div className={styles.popupContent}>
          <p>{message}</p>
          <span className={styles.info}>
            {t("general.irreversible_action")}
          </span>
          <div className={styles.confirmButtons}>
            <button onClick={onClose} className={styles.cancelButton}>
              {t("general.no")}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={styles.deleteButton}
            >
              {t("general.yes")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
