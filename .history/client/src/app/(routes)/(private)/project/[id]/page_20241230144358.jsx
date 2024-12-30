"use server";
import styles from "@/styles/pages/project.module.css";
import { getBoards } from "@/api/board";
import Boards from "@/components/Boards/Boards";

export default async function Project({ params }) {
  const { id } = await params;

  const boards = await getBoards(id);

  console.log(boards);
  return (
    <main className={styles["project"]}>
      <div className={styles["project__boards-container"]}>
        {/* Boards */}
        <div>
          <span>{}</span>
        </div>
        {boards?.length > 0 && <Boards boards={boards} />}
      </div>
    </main>
  );
}
