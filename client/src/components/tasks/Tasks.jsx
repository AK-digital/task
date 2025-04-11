"use client";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";
import SelectedTasks from "./SelectedTasks";
import TasksHeader from "./TasksHeader";

export default function Tasks({
  tasks,
  project,
  activeId,
  selectedTasks,
  setSelectedTasks,
  archive,
}) {
  return (
    <div className={styles.container} suppressHydrationWarning>
      {tasks && tasks?.length > 0 && <TasksHeader project={project} />}
      {tasks?.map((task) => (
        <Task
          key={task?._id}
          task={task}
          project={project}
          isDragging={task?._id === activeId}
          setSelectedTasks={setSelectedTasks}
          archive={archive}
        />
      ))}
      {selectedTasks?.length > 0 && (
        <SelectedTasks
          project={project}
          tasks={selectedTasks}
          setSelectedTasks={setSelectedTasks}
          archive={archive}
        />
      )}
    </div>
  );
}
