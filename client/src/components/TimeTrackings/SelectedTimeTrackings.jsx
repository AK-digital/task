"use client";
import { deleteTimeTracking } from "@/api/timeTracking";
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
    <div className="fixed flex items-center bottom-5 left-1/2 -translate-x-1/2 bg-background-secondary-color rounded-lg shadow-shadow-box-small gap-2 overflow-hidden pr-2 animate-[slideIn_150ms_forwards]">
      <div className="flex justify-center items-center bg-text-accent-color h-20 w-20 text-white text-[1.4rem]">
        <span>{selectedTrackers.length}</span>
      </div>
      <div>
        <span className="text-[1.4rem]">
          {selectedTrackers?.length > 1
            ? "Suivi séléctionnés"
            : "Suivi sélectionné"}
        </span>
      </div>
      <div className="w-px bg-text-light-color h-[50px] mx-3"></div>
      <div>
        <span className="flex items-center text-text-color-red gap-1 cursor-pointer" onClick={handleDeleteTrackers}>
          <Trash size={16} /> Supprimer
        </span>
      </div>
    </div>
  );
}
