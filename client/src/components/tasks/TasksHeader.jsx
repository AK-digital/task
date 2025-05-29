import { useUserRole } from "@/app/hooks/useUserRole";
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
    <div className={`sticky z-1002 left-0 bg-background-secondary-color flex items-center w-full text-text-size-small text-text-color-muted pb-3 ${!isTaskPage ? 'top-[49px] pt-0' : 'top-0 pt-5'}`}>
      {(canEdit || isCheckbox) && (
        <div className="min-w-[13px] w-[13px] h-5 flex justify-center items-center gap-1 cursor-default"></div>
      )}
      {(canDrag || isDrag) && (
        <div className="ml-1.5 min-w-4 max-w-4 flex justify-center items-center gap-1 w-full cursor-default"></div>
      )}
      <div className="w-full min-w-[240px] max-w-[740px] text-center ml-[9px]">
        <span>Tâche</span>
      </div>
      {isProject && (
        <div className="w-20 flex justify-center items-center gap-1 cursor-default">
          <span>Projets</span>
          <div className="relative flex flex-col items-center top-1">
            <ChevronUp
              size={14}
              className={`cursor-pointer hover:text-text-color ${projectSort === "asc" ? "text-[#CC9348]" : ""}`}
              onClick={() => sortByProject("asc")}
            />
            <ChevronDown
              size={14}
              className={`cursor-pointer hover:text-text-color relative -top-1 ${projectSort === "desc" ? "text-[#CC9348]" : ""}`}
              onClick={() => sortByProject("desc")}
            />
          </div>
        </div>
      )}
      {isBoard && (
        <div className="min-w-[150px] max-w-[170px] flex justify-center items-center gap-1 w-full cursor-default">
          <span>Tableaux</span>
          <div className="relative flex flex-col items-center top-1">
            <ChevronUp
              size={14}
              className={`cursor-pointer hover:text-text-color ${boardSort === "asc" ? "text-[#CC9348]" : ""}`}
              onClick={() => sortByBoard("asc")}
            />
            <ChevronDown
              size={14}
              className={`cursor-pointer hover:text-text-color relative -top-1 ${boardSort === "desc" ? "text-[#CC9348]" : ""}`}
              onClick={() => sortByBoard("desc")}
            />
          </div>
        </div>
      )}
      <div className="min-w-[100px] max-w-[100px] flex justify-center items-center gap-1 w-full cursor-default">
        <span>Admin</span>
        {isAdminFilter && (
          <div className="relative flex flex-col items-center top-1">
            <ChevronUp size={14} className="cursor-pointer hover:text-text-color" />
            <ChevronDown size={14} className="cursor-pointer hover:text-text-color relative -top-1" />
          </div>
        )}
      </div>
      {isStatus && (
        <div className="w-full min-w-[135px] max-w-[150px] flex justify-center items-center gap-1 cursor-default">
          <span>Statut</span>
          <div className="relative flex flex-col items-center top-1">
            <ChevronUp
              size={14}
              className={`cursor-pointer hover:text-text-color ${statusSort === "asc" ? "text-[#CC9348]" : ""}`}
              onClick={() => sortByStatus("asc")}
            />
            <ChevronDown
              size={14}
              className={`cursor-pointer hover:text-text-color relative -top-1 ${statusSort === "desc" ? "text-[#CC9348]" : ""}`}
              onClick={() => sortByStatus("desc")}
            />
          </div>
        </div>
      )}
      {isPriority && (
        <div className="w-full min-w-[135px] max-w-[150px] flex justify-center items-center gap-1  cursor-default">
          <span>Priorité</span>
          <div className="relative flex flex-col items-center top-1">
            <ChevronUp
              size={14}
              className={`cursor-pointer hover:text-text-color ${prioritySort === "asc" ? "text-[#CC9348]" : ""}`}
              onClick={() => sortByPriority("asc")}
            />
            <ChevronDown
              size={14}
              className={`cursor-pointer hover:text-text-color relative -top-1 ${prioritySort === "desc" ? "text-[#CC9348]" : ""}`}
              onClick={() => sortByPriority("desc")}
            />
          </div>
        </div>
      )}
      {isDeadline && (
        <div className="min-w-[120px] max-w-[150px] flex justify-center items-center gap-1 w-full cursor-default">
          <span>Échéance</span>
          <div className="relative flex flex-col items-center top-1">
            <ChevronUp
              size={14}
              className={`cursor-pointer hover:text-text-color ${deadlineSort === "asc" ? "text-[#CC9348]" : ""}`}
              onClick={() => sortByDeadline("asc")}
            />
            <ChevronDown
              size={14}
              className={`cursor-pointer hover:text-text-color relative -top-1 ${deadlineSort === "desc" ? "text-[#CC9348]" : ""}`}
              onClick={() => sortByDeadline("desc")}
            />
          </div>
        </div>
      )}
      {isEstimate && (
        <div className="min-w-[120px] max-w-[140px] flex justify-center items-center gap-1 w-full cursor-default">
          <span>Estimation</span>
          {/* <div className="relative flex flex-col items-center top-1">
            <ChevronUp
              size={14}
              className={`cursor-pointer hover:text-text-color ${estimateSort === "asc" ? "text-[#CC9348]" : ""}`}
              onClick={() => sortByEstimate("asc")}
            />
            <ChevronDown
              size={14}
              className={`cursor-pointer hover:text-text-color relative -top-1 ${estimateSort === "desc" ? "text-[#CC9348]" : ""}`}
              onClick={() => sortByEstimate("desc")}
            />
          </div> */}
        </div>
      )}
      {isTimer && (
        <div className="max-w-[120px] min-w-[120px] flex justify-center items-center gap-1 w-full cursor-default">
          <span>Temps</span>
          {/* <div className="relative flex flex-col items-center top-1">
            <ChevronUp size={14} className="cursor-pointer hover:text-text-color" />
            <ChevronDown size={14} className="cursor-pointer hover:text-text-color relative -top-1" />
          </div> */}
        </div>
      )}
      <div className="min-w-9 w-10 h-2.5 flex justify-center items-center gap-1 cursor-default"></div>
    </div>
  );
}
