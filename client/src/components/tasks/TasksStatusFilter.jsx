import styles from "@/styles/components/tasks/tasks-status-filter.module.css";
import { allowedStatus } from "@/utils/utils";
import { ChartBar, ChevronDown, Undo } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TasksStatusFilter({ queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);
  const status = queries?.status;
  const hasStatus = status?.length > 0;
  const pathname = usePathname();

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

  // If we are on tasks page we want the 'En cours' and 'À faire' status to be checked by default
  useEffect(() => {
    if (pathname === "/tasks") {
      setQueries((prev) => ({
        ...prev,
        status: ["En cours", "À faire"],
      }));
    }
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={styles.current}
        onClick={() => setIsOpen(!isOpen)}
        data-open={isOpen}
      >
        <ChartBar size={16} />
        <span>Status</span>
        {status?.length > 0 && (
          <span className={styles.length}>{status?.length}</span>
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
              {allowedStatus.map((elt, idx) => (
                <li key={idx} className={styles.status}>
                  <input
                    type="checkbox"
                    id={elt}
                    name={elt}
                    value={elt}
                    onChange={handleStatusChange}
                    checked={hasStatus ? status?.includes(elt) : false}
                  />
                  <label htmlFor={elt}>{elt}</label>
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
