"use client";
import styles from "@/styles/components/timeTrackings/time-trackings.module.css";
import { formatTime, isNotEmpty } from "@/utils/utils";
import TimeTracking from "./TimeTracking";
import Filters from "./Filters";
import TimeTrackingHeader from "./TimeTrackingHeader";
import { useEffect, useState } from "react";

export default function TimeTrackings({ trackers, projects, project }) {
  const [filteredTrackers, setFilteredTrackers] = useState(trackers || []);
  const totalDuration = trackers?.reduce((acc, tracker) => {
    return acc + Math.floor(tracker?.duration / 1000) * 1000;
  }, 0);

  useEffect(() => {
    setFilteredTrackers(trackers);
  }, [trackers]);

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
              />

              {filteredTrackers?.map((tracker) => {
                return <TimeTracking tracker={tracker} key={tracker?._id} />;
              })}
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
