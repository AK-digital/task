"use client";
import { exportTimeTracking, formatTime, isNotEmpty } from "@/utils/utils";
import Filters from "./Filters";
import { useEffect, useMemo, useState } from "react";
import ExportPdfBtn from "./ExportPdfBtn";
import { useTimeTrackings } from "@/app/hooks/useTimeTrackings";
import socket from "@/utils/socket";
import { useProjects } from "@/app/hooks/useProjects";
import TimeTracking from "./TimeTracking";
import SelectedTimeTrackings from "./SelectedTimeTrackings";
import TimeTrackingHeader from "./TimeTrackingHeader";
import TimeTrackingsSkeletons from "./TimeTrackingsSkeletons";

export default function TimeTrackings({ searchParams }) {
  const [queries, setQueries] = useState(searchParams);
  const { projects, projectsLoading } = useProjects();
  const { timeTrackings, timeTrackingsLoading, mutateTimeTrackings } =
    useTimeTrackings(queries);

  const [filteredTrackers, setFilteredTrackers] = useState(timeTrackings || []);
  const [selectedTrackers, setSelectedTrackers] = useState([]);

  useEffect(() => {
    setFilteredTrackers(timeTrackings || []);
  }, [timeTrackings]);

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
  const hasSelectedProjects = queries?.projects?.length > 0;

  function giveProjectsToExport() {
    if (hasSelectedProjects) {
      // give projects selected in the queries
      return projects?.filter((project) =>
        queries?.projects?.includes(project?._id)
      );
    } else {
      // give all projects of current returned time trackings
      return timeTrackings?.reduce((acc, tracker) => {
        if (!acc.find((project) => project?._id === tracker?.projectId?._id)) {
          acc.push(tracker?.projectId);
        }
        return acc;
      }, []);
    }
  }

  function handleExport() {
    exportTimeTracking(giveProjectsToExport(), timeTrackings);
  }

  return (
    <div className="h-full">
      <div className="flex items-center gap-6">
        <h1 className="mb-[inherit] min-w-fit select-none">Suivi du temps</h1>
        {/* Filters */}
        {!projectsLoading && (
          <Filters
            projects={projects}
            queries={queries}
            setQueries={setQueries}
          />
        )}

        {/* Total duration */}
        <span className="font-bold select-none">
          Temps total :{" "}
          {totalDuration ? formatTime(Math.floor(totalDuration / 1000)) : 0}
        </span>

        {/* Export PDF Button */}
        <ExportPdfBtn handleExport={handleExport} />
      </div>

      {/* Time tracking list */}
      <div className="boards_Boards mt-3 overflow-auto h-full pr-3 mr-3 pb-10 rounded-lg">
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
          <div className="flex items-center justify-center h-full text-2xl">
            <h2>Aucun de vos projets ne contient un suivi de temps</h2>
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
