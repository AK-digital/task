"use client";
import styles from "@/styles/components/boards/board.module.css";
import Tasks from "../tasks/Tasks";
import { useState, useEffect, useRef, useActionState, useContext } from "react";
import BoardHeader from "./BoardHeader";
import { Plus } from "lucide-react";
import { saveTask } from "@/actions/task";
import socket from "@/utils/socket";
import { mutate } from "swr";
import { AuthContext } from "@/context/auth";
import { checkRole } from "@/utils/utils";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function Board({
  tasks,
  project,
  board,
  activeId,
  selectedTasks,
  setSelectedTasks,
  archive,
}) {
  const { uid } = useContext(AuthContext);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(true);
  const [isWritting, setIsWritting] = useState(false);
  const [optimisticColor, setOptimisticColor] = useState(board?.color);

  // Load the stored value after component mounts
  useEffect(() => {
    const storedValue = localStorage.getItem(`board-${board?._id}`);
    if (storedValue !== null) {
      setOpen(JSON.parse(storedValue));
    }
  }, [board?._id]);

  const saveTaskWithProjectId = saveTask.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    saveTaskWithProjectId,
    initialState
  );

  useEffect(() => {
    if (state?.status === "success") {
      inputRef?.current?.focus();
      setIsWritting(false);
      mutate(`/task?projectId=${project?._id}&archived=${archive}`);

      socket.emit("update task", project?._id);
    }
  }, [state]);

  return (
    <div
      className={styles.container}
      data-board={board?._id}
      style={{ borderLeft: `solid 3px ${board?.color}` }}
    >
      {/* Board header - Utilisation de la classe sticky */}
      <div className={styles.wrapper}>
        <BoardHeader
          board={board}
          open={open}
          setOpen={setOpen}
          tasks={tasks}
          project={project}
          setOptimisticColor={setOptimisticColor}
          optimisticColor={optimisticColor}
          selectedTasks={selectedTasks}
          setSelectedTasks={setSelectedTasks}
          archive={archive}
        />

        {/* Board content */}
        {open && (
          <Tasks
            tasks={tasks}
            project={project}
            boardId={board?._id}
            activeId={activeId}
            optimisticColor={optimisticColor}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
            archive={archive}
          />
        )}
      </div>
      {checkRole(project, ["owner", "manager", "team", "customer"], uid) && (
        <div className={styles.footer}>
          {!archive && (
            <div className={styles.add}>
              <Plus size={18} />
              <form action={formAction}>
                <input
                  type="text"
                  name="board-id"
                  id="board-id"
                  defaultValue={board?._id}
                  hidden
                />
                <input
                  type="text"
                  name="new-task"
                  id="new-task"
                  placeholder=" Ajouter une tâche"
                  autoComplete="off"
                  minLength={2}
                  maxLength={255}
                  ref={inputRef}
                  onChange={(e) => {
                    if (e.target.value.length > 0) {
                      setIsWritting(true);
                    } else {
                      setIsWritting(false);
                    }
                  }}
                />
                <button type="submit" hidden>
                  Ajouter une tâche
                </button>
              </form>
            </div>
          )}
          {isWritting && (
            <div className={styles.info}>
              <p>
                Appuyer sur <span>entrée</span> pour ajouter une tâche
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
