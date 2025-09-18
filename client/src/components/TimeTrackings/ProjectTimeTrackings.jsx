"use client";
import { exportTimeTracking, formatTime, isNotEmpty } from "@/utils/utils";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ExportPdfBtn from "./ExportPdfBtn";
import { useTimeTrackings } from "../../../hooks/useTimeTrackings";
import socket from "@/utils/socket";
import TimeTracking from "./TimeTracking";
import SelectedTimeTrackings from "./SelectedTimeTrackings";
import TimeTrackingHeader from "./TimeTrackingHeader";
import TimeTrackingsSkeletons from "./TimeTrackingsSkeletons";
import { useProjectContext } from "@/context/ProjectContext";

export default function ProjectTimeTrackings({ timeQueries, setTimeQueries }) {
  const { project } = useProjectContext();
  const queries = timeQueries || { projects: [project?._id] };
  const setQueries = setTimeQueries || (() => {});
  
  const { timeTrackings, timeTrackingsLoading, mutateTimeTrackings } =
    useTimeTrackings(queries);

  const [filteredTrackers, setFilteredTrackers] = useState(timeTrackings || []);
  const [selectedTrackers, setSelectedTrackers] = useState([]);

  useEffect(() => {
    setFilteredTrackers(timeTrackings || []);
  }, [timeTrackings]);

  // Mettre à jour les queries quand le projet change
  useEffect(() => {
    if (project?._id && setTimeQueries) {
      setQueries(prev => ({ ...prev, projects: [project._id] }));
    }
  }, [project?._id, setTimeQueries]);

  const totalDuration = useMemo(() => {
    return timeTrackings?.reduce((acc, tracker) => {
      return acc + Math.floor(tracker?.duration / 1000) * 1000;
    }, 0);
  }, [timeTrackings]);

  useEffect(() => {
    const handleTaskUpdated = () => {
      mutateTimeTrackings();
    };
    const handleTimeTrackingUpdated = () => {
      mutateTimeTrackings();
    };
    socket.on("task updated", handleTaskUpdated);
    socket.on("time tracking updated", handleTimeTrackingUpdated);
    return () => {
      socket.off("task updated", handleTaskUpdated);
      socket.off("time tracking updated", handleTimeTrackingUpdated);
    };
  }, [mutateTimeTrackings]);

  const hasSelectedTrackers = selectedTrackers?.length > 0;

  function handleExport() {
    // Pour l'export, on utilise uniquement le projet actuel
    exportTimeTracking([project], timeTrackings);
  }

  // Portal pour injecter les contrôles dans le header
  const headerControls = (
    <>
      {/* Total duration */}
      <span className="font-bold select-none">
        Temps total :{" "}
        {totalDuration ? formatTime(Math.floor(totalDuration / 1000)) : 0}
      </span>

      {/* Export PDF Button */}
      <ExportPdfBtn handleExport={handleExport} />
    </>
  );

  return (
    <div className="h-full">
      {/* Inject controls into header */}
      {typeof document !== 'undefined' && 
        createPortal(
          headerControls,
          document.getElementById('time-tracking-controls') || document.body
        )
      }
      
      {/* Time tracking list */}
      <div className="boards_Boards overflow-auto h-full pr-3 mr-3 pb-10 rounded-lg">
        {timeTrackingsLoading ? (
          <TimeTrackingsSkeletons />
        ) : isNotEmpty(timeTrackings) ? (
          <>
            <TimeTrackingHeader
              trackers={timeTrackings}
              setFilteredTrackers={setFilteredTrackers}
              setSelectedTrackers={setSelectedTrackers}
            />
            {filteredTrackers.map((tracker) => {
              return (
                <TimeTracking
                  tracker={tracker}
                  setSelectedTrackers={setSelectedTrackers}
                  mutateTimeTrackings={mutateTimeTrackings}
                  key={tracker?._id}
                />
              );
            })}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-xl">
            <h3>Aucun suivi de temps trouvé pour ce projet</h3>
          </div>
        )}
        {/* Selected time tracking list */}
        {hasSelectedTrackers && (
          <SelectedTimeTrackings
            selectedTrackers={selectedTrackers}
            setSelectedTrackers={setSelectedTrackers}
            mutateTimeTrackings={mutateTimeTrackings}
            trackers={filteredTrackers}
          />
        )}
      </div>
    </div>
  );
}
