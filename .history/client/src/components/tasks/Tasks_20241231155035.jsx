"use client";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function Tasks({ tasks }) {
  const [isWritting, setIsWritting] = useState(false);
  return (
    <div className={styles["tasks"]}>
      <ul className={styles["tasks__list"]}>
        {tasks?.map((task) => {
          return <Task task={task} key={task?._id} />;
        })}
        <li>
          <FontAwesomeIcon icon={faPlus} />
          <form action="">
            <input
              type="text"
              name="new-task"
              id="new-task"
              placeholder="Nouvelle tâche"
              onChange={(e) => {
                if (e.target.value.length > 0) {
                  setIsWritting(true);
                } else {
                  setIsWritting(false);
                }
              }}
            />
          </form>
        </li>
      </ul>
      {isWritting && (
        <div>
          <p>Appuyer sur entrée pour ajouter une tâche</p>
        </div>
      )}
    </div>
  );
}
