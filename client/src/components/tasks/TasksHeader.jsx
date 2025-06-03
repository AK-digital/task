import styles from "@/styles/components/tasks/tasks-header.module.css";
import { useUserRole } from "@/app/hooks/useUserRole";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function TasksHeader({
  project,
  displayedElts,
  tasks,
  setSortedTasks,
  displayedFilters,
}) {
  const { t } = useTranslation();
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
    <div className={styles.container} data-top={!isTaskPage}>
      {(canEdit || isCheckbox) && (
        <div className={`${styles.selection} ${styles.row}`}></div>
      )}
      {(canDrag || isDrag) && (
        <div className={`${styles.drag} ${styles.row}`}></div>
      )}
      <div className={`${styles.text}`}>
        <span>{t("tasks.task")}</span>
      </div>
      {isProject && (
        <div className={`${styles.project} ${styles.row}`}>
          <span>{t("tasks.projects")}</span>
          <div className={styles.sort}>
            <ChevronUp
              size={14}
              data-active={projectSort === "asc"}
              onClick={() => sortByProject("asc")}
            />
            <ChevronDown
              size={14}
              data-active={projectSort === "desc"}
              onClick={() => sortByProject("desc")}
            />
          </div>
        </div>
      )}
      {isBoard && (
        <div className={`${styles.board} ${styles.row}`}>
          <span>{t("tasks.boards")}</span>
          <div className={styles.sort}>
            <ChevronUp
              size={14}
              data-active={boardSort === "asc"}
              onClick={() => sortByBoard("asc")}
            />
            <ChevronDown
              size={14}
              data-active={boardSort === "desc"}
              onClick={() => sortByBoard("desc")}
            />
          </div>
        </div>
      )}
      <div className={`${styles.responsibles} ${styles.row}`}>
        <span>{t("tasks.admin")}</span>
        {isAdminFilter && (
          <div>
            <ChevronUp size={14} />
            <ChevronDown size={14} />
          </div>
        )}
      </div>
      {isStatus && (
        <div className={`${styles.status} ${styles.row}`}>
          <span>{t("tasks.status")}</span>
          <div className={styles.sort}>
            <ChevronUp
              size={14}
              data-active={statusSort === "asc"}
              onClick={() => sortByStatus("asc")}
            />
            <ChevronDown
              size={14}
              data-active={statusSort === "desc"}
              onClick={() => sortByStatus("desc")}
            />
          </div>
        </div>
      )}
      {isPriority && (
        <div className={`${styles.priority} ${styles.row}`}>
          <span>{t("tasks.priority")}</span>
          <div className={styles.sort}>
            <ChevronUp
              size={14}
              data-active={prioritySort === "asc"}
              onClick={() => sortByPriority("asc")}
            />
            <ChevronDown
              size={14}
              data-active={prioritySort === "desc"}
              onClick={() => sortByPriority("desc")}
            />
          </div>
        </div>
      )}
      {isDeadline && (
        <div className={`${styles.deadline} ${styles.row}`}>
          <span>{t("tasks.deadline")}</span>
          <div className={styles.sort}>
            <ChevronUp
              size={14}
              data-active={deadlineSort === "asc"}
              onClick={() => sortByDeadline("asc")}
            />
            <ChevronDown
              size={14}
              data-active={deadlineSort === "desc"}
              onClick={() => sortByDeadline("desc")}
            />
          </div>
        </div>
      )}
      {isEstimate && (
        <div className={`${styles.estimation} ${styles.row}`}>
          <span>{t("tasks.estimation")}</span>
          {/* <div className={styles.sort}>
            <ChevronUp
              size={14}
              data-active={estimateSort === "asc"}
              onClick={() => sortByEstimate("asc")}
            />
            <ChevronDown
              size={14}
              data-active={estimateSort === "desc"}
              onClick={() => sortByEstimate("desc")}
            />
          </div> */}
        </div>
      )}
      {isTimer && (
        <div className={`${styles.timer} ${styles.row}`}>
          <span>{t("tasks.time")}</span>
          {/* <div>
            <ChevronUp size={14} />
            <ChevronDown size={14} />
          </div> */}
        </div>
      )}
      <div className={`${styles.remove} ${styles.row}`}></div>
    </div>
  );
}
