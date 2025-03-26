"use server";
import styles from "@/styles/pages/time-trackings.module.css";
import { getTimeTrackings } from "@/api/timeTracking";
import TimeTrackings from "@/components/TimeTrackings/TimeTrackings";
import { getProject, getProjects } from "@/api/project";

export default async function TimeTrackingsPage({ searchParams }) {
  const queries = await searchParams;

  // Trackers are the time tracking data
  const trackersData = await getTimeTrackings(queries);
  const projects = await getProjects();
  const project = queries?.projectId
    ? await getProject(queries.projectId)
    : null;

  const trackers = trackersData?.data;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <TimeTrackings
          trackers={trackers}
          projects={projects}
          project={project}
        />
      </div>
    </main>
  );
}
