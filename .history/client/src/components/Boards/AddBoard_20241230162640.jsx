export default function AddBoard() {
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
        <button type="submit" className={styles["form__btn,"]}>
          Ajouter un tableau
        </button>
      </form>
    </div>
  );
}
