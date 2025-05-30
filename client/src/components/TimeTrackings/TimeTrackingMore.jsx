import { deleteTimeTracking } from "@/api/timeTracking";
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
      <div id="more" className="top-[30px] left-2 w-max">
        <ul className="flex flex-col gap-2">
          <li className="flex items-center gap-1 cursor-pointer" onClick={handleEditDescription}>
            <PenBox size={14} /> Modifier la descriptipn
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
