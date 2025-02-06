"use client";
import { saveProject } from "@/actions/project";
import styles from "@/styles/components/projects/create-project.module.css";
import { instrumentSans } from "@/utils/font";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useActionState, useEffect, useState } from "react";

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

  useEffect(() => {
    if (state?.status === "success") {
      setIsCreating(false);
    }
  }, [state]);

  return (
    <div className={styles["create-project"]}>
      <button
        className={`${styles["create-project__button"]} ${instrumentSans.className}`}
        onClick={(e) => setIsCreating(true)}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      {isCreating && (
        <div className={styles["create-project__form"]} id="modal">
          <form action={formAction}>
            <div>
              <input type="text" name="project-name" id="project-name" />
            </div>
            <div className={styles["create-project__buttons"]}>
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
