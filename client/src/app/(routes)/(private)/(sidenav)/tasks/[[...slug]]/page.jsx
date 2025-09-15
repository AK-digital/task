"use client";
import { AuthContext } from "@/context/auth";
import { useContext, useMemo, useState, useEffect } from "react";
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
  isBoard: false,
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
  const { tasks, tasksLoading, mutateTasks, statuses, setQueries } = useProjectContext();

  // Debug temporaire
  console.log("Debug TasksPage:", {
    tasksCount: tasks?.length,
    tasksLoading,
    statusesCount: statuses?.length,
    todoStatuses: statuses?.filter(s => s.status === "todo" || s.todo === true)?.length
  });

  // Créer une dépendance qui change quand les propriétés todo des statuts changent
  const todoStatusesSignature = useMemo(() => {
    if (!statuses || statuses.length === 0) return '';
    return statuses
      .map(status => `${status._id}:${status.status === "todo" || status.todo === true}`)
      .sort()
      .join('|');
  }, [statuses]);

  // Filtrage automatique des tâches "Todo" au chargement et lors des changements
  useEffect(() => {
    if (!statuses || statuses.length === 0) return;

    // Trouver tous les statuts qui sont marqués comme "Todo" (status="todo" OU todo=true)
    const todoStatuses = statuses.filter(status => status.status === "todo" || status.todo === true);
    
    // Seulement appliquer le filtre si il y a des statuts Todo
    if (todoStatuses.length > 0) {
      setQueries(prevQueries => {
        // Grouper les IDs des statuts "Todo" (comme dans les filtres)
        const todoStatusIds = todoStatuses.map(status => status._id);
        
        // Vérifier si les statuts Todo actuels sont différents des filtres existants
        const currentStatusFilter = prevQueries.status?.[0] || [];
        
        // Comparer les deux ensembles pour voir s'ils sont différents
        const areDifferent = todoStatusIds.length !== currentStatusFilter.length ||
          !todoStatusIds.every(id => currentStatusFilter.includes(id));
        
        // Mettre à jour seulement si les statuts Todo ont changé
        if (areDifferent) {
          console.log("Mise à jour du filtrage Todo:", { todoStatusIds, currentStatusFilter });
          return {
            ...prevQueries,
            status: [todoStatusIds] // Format attendu par les filtres
          };
        }
        
        return prevQueries;
      });
    } else {
      // Si aucun statut Todo, vider le filtre de statut s'il était appliqué automatiquement
      setQueries(prevQueries => {
        if (prevQueries.status && prevQueries.status.length > 0) {
          console.log("Suppression du filtrage Todo car aucun statut Todo");
          return {
            ...prevQueries,
            status: []
          };
        }
        return prevQueries;
      });
    }
  }, [todoStatusesSignature, statuses, setQueries]);

  return (
    <main className="ml-6 w-full min-w-0 max-h-[calc(100vh-64px)]">
      <div className="py-4 pr-4 pl-[38px] bg-[#dad6c799] h-full rounded-tl-[10px] overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-4 pr-4 pb-4 flex-wrap">
          <h1 className="text-2xl min-w-max select-none mb-0">Mes tâches</h1>
          {/* Filters */}
          <div className="flex-1 min-w-0">
            <TasksFilters displayedFilters={displayedFilters} tasks={tasks} />
          </div>
        </div>
        {/* Tasks */}
        <div className="boards_Boards overflow-y-auto h-[90%] pr-5 rounded-[10px]">
          <div className="relative shadow-small rounded-[10px] w-full overflow-x-auto">
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
