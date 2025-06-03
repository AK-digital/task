import { useProjectContext } from "@/context/ProjectContext";
import styles from "@/styles/components/tasks/tasks-priorities-filter.module.css";
import { ChevronDown, Star, Undo } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function TasksPrioritiesFilter({ queries, setQueries }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const queriesPriorities = queries?.priorities;
  const hasPriorities = queriesPriorities?.length > 0;

  const { priorities } = useProjectContext();

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
        <span>{t("tasks.priority")}</span>
        {hasPriorities && (
          <span className={styles.length}>{queriesPriorities?.length}</span>
        )}
        <ChevronDown size={16} />
      </div>
      {isOpen && (
        <>
          <div className={styles.dropdown}>
            <ul>
              <li className={styles.priority} onClick={handleResetPriorities}>
                <Undo size={14} />
                <span>{t("tasks.clear")}</span>
              </li>
              {priorities.map((priority) => (
                <li key={priority?._id} className={styles.priority}>
                  <input
                    type="checkbox"
                    id={priority?._id}
                    name={priority?.name}
                    value={priority?._id}
                    onChange={handlePrioritiesChange}
                    checked={
                      hasPriorities
                        ? queriesPriorities?.includes(priority?._id)
                        : false
                    }
                  />
                  <label htmlFor={priority?._id}>{priority?.name}</label>
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
