"use client";
import styles from "@/styles/components/header/create-project.module.css";
import { instrumentSans } from "@/utils/font";
import { useActionState, useState } from "react";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function CreateProject() {
  const [isCreating, setIsCreating] = useState(false);
  const [state, formAction, pending] = useActionState();

  return (
    <div className={styles["create-project"]}>
      <button
        className={`${styles["create-project__button"]} ${instrumentSans.className}`}
        onClick={(e) => setIsCreating(true)}
      >
        Créer un projet
      </button>
      {isCreating && (
        <div>
          <form action="">
            <input type="text" name="project-name" id="project-name" />
            <div>
              <button>Créer</button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsCreating(false);
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
