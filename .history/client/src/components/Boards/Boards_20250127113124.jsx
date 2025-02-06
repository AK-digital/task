"use server";
import styles from "@/styles/components/boards/boards.module.css";
import Board from "./Board";
import { getTasks } from "@/api/task";
import useSWR from "swr";

export default async function Boards({ boards, project }) {
  return (
    <div className={styles["boards"]}>
      {boards?.map(async (board) => {
        const getTasksWithIds = await project?._id, board?._id;
        const { data, mutate } = useSWR(
          `task?projectId=${project?._id}&boardId=${board?._id}`
        );
        const tasks = await getTasks(project?._id, board?._id);
        return (
          <Board
            tasks={tasks}
            project={project}
            board={board}
            key={board?._id}
          />
        );
      })}
    </div>
  );
}
