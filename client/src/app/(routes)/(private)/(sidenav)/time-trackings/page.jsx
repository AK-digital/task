"use server";
import styles from "@/styles/pages/time-trackings.module.css";
import { getTimeTrackings } from "@/api/timeTracking";
import TimeTrackings from "@/components/TimeTrackings/TimeTrackings";
import { getProjects } from "@/api/project";

export default async function TimeTrackingsPage({ searchParams }) {
  const queries = await searchParams;

  // Trackers are the time tracking data
  const trackersData = queries?.projects ? await getTimeTrackings(queries) : [];
  const projects = await getProjects();
  const trackers = trackersData?.data;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <TimeTrackings
          trackers={trackers}
          projects={projects}
          queries={queries}
        />
      </div>
    </main>
  );
}
