import styles from "@/styles/components/timeTrackings/time-trackings.module.css";
import { isNotEmpty } from "@/utils/utils";
import TimeTracking from "./TimeTracking";
import Filters from "./Filters";

export default async function TimeTrackings({ trackers, projects, project }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Suivi du temps</h1>
        {/* Filters */}
        <Filters projects={projects} project={project} />
      </div>
      {/* Time tracking list */}
      {project ? (
        <>
          {isNotEmpty(trackers) && (
            <div className={styles.content}>
              {trackers?.map((tracker) => {
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
