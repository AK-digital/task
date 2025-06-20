import Task from "../Task/Task";
import { isNotEmpty } from "@/utils/utils";
import TasksHeader from "./TasksHeader";
import TaskSkeletons from "../Task/TaskSkeletons";
import { useMemo, useState } from "react";
import SelectedTasks from "./SelectedTasks";

export default function Tasks({
  project,
  tasks,
  tasksLoading,
  activeId,
  mutateTasks,
  displayedElts,
  displayedFilters,
  selectedTasks,
  setSelectedTasks,
  archive,
}) {
  const [sortedTasks, setSortedTasks] = useState(tasks || []);

  useMemo(() => {
    setSortedTasks(tasks);
  }, [tasks]);

  return (
    <div className="relative">
      {tasksLoading ? (
        <TaskSkeletons displayedElts={displayedElts} />
      ) : (
        <div>
          {isNotEmpty(sortedTasks) ? (
            <>
              <TasksHeader
                displayedElts={displayedElts}
                displayedFilters={displayedFilters}
                tasks={tasks}
                setSortedTasks={setSortedTasks}
              />
              {sortedTasks?.map((task) => (
                <Task
                  key={task?._id}
                  task={task}
                  displayedElts={displayedElts}
                  setSelectedTasks={setSelectedTasks}
                  isDragging={task?._id === activeId}
                  mutate={mutateTasks}
                />
              ))}
              {isNotEmpty(selectedTasks) && (
                <SelectedTasks
                  project={project}
                  setSelectedTasks={setSelectedTasks}
                  selectedTasks={selectedTasks}
                  archive={archive}
                  mutate={mutateTasks}
                />
              )}
            </>
          ) : (
            <div className="text-center text-text-color-muted text-[1.4rem] pb-20"></div>
          )}
        </div>
      )}
    </div>
  );
}
