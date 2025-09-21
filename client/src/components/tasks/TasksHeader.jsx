import { useUserRole } from "@/hooks/api/useUserRole";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, memo, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";

const TasksHeader = memo(function TasksHeader({
  project,
  displayedElts,
  tasks,
  setSortedTasks,
  displayedFilters,
}) {
  const [projectSort, setProjectSort] = useState(null);
  const [boardSort, setBoardSort] = useState(null);
  const [statusSort, setStatusSort] = useState(null);
  const [prioritySort, setPrioritySort] = useState(null);
  const [deadlineSort, setDeadlineSort] = useState(null);
  const [estimateSort, setEstimateSort] = useState(null);
  const [timerSort, setTimerSort] = useState(null);
  const pathname = usePathname();
  const isTaskPage = pathname.includes("tasks");

  const {
    isCheckbox,
    isDrag,
    isProject,
    isBoard,
    isStatus,
    isPriority,
    isDeadline,
    isEstimate,
    isTimer,
  } = displayedElts;
  const isAdminFilter = displayedFilters?.isAdmin;

  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);
  const canDrag = useUserRole(project, ["owner", "manager", "team"]);

  const resetStates = useCallback(() => {
    setProjectSort(null);
    setBoardSort(null);
    setStatusSort(null);
    setPrioritySort(null);
    setDeadlineSort(null);
    setEstimateSort(null);
    setTimerSort(null);
  }, []);

  const resetSort = useCallback(() => {
    setSortedTasks([...tasks]);
  }, [tasks, setSortedTasks]);

  const sortTasks = useCallback((sort, elt, path) => {
    setSortedTasks((prev) => {
      const sortedTasks = [...prev]?.sort((a, b) => {
        const aValue = elt ? a[elt]?.[path] : a[path];
        const bValue = elt ? b[elt]?.[path] : b[path];

        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;

        if (sort === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
      return sortedTasks;
    });
  }, [setSortedTasks]);

  function sortByProject(sort) {
    resetStates();
    if (sort === projectSort) {
      return resetSort();
    }

    setProjectSort(sort);

    sortTasks(sort, "projectId", "name");
  }

  function sortByBoard(sort) {
    resetStates();
    if (sort === boardSort) {
      return resetSort();
    }

    setBoardSort(sort);

    sortTasks(sort, "boardId", "title");
  }

  function sortByStatus(sort) {
    resetStates();
    if (sort === statusSort) {
      return resetSort();
    }

    setStatusSort(sort);

    sortTasks(sort, "status", "name");
  }

  function sortByPriority(sort) {
    resetStates();
    if (sort === prioritySort) {
      return resetSort();
    }

    setPrioritySort(sort);

    setSortedTasks((prev) => {
      const sortedTasks = [...prev]?.sort((a, b) => {
        const aPriority = a.priority;
        const bPriority = b.priority;

        // Si une des priorités est null/undefined, on la met à la fin
        if (!aPriority && !bPriority) return 0;
        if (!aPriority) return sort === "asc" ? 1 : -1;
        if (!bPriority) return sort === "asc" ? -1 : 1;

        // Mapping des noms de priorités vers des valeurs numériques
        // Plus le nombre est élevé, plus c'est urgent/important
        const priorityOrder = {
          "Très Basse": 1,
          Basse: 2,
          Faible: 2,
          Normale: 3,
          Moyenne: 4,
          Élevée: 5,
          Haute: 6,
          "Très Haute": 7,
          Urgente: 8,
          Critique: 9,
          Bloquante: 10,
          // Ajoutez ici vos autres noms de priorités personnalisés
        };

        // Récupérer les valeurs numériques ou utiliser 2 (Basse) par défaut
        const aOrder = priorityOrder[aPriority.name] || 2;
        const bOrder = priorityOrder[bPriority.name] || 2;

        // Trier par ordre d'importance
        return sort === "asc" ? aOrder - bOrder : bOrder - aOrder;
      });
      return sortedTasks;
    });
  }

  function sortByDeadline(sort) {
    resetStates();
    if (sort === deadlineSort) {
      return resetSort();
    }

    setDeadlineSort(sort);

    sortTasks(sort, null, "deadline");
  }

  return (
    <div
      className={`sticky z-1002 left-0 bg-secondary flex items-center w-full text-small text-text-color-muted ${
        !isTaskPage ? "top-[47px] pt-0" : "top-0 pt-5"
      }`}
    >
      {/* Checkbox */}
      {(canEdit || isCheckbox) && (
        <div className="task-col-checkbox task-header-col"></div>
      )}
      {/* Drag */}
      {(canDrag || isDrag) && (
        <div className="task-col-drag task-header-col"></div>
      )}
     
     {/* Text */}
     <div className="w-[37px]">
     </div>
      
      {/* Tâche */}
      <div className="task-col-text task-header-col">
        <span className="text-center w-full block">Tâche</span>
      </div>
      {/* Conversation */}
      <div className="task-col-conversation task-header-col"></div>
      {/* Project */}
      {isProject && (
        <div className="task-col-project task-header-col gap-1">
          <span className="text-xs ">Projets</span>
          <div className="task-header-sort">
            <ChevronUp
              size={14}
              className={`task-header-chevron-up ${
                projectSort === "asc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByProject("asc")}
            />
            <ChevronDown
              size={14}
              className={`task-header-chevron-down ${
                projectSort === "desc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByProject("desc")}
            />
          </div>
        </div>
      )}
      {/* Board */}
      {isBoard && (
        <div className="task-col-board task-header-col gap-1">
          <span className="text-xs">Tableaux</span>
          <div className="task-header-sort">
            <ChevronUp
              size={14}
              className={`task-header-chevron-up ${
                boardSort === "asc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByBoard("asc")}
            />
            <ChevronDown
              size={14}
              className={`task-header-chevron-down ${
                boardSort === "desc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByBoard("desc")}
            />
          </div>
        </div>
      )}
      {/* Admin/Responsibles */}
      <div className="task-col-admin task-header-col gap-1">
        <span className="text-xs ">Admin</span>
        {isAdminFilter && (
          <div className="task-header-sort relative top-1">
            <ChevronUp
              size={14}
              className="task-header-chevron-up"
            />
            <ChevronDown
              size={14}
              className="task-header-chevron-down"
            />
          </div>
        )}
      </div>
      {/* Status */}
      {isStatus && (
        <div className="task-col-status task-header-col gap-1">
          <span className="leading-[34px] text-xs ">Statut</span>
          <div className="task-header-sort">
            <ChevronUp
              size={14}
              className={`task-header-chevron-up ${
                statusSort === "asc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByStatus("asc")}
            />
            <ChevronDown
              size={14}
              className={`task-header-chevron-down ${
                statusSort === "desc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByStatus("desc")}
            />
          </div>
        </div>
      )}
      {/* Priority */}
      {isPriority && (
        <div className="task-col-priority task-header-col gap-1">
          <div className="text-xs ">Priorité</div>
          <div className="task-header-sort">
            <ChevronUp
              size={14}
              className={`task-header-chevron-up ${
                prioritySort === "asc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByPriority("asc")}
            />
            <ChevronDown
              size={14}
              className={`task-header-chevron-down ${
                prioritySort === "desc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByPriority("desc")}
            />
          </div>
        </div>
      )}
      {/* Deadline */}
      {isDeadline && (
        <div className="task-col-deadline task-header-col gap-1">
          <span className="text-xs ">Échéance</span>
          <div className="task-header-sort">
            <ChevronUp
              size={14}
              className={`task-header-chevron-up ${
                deadlineSort === "asc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByDeadline("asc")}
            />
            <ChevronDown
              size={14}
              className={`task-header-chevron-down ${
                deadlineSort === "desc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByDeadline("desc")}
            />
          </div>
        </div>
      )}
      {/* Estimate */}
      {isEstimate && (
        <div className="task-col-estimate task-header-col gap-1">
          <span className="text-xs ">Estimation</span>
          
        </div>
      )}
      {/* Timer */}
      {isTimer && (
        <div className="task-col-timer task-header-col gap-1">
          <span className="text-xs ">Temps</span>
         
        </div>
      )}
  
    </div>
  );
});

export default TasksHeader;
