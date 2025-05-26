import { deleteTimeTracking } from "@/api/timeTracking";
import styles from "@/styles/components/timeTrackings/time-tracking-more.module.css";
import { PenBox, Trash } from "lucide-react";

export default function TimeTrackingMore({
  tracker,
  setIsEditing,
  setIsMore,
  setIsHover,
}) {
  const handleDeleteTracker = async () => {
    const response = await deleteTimeTracking(
      [tracker._id],
      tracker?.projectId?._id
    );

    if (!response.success) {
      return;
    }

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
            <PenBox size={14} /> Modifier la descriptipn
          </li>
          <li className={styles.item} onClick={handleDeleteTracker}>
            <Trash size={14} />
            Supprimer ce suivi
          </li>
        </ul>
      </div>
      <div className="modal-layout-opacity" onClick={handleMore}></div>
    </>
  );
}
