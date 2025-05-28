"use client";

import styles from "@/styles/pages/tasks.module.css";
import { AuthContext } from "@/context/auth";
import { useContext, useMemo, useState } from "react";
import Tasks from "@/components/tasks/Tasks";
import TasksFilters from "@/components/tasks/TasksFilters";
import { ProjectProvider, useProjectContext } from "@/context/ProjectContext";

// This is where you define the task elements you want to display
const displayedElts = {
  isCheckbox: false,
  isDrag: false,
  isProject: true,
  isBoard: true,
  isAdmin: true,
  isStatus: true,
  isPriority: true,
  isDeadline: true,
  isEstimate: true,
  isTimer: true,
};

const displayedFilters = {
  isSearch: true,
  isProject: true,
  isBoard: true,
  isAdmin: false,
  isStatus: true,
  isPriorities: true,
  isDeadline: true,
};

export default function TasksPage() {
  const { uid } = useContext(AuthContext);
  const [defaultQueries, setDefaultQueries] = useState({
    userId: uid,
    archived: false,
  });

  useMemo(() => {
    if (uid === null) return;

    setDefaultQueries((prevQueries) => ({
      ...prevQueries,
      userId: uid,
      archived: false,
    }));
  }, [uid]);

  if (!uid) return null;

  return (
    <ProjectProvider defaultQueries={defaultQueries}>
      <TasksContent />
    </ProjectProvider>
  );
}

function TasksContent() {
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Utilisez le contexte du projet pour récupérer les tâches
  const { tasks, tasksLoading, mutateTasks } = useProjectContext();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.title}>Mes tâches</span>
          {/* Filters */}
          <TasksFilters displayedFilters={displayedFilters} tasks={tasks} />
        </div>
        {/* Tasks */}
        <div className={styles.tasksContainer}>
          <div className={styles.tasks}>
            <Tasks
              tasks={tasks}
              tasksLoading={tasksLoading}
              mutateTasks={mutateTasks}
              displayedElts={displayedElts}
              displayedFilters={displayedFilters}
              selectedTasks={selectedTasks}
              setSelectedTasks={setSelectedTasks}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
