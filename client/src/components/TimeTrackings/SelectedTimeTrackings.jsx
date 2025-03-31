"use client";
import { deleteTimeTracking } from "@/api/timeTracking";
import styles from "@/styles/components/timeTrackings/selected-time-trackings.module.css";
import { Trash } from "lucide-react";

export default function SelectedTimeTrackings({
  selectedTrackers,
  setSelectedTrackers,
}) {
  const handleDeleteTrackers = async () => {
    const response = await deleteTimeTracking(selectedTrackers);
    if (!response.success) {
      return;
    }

    setSelectedTrackers([]);
    document.querySelector("input[name=trackers]").checked = false;
  };
  return (
    <div className={styles.container}>
      <div className={styles.selected}>
        <span>{selectedTrackers.length}</span>
      </div>
      <div className={styles.item}>
        <span className={styles.text}>
          {selectedTrackers?.length > 1
            ? "Suivi séléctionnés"
            : "Suivi sélectionné"}
        </span>
      </div>
      <div className={styles.border}></div>
      <div className={styles.item}>
        <span className={styles.delete} onClick={handleDeleteTrackers}>
          <Trash size={16} /> Supprimer
        </span>
      </div>
    </div>
  );
}
