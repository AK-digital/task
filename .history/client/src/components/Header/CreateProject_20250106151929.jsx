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
      >
        Créer un projet
      </button>
      {isCreating && <div></div>}
    </div>
  );
}
