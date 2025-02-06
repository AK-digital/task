import { useState } from "react";
import styles from "@/styles/components/tasks/task-dropdown.module.css";

export default function TaskDropdown({ current, values, type, form }) {
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdateTask(e) {
    e.preventDefault();
    const value = e.target.dataset.value; // Récupère la valeur sélectionnée

    // Remplace la valeur du champ caché dans le formulaire avec la valeur choisie
    const input = form.current.querySelector(`[name=${value}]`);
    if (input) {
      input.value = value; // Met à jour la valeur du champ caché
    }

    // Soumet le formulaire
    form.current.requestSubmit();

    // Ferme le dropdown
    setIsOpen(false);
  }

  return (
    <div className={styles["dropdown"]}>
      <div
        className={styles["dropdown-current"]}
        data-current={current}
        onClick={(e) => setIsOpen(!isOpen)}
      >
        <span>{current}</span>
      </div>
      {isOpen && (
        <div className={styles["dropdown-list"]}>
          <ul>
            {values.map((value, idx) => {
              return (
                <li key={idx} data-value={value} onClick={handleUpdateTask}>
                  {type === "status" && (
                    <input type="text" name={value} id={value} hidden />
                  )}
                  {type === "priority" && (
                    <input type="text" name="priority" id="priority" hidden />
                  )}
                  {value}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
