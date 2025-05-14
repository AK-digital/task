import styles from "@/styles/components/tasks/tasks-header.module.css";
import { useUserRole } from "@/app/hooks/useUserRole";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

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
        if (sort === "asc") {
          if (elt) {
            return a[elt][path]?.localeCompare(b[elt][path]);
          } else {
            return a[path]?.localeCompare(b[path]);
          }
        } else {
          if (elt) {
            return b[elt][path]?.localeCompare(a[elt][path]);
          } else {
            return b[path]?.localeCompare(a[path]);
          }
        }
      });
      return sortedTasks;
    });
  }

  function sortTaskByPriority(sort) {
    setSortedTasks((prev) => {
      const sortedTasks = [...prev].sort((a, b) => {
        // Convert priority strings to numeric values
        const priorityValues = {
          Urgent: 4,
          Haute: 3,
          Moyenne: 2,
          Basse: 1,
        };

        const priorityA = priorityValues[a.priority];
        const priorityB = priorityValues[b.priority];

        if (sort === "asc") {
          return priorityA - priorityB;
        } else {
          return priorityB - priorityA;
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

    sortTasks(sort, null, "status");
  }

  function sortByPriority(sort) {
    resetStates();
    if (sort === prioritySort) {
      return resetSort();
    }

    setPrioritySort(sort);

    sortTaskByPriority(sort);
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
    <div className={styles.container}>
      {(canEdit || isCheckbox) && (
        <div className={`${styles.selection} ${styles.row}`}></div>
      )}
      {(canDrag || isDrag) && (
        <div className={`${styles.drag} ${styles.row}`}></div>
      )}
      <div className={`${styles.text}`}>
        <span>Tâches</span>
      </div>
      {isProject && (
        <div className={`${styles.project} ${styles.row}`}>
          <span>Projets</span>
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
          <span>Tableaux</span>
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
        <span>Admin</span>
        {isAdminFilter && (
          <div>
            <ChevronUp size={14} />
            <ChevronDown size={14} />
          </div>
        )}
      </div>
      {isStatus && (
        <div className={`${styles.status} ${styles.row}`}>
          <span>Status</span>
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
          <span>Priorité</span>
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
          <span>Échéance</span>
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
          <span>Estimation</span>
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
          <span>Temps</span>
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
