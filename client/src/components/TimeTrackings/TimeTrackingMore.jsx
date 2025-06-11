import { deleteTimeTracking } from "@/api/timeTracking";
import { PenBox, Trash } from "lucide-react";
import socket from "@/utils/socket";
import { extractId } from "@/utils/extractId";
import { useTranslation } from "react-i18next";

export default function TimeTrackingMore({
  tracker,
  setIsEditing,
  setIsMore,
  setIsHover,
  mutateTimeTrackings,
}) {
  const { t } = useTranslation();

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
      <div className="absolute z-2001 bg-secondary rounded-sm shadow-medium p-2 text-small text-text-dark-color select-none top-[30px] left-2 w-max">
        <ul className="flex flex-col gap-2">
          <li
            className="flex items-center gap-1 cursor-pointer"
            onClick={handleEditDescription}
          >
            <PenBox size={14} /> {t("time_tracking.edit_description")}
          </li>
          <li
            className="flex items-center gap-1 cursor-pointer text-color-red"
            onClick={handleDeleteTracker}
          >
            <Trash size={14} />
            {t("time_tracking.delete_tracking")}
          </li>
        </ul>
      </div>
      <div className="modal-layout-opacity" onClick={handleMore}></div>
    </>
  );
}
