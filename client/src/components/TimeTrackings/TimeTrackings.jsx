"use client";
import styles from "@/styles/components/timeTrackings/time-trackings.module.css";
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

export default function TimeTrackings({ searchParams }) {
  const [queries, setQueries] = useState(searchParams);
  const { projects, projectsLoading } = useProjects();
  const { timeTrackings, timeTrackingsLoading, mutateTimeTrackings } =
    useTimeTrackings(queries);

  console.log(timeTrackings);

  const [selectedTrackers, setSelectedTrackers] = useState([]);

  const hasSelectedTrackers = selectedTrackers?.length > 0;

  const totalDuration = useMemo(() => {
    return timeTrackings?.reduce((acc, tracker) => {
      return acc + Math.floor(tracker?.duration / 1000) * 1000;
    }, 0);
  }, [timeTrackings]);

  const hasTrackers = timeTrackings?.length > 0;

  useEffect(() => {
    const handleTaskUpdated = (projectId) => {
      // Revalider seulement si on n'a pas de filtre de projet ou si c'est un projet concerné
      const projectsParam = searchParams?.projects;

      if (!projectsParam || projectsParam.includes(projectId)) {
        mutateTimeTrackings();
      }
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
  }, [mutateTimeTrackings, searchParams]);

  function handleExport() {
    exportTimeTracking(
      hasSelectedProjects ? selectedProjects : projectsWithTrackers,
      filteredTrackers
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Suivi du temps</h1>
        {/* Filters */}
        {!projectsLoading && (
          <Filters
            projects={projects}
            queries={queries}
            setQueries={setQueries}
          />
        )}
        {/* Total duration */}
        {totalDuration && (
          <span className={styles.total}>
            Temps total : {formatTime(Math.floor(totalDuration / 1000))}
          </span>
        )}
        {/* Export PDF Button */}
        <ExportPdfBtn handleExport={handleExport} />
      </div>
      {/* Time tracking list */}
      {isNotEmpty(timeTrackings) ? (
        <div className={styles.content}>
          {/* <TimeTrackingHeader
            trackers={timeTrackings}
            setFilteredTrackers={setFilteredTrackers}
            setSelectedTrackers={setSelectedTrackers}
          /> */}

          {timeTrackings?.map((tracker) => {
            return (
              <TimeTracking
                tracker={tracker}
                setSelectedTrackers={setSelectedTrackers}
                mutateTimeTrackings={mutateTimeTrackings}
                key={tracker?._id}
              />
            );
          })}
          {/* Selected time tracking list */}
          {hasSelectedTrackers && (
            <SelectedTimeTrackings
              selectedTrackers={selectedTrackers}
              setSelectedTrackers={setSelectedTrackers}
              mutateTimeTrackings={mutateTimeTrackings}
              trackers={timeTrackings}
            />
          )}
        </div>
      ) : (
        <div className={styles.empty}>
          <h2>Aucun de vos projets ne contient un suivi de temps</h2>
        </div>
      )}
    </div>
  );
}
