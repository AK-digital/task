"use client";
import styles from "@/styles/components/timeTrackings/time-trackings.module.css";
import { exportTimeTracking, formatTime, isNotEmpty } from "@/utils/utils";
import TimeTracking from "./TimeTracking";
import Filters from "./Filters";
import TimeTrackingHeader from "./TimeTrackingHeader";
import { useEffect, useMemo, useState } from "react";
import SelectedTimeTrackings from "./SelectedTimeTrackings";
import ExportPdfBtn from "./ExportPdfBtn";
import { useTimeTrackings } from "@/app/hooks/useTimeTrackings";
import socket from "@/utils/socket";

export default function TimeTrackings({
  trackers: initialTrackers,
  projects,
  searchParams,
}) {
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [filteredTrackers, setFilteredTrackers] = useState(
    initialTrackers || []
  );
  const [selectedTrackers, setSelectedTrackers] = useState([]);

  // Utiliser le hook pour les données en temps réel
  const { timeTrackings, mutateTimeTrackings } = useTimeTrackings(
    searchParams,
    { data: initialTrackers }
  );

  // Utiliser les données du hook ou les données initiales
  const trackers = timeTrackings?.data || initialTrackers || [];

  const projectsWithTrackers = projects?.filter((project) =>
    filteredTrackers?.some((tracker) => tracker?.project?._id === project?._id)
  );
  const queries = new URLSearchParams(searchParams);

  const totalDuration = useMemo(() => {
    return trackers?.reduce((acc, tracker) => {
      return acc + Math.floor(tracker?.duration / 1000) * 1000;
    }, 0);
  }, [trackers]);

  const hasSelectedProjects = selectedProjects?.length > 0;
  const hasSelectedTrackers = selectedTrackers?.length > 0;

  useEffect(() => {
    setFilteredTrackers(trackers);
  }, [trackers]);

  useEffect(() => {
    const handleTaskUpdated = (projectId) => {
      // Revalider seulement si on n'a pas de filtre de projet ou si c'est un projet concerné
      const projectsParam = searchParams?.projects;
      if (!projectsParam || projectsParam.includes(projectId)) {
        mutateTimeTrackings(undefined, {
          revalidate: true,
          populateCache: false,
        });
      }
    };

    const handleTimeTrackingUpdated = () => {
      mutateTimeTrackings(undefined, {
        revalidate: true,
        populateCache: false,
      });
    };

    const handleTimeTrackingDeleted = () => {
      mutateTimeTrackings(undefined, {
        revalidate: true,
        populateCache: false,
      });
    };

    const handleTimeTrackingDeletedBatch = () => {
      mutateTimeTrackings(undefined, {
        revalidate: true,
        populateCache: false,
      });
    };

    socket.on("task updated", handleTaskUpdated);
    socket.on("time tracking updated", handleTimeTrackingUpdated);
    socket.on("time tracking deleted", handleTimeTrackingDeleted);
    socket.on("time tracking deleted batch", handleTimeTrackingDeletedBatch);

    return () => {
      socket.off("task updated", handleTaskUpdated);
      socket.off("time tracking updated", handleTimeTrackingUpdated);
      socket.off("time tracking deleted", handleTimeTrackingDeleted);
      socket.off("time tracking deleted batch", handleTimeTrackingDeletedBatch);
    };
  }, [mutateTimeTrackings, searchParams]);

  useEffect(() => {
    // Get the "projects" query parameter from the URL search params
    const projectsNames = queries?.get("projects")?.split(",") || [];

    if (projects?.length <= 0) setSelectedProjects([]);

    // If there are project names, filter the projects array to find matching projects
    setSelectedProjects(
      projects.filter((project) => projectsNames.includes(project?.name))
    );
  }, [searchParams]);

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
        <Filters
          projects={projects}
          selectedProjects={selectedProjects}
          searchParams={searchParams}
          hasSelectedProjects={hasSelectedProjects}
          projectsWithTrackers={projectsWithTrackers}
        />
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
      {isNotEmpty(filteredTrackers) ? (
        <div className={styles.content}>
          <TimeTrackingHeader
            trackers={trackers}
            setFilteredTrackers={setFilteredTrackers}
            setSelectedTrackers={setSelectedTrackers}
          />
          {filteredTrackers?.map((tracker) => {
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
              trackers={filteredTrackers}
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
