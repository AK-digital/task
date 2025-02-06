"use client";
import styles from "@/styles/components/boards/boards.module.css";
import Board from "./Board";
import { getTasks } from "@/api/task";
import useSWR from "swr";

export default function Boards({ boards, project }) {
  return (
    <div className={styles["boards"]}>
      {/* Si boards est un tableau, on itère dessus correctement */}
      {boards?.map((board) => {
        const { data, error } = useSWR(
          `task?projectId=${project?._id}&boardId=${board?._id}`,
          () => getTasks(project?._id, board?._id)
        );

        // Gestion de l'erreur ou du chargement
        if (error) return <div key={board?._id}>Error loading tasks</div>;
        if (!data) return <div key={board?._id}>Loading...</div>;

        return (
          <Board
            tasks={data}
            project={project}
            board={board}
            key={`${project?._id}-${board?._id}`} // Clé unique sur chaque board
          />
        );
      })}
    </div>
  );
}
