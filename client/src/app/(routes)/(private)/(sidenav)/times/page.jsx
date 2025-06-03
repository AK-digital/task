"use server";
import styles from "@/styles/pages/time-trackings.module.css";
import TimeTrackings from "@/components/TimeTrackings/TimeTrackings";

export default async function TimeTrackingsPage({ searchParams }) {
  const params = await searchParams;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <TimeTrackings searchParams={params} />
      </div>
    </main>
  );
}
