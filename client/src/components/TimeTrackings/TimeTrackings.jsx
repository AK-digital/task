"use client";
import styles from "@/styles/components/timeTrackings/time-trackings.module.css";
import { formatTime, isNotEmpty } from "@/utils/utils";
import TimeTracking from "./TimeTracking";
import Filters from "./Filters";
import TimeTrackingHeader from "./TimeTrackingHeader";
import { useEffect, useState } from "react";
import SelectedTimeTrackings from "./SelectedTimeTrackings";

export default function TimeTrackings({ trackers, projects, project }) {
  const [filteredTrackers, setFilteredTrackers] = useState(trackers || []);
  const [selectedTrackers, setSelectedTrackers] = useState([]);
  const totalDuration = trackers?.reduce((acc, tracker) => {
    return acc + Math.floor(tracker?.duration / 1000) * 1000;
  }, 0);

  useEffect(() => {
    setFilteredTrackers(trackers);
  }, [trackers]);

  console.log(selectedTrackers);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Suivi du temps</h1>
        {/* Filters */}
        <Filters projects={projects} project={project} />
        {/* Total duration */}

        {totalDuration && (
          <span className={styles.total}>
            Temps total : {formatTime(Math.floor(totalDuration / 1000))}
          </span>
        )}
      </div>
      {/* Time tracking list */}
      {project ? (
        <>
          {isNotEmpty(filteredTrackers) && (
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
                    key={tracker?._id}
                  />
                );
              })}
              {selectedTrackers.length > 0 && (
                <SelectedTimeTrackings
                  selectedTrackers={selectedTrackers}
                  setSelectedTrackers={setSelectedTrackers}
                  project={project}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <div className={styles.empty}>
          <h2>Choisissez un projet pour voir les temps de suivi</h2>
        </div>
      )}
    </div>
  );
}
