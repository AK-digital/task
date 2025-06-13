"use client";
import { deleteTimeTracking } from "@/api/timeTracking";
import { Trash } from "lucide-react";
import socket from "@/utils/socket";
import { extractId } from "@/utils/extractId";
import { useTranslation } from "react-i18next";

export default function SelectedTimeTrackings({
  selectedTrackers,
  setSelectedTrackers,
  mutateTimeTrackings,
  trackers,
}) {
  const { t } = useTranslation();

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
      if (response?.message?.startsWith?.("time_tracking.")) {
        console.error(t(response.message));
      } else if (response?.message) {
        console.error(response.message);
      }
      mutateTimeTrackings(undefined, {
        revalidate: true,
        populateCache: false,
      });
      return;
    }

    socket.emit("update task", projectId);

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
    <div className="fixed flex items-center bottom-5 left-1/2 -translate-x-1/2 bg-secondary rounded-lg shadow-small gap-2 overflow-hidden pr-2 animate-[slideIn_150ms_forwards]">
      <div className="flex justify-center items-center bg-accent-color-light h-20 w-20 text-white text-[1.4rem]">
        <span>{selectedTrackers.length}</span>
      </div>
      <div>
        <span className="text-[1.4rem]">
          {selectedTrackers?.length > 1
            ? t("time_tracking.selected_plural")
            : t("time_tracking.selected_singular")}
        </span>
      </div>
      <div className="w-px bg-text-light-color h-[50px] mx-3"></div>
      <div>
        <span
          className="flex items-center text-text-color-red gap-1 cursor-pointer"
          onClick={handleDeleteTrackers}
        >
          <Trash size={16} /> {t("time_tracking.delete")}
        </span>
      </div>
    </div>
  );
}
