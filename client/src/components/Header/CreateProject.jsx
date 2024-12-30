import styles from "@/styles/components/header/create-project.module.css";
import { instrumentSans } from "@/utils/font";

export default function CreateProject() {
  return (
    <div className={styles["create-project"]}>
      <button
        className={`${styles["create-project__button"]} ${instrumentSans.className}`}
      >
        Créer un projet
      </button>
    </div>
  );
}
