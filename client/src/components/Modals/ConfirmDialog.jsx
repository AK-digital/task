import styles from "@/styles/components/modals/confirm-dialog.module.css";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  message,
  position,
}) {
  if (!isOpen || !position) return null;

  const style = {
    position: "fixed",
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: 2002,
  };

  return (
    <div className={styles.container} style={style}>
      <div className={styles.popupConfirm}>
        <div className={styles.arrow}></div>
        <div className={styles.popupContent}>
          <p>{message}</p>
          <span className={styles.info}>Cette action est irréversible</span>
          <div className={styles.confirmButtons}>
            <button onClick={onClose} className={styles.cancelButton}>
              Non
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={styles.deleteButton}
            >
              Oui
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
