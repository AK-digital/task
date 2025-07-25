import TasksSearch from "./TasksSearch";
import TasksStatusFilter from "./TasksStatusFilter";
import TasksPrioritiesFilter from "./TasksPrioritiesFilter";
import TasksAdminFilter from "./TasksAdminFilter";
import TasksBoardFilter from "./TasksBoardFilter";
import TasksProjectFilter from "./TasksProjectFilter";
import { useProjectContext } from "@/context/ProjectContext";

export default function TasksFilters({ displayedFilters }) {
  const { queries, setQueries } = useProjectContext();
  const { isSearch, isProject, isBoard, isAdmin, isStatus, isPriorities } =
    displayedFilters;

  return (
    <div className="relative flex items-center flex-wrap gap-4 select-none w-full">
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
