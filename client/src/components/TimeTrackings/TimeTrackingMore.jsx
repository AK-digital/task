import { deleteTimeTracking } from "@/api/timeTracking";
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

    mutateTimeTrackings(
      (currentData) => {
        if (!currentData?.data) return currentData;
        return {
          ...currentData,
          data: currentData.data.filter((t) => t._id !== tracker._id),
        };
      },
      false // Ne pas revalider immédiatement
    );

    const response = await deleteTimeTracking([tracker._id], projectId);

    if (!response.success) {
      mutateTimeTrackings(undefined, {
        revalidate: true,
        populateCache: false,
      });
      return;
    }

    socket.emit("time tracking deleted", tracker._id, projectId);

    setTimeout(() => {
      mutateTimeTrackings(undefined, {
        revalidate: true,
        populateCache: false,
      });
    }, 50);

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
      <div className="absolute z-2001 bg-background-secondary-color rounded-sm shadow-shadow-box-medium p-2 text-text-size-small text-text-dark-color select-none top-[30px] left-2 w-max">
        <ul className="flex flex-col gap-2">
          <li className="flex items-center gap-1 cursor-pointer" onClick={handleEditDescription}>
            <PenBox size={14} /> Modifier la description
          </li>
          <li className="flex items-center gap-1 cursor-pointer text-color-red" onClick={handleDeleteTracker}>
            <Trash size={14} />
            Supprimer ce suivi
          </li>
        </ul>
      </div>
      <div className="modal-layout-opacity" onClick={handleMore}></div>
    </>
  );
}
