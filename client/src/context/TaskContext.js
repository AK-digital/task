"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Création du contexte
const TaskContext = createContext();

// Le Provider
export function TaskProvider({ children }) {
  const pathname = usePathname();
  const [openedTask, setOpenedTask] = useState(null);

  useEffect(() => {
    const segments = pathname?.split("/");
    const last = segments[segments.length - 1];
    const beforeLast = segments[segments.length - 2];

    if (beforeLast === "task") {
      setOpenedTask(last);
    } else {
      setOpenedTask(null);
    }
  }, [pathname]);

  const openTask = (taskId, archive, projectId) => {
    const path = archive
      ? `/projects/${projectId}/archive/task/${taskId}`
      : `/projects/${projectId}/task/${taskId}`;
    window.history.pushState({}, "", path);
    setOpenedTask(taskId);
  };

  return (
    <TaskContext.Provider value={{ openedTask, setOpenedTask, openTask }}>
      {children}
    </TaskContext.Provider>
  );
}

// Le hook custom pour utiliser le contexte
export function useTaskContext() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }

  return context;
}
