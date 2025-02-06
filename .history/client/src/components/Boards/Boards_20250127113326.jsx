"use client";
import styles from "@/styles/components/boards/boards.module.css";
import Board from "./Board";
import { getTasks } from "@/api/task";
import useSWR from "swr";

export default function Boards({ boards, project }) {
  console.log("uau");
  return (
    <div className={styles["boards"]}>
      {boards?.map(async (board) => {
        const getTasksWithIds = await getTasks(project?._id, board?._id);
        const { data, mutate } = useSWR(
          `task?projectId=${project?._id}&boardId=${board?._id}`,
          getTasksWithIds
        );

        console.log(data);

        return (
          <Board
            tasks={data}
            project={project}
            board={board}
            key={board?._id}
          />
        );
      })}
    </div>
  );
}
