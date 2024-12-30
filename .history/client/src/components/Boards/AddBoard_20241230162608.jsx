export default function AddBoard() {
  return (
    <div className={styles["container"]}>
      <form action="" className={styles["project__form"]}>
        <input
          type="text"
          name="title"
          id="title"
          defaultValue="Nouveau tableau"
          hidden
        />
        <button type="submit">Ajouter un tableau</button>
      </form>
    </div>
  );
}
