import { deleteTimeTracking } from "@/api/timeTracking";
import styles from "@/styles/components/timeTrackings/time-tracking-more.module.css";
import { PenBox, Trash } from "lucide-react";
import socket from "@/utils/socket";
import { extractId } from "@/utils/extractId";

export default function TimeTrackingMore({
  tracker,
  setIsEditing,
  setIsMore,
  setIsHover,
  mutateTimeTrackings,
}) {
  const handleDeleteTracker = async () => {
    const projectId = extractId(tracker?.projectId);

    const response = await deleteTimeTracking([tracker._id], projectId);

    if (!response.success) {
      return;
    }

    socket.emit("update task", projectId);

    mutateTimeTrackings();
    handleMore();
  };

  const handleEditDescription = () => {
    setIsEditing(true);
    handleMore();
  };

  const handleMore = () => {
    setIsMore(false);
    setIsHover(false);
  };

  return (
    <>
      <div id="more" className={styles.container}>
        <ul>
          <li className={styles.item} onClick={handleEditDescription}>
            <PenBox size={14} /> Modifier la description
          </li>
          <li className={styles.item} onClick={handleDeleteTracker}>
            <Trash size={14} />
            Supprimer ce suivi
          </li>
        </ul>
      </div>
      <div id="modal-layout-opacity" onClick={handleMore}></div>
    </>
  );
}
