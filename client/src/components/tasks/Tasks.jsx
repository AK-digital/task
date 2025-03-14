"use client";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";
import { useDroppable } from "@dnd-kit/core";
import SelectedTasks from "./SelectedTasks";
import TasksHeader from "./TasksHeader";

export default function Tasks({
  tasks,
  project,
  boardId,
  activeId,
  selectedTasks,
  setSelectedTasks,
  archive,
}) {
  const { setNodeRef } = useDroppable({
    id: boardId,
  });
  return (
    <div
      className={styles.container}
      suppressHydrationWarning
      data-board-id={boardId}
    >
      {tasks && tasks?.length > 0 && <TasksHeader />}
      <div className={styles.list} ref={setNodeRef}>
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
      </div>

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
