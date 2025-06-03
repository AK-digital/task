"use server";
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
    <main className="ml-6 w-full min-w-0 max-h-[calc(100vh-64px)]">
      <div className="flex flex-col bg-primary-transparent rounded-tl-2xl h-full pt-6 pl-6 overflow-hidden">
        <TimeTrackings
          trackers={trackers?.data}
          projects={projects}
          searchParams={queryParams}
        />
      </div>
    </main>
  );
}
