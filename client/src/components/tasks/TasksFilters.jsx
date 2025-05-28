import styles from "@/styles/components/tasks/tasks-filters.module.css";
import TasksSearch from "./TasksSearch";
import TasksStatusFilter from "./TasksStatusFilter";
import TasksPrioritiesFilter from "./TasksPrioritiesFilter";
import TasksAdminFilter from "./TasksAdminFilter";
import TasksBoardFilter from "./TasksBoardFilter";
import TasksProjectFilter from "./TasksProjectFilter";

export default function TasksFilters({
  displayedFilters,
  queries,
  setQueries,
}) {
  const { isSearch, isProject, isBoard, isAdmin, isStatus, isPriorities } =
    displayedFilters;

  return (
    <div className={styles.container}>
      {isSearch && <TasksSearch setQueries={setQueries} />}
      {isProject && (
        <TasksProjectFilter queries={queries} setQueries={setQueries} />
      )}
      {isBoard && (
        <TasksBoardFilter queries={queries} setQueries={setQueries} />
      )}
      {isAdmin && (
        <TasksAdminFilter queries={queries} setQueries={setQueries} />
      )}
      {isStatus && (
        <TasksStatusFilter queries={queries} setQueries={setQueries} />
      )}
      {isPriorities && (
        <TasksPrioritiesFilter queries={queries} setQueries={setQueries} />
      )}
    </div>
  );
}
