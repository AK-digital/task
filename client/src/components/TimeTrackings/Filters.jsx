import styles from "@/styles/components/timeTrackings/filters.module.css";
import AdminFilter from "./AdminFilter";
import StartDateFilter from "./StartDateFilter";
import EndDateFilter from "./EndDateFilter";
import ProjectFilter from "./ProjectFilter";

export default function Filters({ projects, queries, setQueries }) {
  return (
    <div className={styles.container}>
      <ProjectFilter
        projects={projects}
        queries={queries}
        setQueries={setQueries}
      />
      <AdminFilter
        projects={projects}
        queries={queries}
        setQueries={setQueries}
      />
      {/* <StartDateFilter queries={queries} setQueries={setQueries} />
      <EndDateFilter queries={queries} setQueries={setQueries} /> */}
    </div>
  );
}
