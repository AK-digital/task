import { useUserRole } from "../../../hooks/useUserRole";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function TasksHeader({
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

  function resetStates() {
    setProjectSort(null);
    setBoardSort(null);
    setStatusSort(null);
    setPrioritySort(null);
    setDeadlineSort(null);
    setEstimateSort(null);
    setTimerSort(null);
  }

  function resetSort() {
    setSortedTasks([...tasks]);
  }

  function sortTasks(sort, elt, path) {
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
  }

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

  // function sortByEstimate(sort) {
  //   resetStates();
  //   if (sort === estimateSort) {
  //     return resetSort();
  //   }

  //   setEstimateSort(sort);

  //   sortTasks(sort, null, "estimation");
  // }

  // function sortByTimer(sort) {
  //   resetStates();
  //   if (sort === timerSort) {
  //     return resetSort();
  //   }

  //   setTimerSort(sort);

  //   sortTasks(sort, null, "timer");
  // }

  return (
    <div
      className={`sticky z-1002 left-0 bg-secondary flex items-center w-full text-small text-text-color-muted ${
        !isTaskPage ? "top-[47px] pt-0" : "top-0 pt-5"
      }`}
    >
      {/* Checkbox */}
      {(canEdit || isCheckbox) && (
        <div className="min-w-[13px] w-[13px] h-5 flex justify-center items-center gap-1 cursor-default flex-shrink-0"></div>
      )}
      {/* Drag */}
      {(canDrag || isDrag) && (
        <div className="ml-1.5 min-w-4 max-w-4 flex justify-center items-center gap-1 w-full cursor-default flex-shrink-0"></div>
      )}
      {/* Tâche */}
      <div className="w-full min-w-[150px] sm:min-w-[200px] lg:min-w-[240px] max-w-[700px] text-center mx-2 select-none flex-grow">
        <span>Tâche</span>
      </div>
      {/* Conversation (pas de header pour cette colonne) */}
      <div className="pr-2 flex justify-center items-center cursor-default flex-shrink-0"></div>
      {/* Project */}
      {isProject && (
        <div className="hidden md:flex items-center justify-center px-2 lg:px-4 w-16 lg:w-20 gap-1 cursor-default flex-shrink-0">
          <span className="select-none text-xs lg:text-sm">Projets</span>
          <div className="flex flex-col items-center">
            <ChevronUp
              size={14}
              className={`cursor-pointer hover:text-text-color ${
                projectSort === "asc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByProject("asc")}
            />
            <ChevronDown
              size={14}
              className={`cursor-pointer hover:text-text-color relative -top-1 ${
                projectSort === "desc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByProject("desc")}
            />
          </div>
        </div>
      )}
      {/* Board */}
      {isBoard && (
        <div className="hidden lg:flex items-center justify-center gap-1 px-2 xl:px-4 min-w-[100px] xl:min-w-[120px] max-w-[150px] w-full cursor-default flex-shrink-0">
          <span className="select-none text-xs xl:text-sm">Tableaux</span>
          <div className="flex flex-col items-center">
            <ChevronUp
              size={14}
              className={`cursor-pointer hover:text-text-color ${
                boardSort === "asc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByBoard("asc")}
            />
            <ChevronDown
              size={14}
              className={`cursor-pointer hover:text-text-color relative -top-1 ${
                boardSort === "desc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByBoard("desc")}
            />
          </div>
        </div>
      )}
      {/* Admin/Responsibles */}
      <div className="hidden sm:flex justify-center items-center gap-1 px-2 lg:px-3 min-w-[60px] lg:min-w-[80px] max-w-[100px] w-full cursor-default flex-shrink-0">
        <span className="select-none text-xs lg:text-sm">Admin</span>
        {isAdminFilter && (
          <div className="relative flex flex-col items-center top-1">
            <ChevronUp
              size={14}
              className="cursor-pointer hover:text-text-color"
            />
            <ChevronDown
              size={14}
              className="cursor-pointer hover:text-text-color relative -top-1"
            />
          </div>
        )}
      </div>
      {/* Status */}
      {isStatus && (
        <div className="flex items-center justify-center gap-1 min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] max-w-[150px] w-full cursor-default flex-shrink-0">
          <span className="select-none  leading-[34px]  text-xs lg:text-sm">Statut</span>
          <div className="flex flex-col items-center">
            <ChevronUp
              size={14}
              className={`cursor-pointer hover:text-text-color ${
                statusSort === "asc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByStatus("asc")}
            />
            <ChevronDown
              size={14}
              className={`cursor-pointer hover:text-text-color relative -top-1 ${
                statusSort === "desc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByStatus("desc")}
            />
          </div>
        </div>
      )}
      {/* Priority */}
      {isPriority && (
        <div className="flex items-center justify-center gap-1 min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] max-w-[150px] w-full cursor-default flex-shrink-0">
          <div className="select-none text-xs lg:text-sm">Priorité</div>
          <div className="flex flex-col items-center">
            <ChevronUp
              size={14}
              className={`cursor-pointer hover:text-text-color ${
                prioritySort === "asc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByPriority("asc")}
            />
            <ChevronDown
              size={14}
              className={`cursor-pointer hover:text-text-color relative -top-1 ${
                prioritySort === "desc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByPriority("desc")}
            />
          </div>
        </div>
      )}
      {/* Deadline */}
      {isDeadline && (
        <div className="hidden md:flex items-center justify-center gap-1 py-1 px-1 lg:px-2 min-w-[80px] lg:min-w-[100px] max-w-[120px] w-full cursor-default flex-shrink-0">
          <span className="select-none text-xs lg:text-sm">Échéance</span>
          <div className="flex flex-col items-center">
            <ChevronUp
              size={14}
              className={`cursor-pointer hover:text-text-color ${
                deadlineSort === "asc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByDeadline("asc")}
            />
            <ChevronDown
              size={14}
              className={`cursor-pointer hover:text-text-color relative -top-1 ${
                deadlineSort === "desc" ? "text-accent-color" : ""
              }`}
              onClick={() => sortByDeadline("desc")}
            />
          </div>
        </div>
      )}
      {/* Estimate */}
      {isEstimate && (
        <div className="hidden lg:flex items-center justify-center gap-1 py-1 px-1 xl:px-2 min-w-[80px] xl:min-w-[100px] max-w-[120px] w-full cursor-default flex-shrink-0">
          <span className="select-none text-xs xl:text-sm">Estimation</span>
          {/* <div className="flex flex-col items-center">
            <ChevronUp
              size={14}
              className={`cursor-pointer hover:text-text-color ${estimateSort === "asc" ? "text-accent-color" : ""}`}
              onClick={() => sortByEstimate("asc")}
            />
            <ChevronDown
              size={14}
              className={`cursor-pointer hover:text-text-color relative -top-1 ${estimateSort === "desc" ? "text-accent-color" : ""}`}
              onClick={() => sortByEstimate("desc")}
            />
          </div> */}
        </div>
      )}
      {/* Timer */}
      {isTimer && (
        <div className="hidden lg:flex items-center justify-center gap-1 px-1 xl:px-1.5 max-w-[100px] xl:max-w-[120px] w-full cursor-default flex-shrink-0">
          <span className="select-none text-xs xl:text-sm">Temps</span>
          {/* <div className="flex flex-col items-center">
            <ChevronUp size={14} className="cursor-pointer hover:text-text-color" />
            <ChevronDown size={14} className="cursor-pointer hover:text-text-color relative -top-1" />
          </div> */}
        </div>
      )}
      {/* Remove button space */}
      <div className="min-w-8 w-10 h-2.5 flex justify-center items-center gap-1 cursor-default flex-shrink-0"></div>
    </div>
  );
}
