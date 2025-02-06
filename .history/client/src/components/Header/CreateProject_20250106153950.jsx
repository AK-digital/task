"use client";
import { saveProject } from "@/actions/project";
import styles from "@/styles/components/header/create-project.module.css";
import { instrumentSans } from "@/utils/font";
import { useActionState, useState } from "react";

const initialState = {
  status: "pending",
  message: "",
  payload: null,
  errors: null,
};

export default function CreateProject() {
  const [isCreating, setIsCreating] = useState(false);
  const [state, formAction, pending] = useActionState(
    saveProject,
    initialState
  );

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
              <button data-disabled={pending} disabled={pending}>
                Créer
              </button>
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
