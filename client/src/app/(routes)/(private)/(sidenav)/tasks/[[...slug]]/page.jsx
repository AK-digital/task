"use client";

import styles from "@/styles/pages/tasks.module.css";
import { AuthContext } from "@/context/auth";
import { useContext, useMemo, useState } from "react";
import Tasks from "@/components/tasks/Tasks";
import TasksFilters from "@/components/tasks/TasksFilters";
import { useTasks } from "@/app/hooks/useTasks";

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
  const [queries, setQueries] = useState({});
  const [selectedTasks, setSelectedTasks] = useState([]);

  useMemo(() => {
    if (uid === null) return;

    setQueries((prevQueries) => ({
      ...prevQueries,
      userId: uid,
      archived: false,
    }));
  }, [uid]);

  const { tasks, tasksLoading, mutateTasks } = useTasks(queries);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.title}>Mes tâches</span>
          {/* Filters */}
          <TasksFilters
            displayedFilters={displayedFilters}
            tasks={tasks}
            queries={queries}
            setQueries={setQueries}
          />
        </div>
        {/* Tasks */}
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
    </main>
  );
}
