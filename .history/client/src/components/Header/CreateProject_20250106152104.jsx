"use client";
import styles from "@/styles/components/header/create-project.module.css";
import { instrumentSans } from "@/utils/font";
import { useState } from "react";

export default function CreateProject() {
  const [isCreating, setIsCreating] = useState(false);
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
          </form>
        </div>
      )}
    </div>
  );
}
