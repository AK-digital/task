"use client";
import { deleteTimeTracking } from "@/api/timeTracking";
import styles from "@/styles/components/timeTrackings/selected-time-trackings.module.css";
import { Trash } from "lucide-react";
import socket from "@/utils/socket";
import { extractId } from "@/utils/extractId";

export default function SelectedTimeTrackings({
  selectedTrackers,
  setSelectedTrackers,
  mutateTimeTrackings,
  trackers,
}) {
  const handleDeleteTrackers = async () => {
    const firstSelectedTracker = trackers.find((tracker) =>
      selectedTrackers.includes(tracker._id)
    );

    if (!firstSelectedTracker) return;

    const projectId = extractId(firstSelectedTracker.projectId);

    mutateTimeTrackings(
      (currentData) => {
        if (!currentData?.data) return currentData;
        return {
          ...currentData,
          data: currentData.data.filter(
            (t) => !selectedTrackers.includes(t._id)
          ),
        };
      },
      false // Ne pas revalider immédiatement
    );

    const response = await deleteTimeTracking(selectedTrackers, projectId);
    if (!response.success) {
      mutateTimeTrackings(undefined, {
        revalidate: true,
        populateCache: false,
      });
      return;
    }

    socket.emit("time tracking deleted batch", selectedTrackers, projectId);

    setTimeout(() => {
      mutateTimeTrackings(undefined, {
        revalidate: true,
        populateCache: false,
      });
    }, 50);

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
