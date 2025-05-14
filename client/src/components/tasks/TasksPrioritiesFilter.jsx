import styles from "@/styles/components/tasks/tasks-priorities-filter.module.css";
import { ChevronDown, Star, Undo } from "lucide-react";
import { useState } from "react";

const prioritiesEnum = ["Basse", "Moyenne", "Haute", "Urgent"];

export default function TasksPrioritiesFilter({ queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);
  const priorities = queries?.priorities;
  const hasPriorities = priorities?.length > 0;

  function handleResetPriorities() {
    setQueries((prev) => ({
      ...prev,
      priorities: null,
    }));
    setIsOpen(false);
  }

  function handlePrioritiesChange(e) {
    const { value, checked } = e.target;
    if (checked) {
      setQueries((prev) => ({
        ...prev,
        priorities: prev?.priorities ? [...prev.priorities, value] : [value],
      }));
    } else {
      const deletedPriorities = queries?.priorities?.filter(
        (priority) => priority !== value
      );
      setQueries((prev) => ({
        ...prev,
        priorities: deletedPriorities,
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
        <Star size={16} />
        <span>Priorité</span>
        {priorities?.length > 0 && (
          <span className={styles.length}>{priorities?.length}</span>
        )}
        <ChevronDown size={16} />
      </div>
      {isOpen && (
        <>
          <div className={styles.dropdown}>
            <ul>
              <li className={styles.priority} onClick={handleResetPriorities}>
                <Undo size={14} />
                <span>Effacer</span>
              </li>
              {prioritiesEnum.map((priority, idx) => (
                <li key={idx} className={styles.priority}>
                  <input
                    type="checkbox"
                    id={priority}
                    name={priority}
                    value={priority}
                    onChange={handlePrioritiesChange}
                    checked={
                      hasPriorities ? priorities?.includes(priority) : false
                    }
                  />
                  <label htmlFor={priority}>{priority}</label>
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
