import { useProjectContext } from "@/context/ProjectContext";
import styles from "@/styles/components/tasks/tasks-status-filter.module.css";
import { ChartBar, ChevronDown, Undo } from "lucide-react";
import { useState } from "react";

export default function TasksStatusFilter({ queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);
  const QueriesStatus = queries?.status;
  const hasStatus = QueriesStatus?.length > 0;

  const { statuses } = useProjectContext();

  function handleResetStatus() {
    setQueries((prev) => ({
      ...prev,
      status: null,
    }));
    setIsOpen(false);
  }

  function handleStatusChange(e) {
    const { value, checked } = e.target;

    if (checked) {
      setQueries((prev) => ({
        ...prev,
        status: prev?.status ? [...prev.status, value] : [value],
      }));
    } else {
      const deletedStatus = queries?.status?.filter(
        (status) => status !== value
      );

      setQueries((prev) => ({
        ...prev,
        status: deletedStatus,
      }));
    }
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.current}
        onClick={() => setIsOpen(!isOpen)}
        data-open={isOpen}
      >
        <ChartBar size={16} />
        <span>Status</span>
        {hasStatus && (
          <span className={styles.length}>{QueriesStatus?.length}</span>
        )}
        <ChevronDown size={16} />
      </div>
      {isOpen && (
        <>
          <div className={styles.dropdown}>
            <ul>
              <li className={styles.status} onClick={handleResetStatus}>
                <Undo size={14} />
                <span>Effacer</span>
              </li>
              {statuses.map((elt) => (
                <li key={elt?._id} className={styles.status}>
                  <input
                    type="checkbox"
                    id={elt?._id}
                    name={elt?.name}
                    value={elt?._id}
                    onChange={handleStatusChange}
                    checked={
                      hasStatus ? QueriesStatus?.includes(elt?._id) : false
                    }
                  />
                  <label htmlFor={elt?._id}>{elt?.name}</label>
                </li>
              ))}
            </ul>
          </div>
          <div id="modal-layout-opacity" onClick={() => setIsOpen(false)}></div>
        </>
      )}
    </div>
  );
}
