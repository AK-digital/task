"use client";
import styles from "@/styles/components/boards/boards.module.css";
import Board from "./Board";
import { getTasks } from "@/api/task";
import useSWR from "swr";

export default function Boards({ boards, project }) {
  return (
    <div className={styles["boards"]}>
      {boards?.map((board) => {
        // Utilisation correcte de useSWR
        const { data, error } = useSWR(
          `task?projectId=${project?._id}&boardId=${board?._id}`,
          () => getTasks(project?._id, board?._id) // fetcher ici avec une fonction qui appelle getTasks
        );

        // Gestion de l'erreur ou du chargement
        if (error) return <div>Error loading tasks</div>;
        if (!data) return <div>Loading...</div>;

        // Assurez-vous que la clé est unique, par exemple, en combinant project._id et board._id
        return (
          <Board
            tasks={data}
            project={project}
            board={board}
            key={`${project?._id}-${board?._id}`} // Clé unique combinée
          />
        );
      })}
    </div>
  );
}
