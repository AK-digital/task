import styles from "@/styles/components/boards/add-board.module.css";
import { useActionState } from "react";

export default function AddBoard() {
  const [state, formAction, pending] = useActionState();
  return (
    <div className={styles["container"]}>
      <form action="" className={styles["container__form"]}>
        <input
          type="text"
          name="title"
          id="title"
          defaultValue="Nouveau tableau"
          hidden
        />
        <button type="submit" className={styles["form__btn"]}>
          Ajouter un tableau
        </button>
      </form>
    </div>
  );
}
