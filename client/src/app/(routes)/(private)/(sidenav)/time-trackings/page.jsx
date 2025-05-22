"use server";
import styles from "@/styles/pages/time-trackings.module.css";
import { getTimeTrackings } from "@/api/timeTracking";
import TimeTrackings from "@/components/TimeTrackings/TimeTrackings";
import { getProjects } from "@/api/project";

export default async function TimeTrackingsPage({ searchParams }) {
  const queryParams = await searchParams;

  // Get trackers based on query params, if no query params return an empty array
  const trackers = await getTimeTrackings(queryParams);
  const projects = await getProjects(); // Fetch all projects
  projects?.sort((a, b) => a.name.localeCompare(b.name)); // Sort projects by name

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <TimeTrackings
          trackers={trackers?.data}
          projects={projects}
          searchParams={queryParams}
        />
      </div>
    </main>
  );
}
