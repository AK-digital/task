"use server";
import TimeTrackings from "@/components/TimeTrackings/TimeTrackings";

export default async function TimeTrackingsPage({ searchParams }) {
  const params = await searchParams;

  return (
    <main className="ml-6 w-full min-w-0 max-h-[calc(100vh-64px)]">
      <div className="flex flex-col bg-primary-transparent rounded-tl-2xl h-full pt-6 pl-6 overflow-hidden">
        <TimeTrackings searchParams={params} />
      </div>
    </main>
  );
}
