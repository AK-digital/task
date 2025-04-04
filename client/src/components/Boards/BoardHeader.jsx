"use client";
import { updateBoard } from "@/actions/board";
import styles from "@/styles/components/boards/BoardHeader.module.css";
import { ChevronDown, ChevronRight, EllipsisVertical } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import socket from "@/utils/socket";
import { checkRole, isNotEmpty } from "@/utils/utils";
import BoardMore from "./BoardMore";
import { AuthContext } from "@/context/auth";
import { useUserRole } from "@/app/hooks/useUserRole";

export default function BoardHeader({
  board,
  open,
  setOpen,
  tasks,
  setOptimisticColor,
  optimisticColor,
  selectedTasks,
  setSelectedTasks,
  archive,
  project,
}) {
  const [more, setMore] = useState(false);
  const [edit, setEdit] = useState(false);
  const [openColors, setOpenColors] = useState(false);
  const [title, setTitle] = useState(board?.title);
  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  const colors = board?.colors;

  async function handleColor(e) {
    const value = e.target.dataset.value;
    setOptimisticColor(value);

    const response = await updateBoard(
      board?._id,
      board?.projectId,
      value,
      title
    );

    if (!response?.success) setOptimisticColor(board?.color);

    socket.emit("update board", board?._id, board?.projectId);
  }

  const debouncedUpdateTask = useDebouncedCallback(async (value) => {
    const response = await updateBoard(
      board?._id,
      board?.projectId,
      optimisticColor,
      value
    );

    if (!response?.success) setTitle(board?.title);

    socket.emit("update board", board?._id, board?.projectId);
  }, 600);

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    debouncedUpdateTask(value);
  };

  async function handleOpenCloseBoard() {
    if (window !== undefined) {
      localStorage.setItem(`board-${board?._id}`, !open);
    }
    setOpen(!open);
  }

  useEffect(() => {
    function handleBoardUpdate(updatedBoard) {
      if (updatedBoard?._id === board?._id) {
        setTitle(updatedBoard?.title);
        setOptimisticColor(updatedBoard?.color);
      }
    }

    socket.on("board updated", handleBoardUpdate);

    return () => {
      socket.off("board updated", handleBoardUpdate);
    };
  }, [socket]);

  const handleEdit = useCallback(() => {
    if (!canEdit) return;

    setEdit(!edit);
  }, [project]);

  const handleEditColors = useCallback(() => {
    if (!canEdit) return;

    setOpenColors(!openColors);
  }, [project]);

  const handleCheckBoard = (e) => {
    if (e.target.checked) {
      setSelectedTasks((prev) => [...prev, ...tasks?.map((task) => task?._id)]);
    } else {
      setSelectedTasks((prev) => [
        ...prev.filter(
          (taskId) => !tasks?.map((task) => task?._id).includes(taskId)
        ),
      ]);
    }
  };

  useEffect(() => {
    const inputs = document?.getElementsByName("task");

    for (const input of inputs) {
      input.checked = selectedTasks.includes(input.value);
    }
  }, [selectedTasks]);

  return (
    <div
      className={styles.container}
      data-open={open}
      data-archive={archive}
      style={{ "--border-color": `${board?.color}` }}
    >
      <div className={styles.actions}>
        {/* Display if tasks is not empty and if there is at least 2 task */}
        {isNotEmpty(tasks) && tasks?.length > 1 && canEdit && (
          <div
            className={styles.actionCheckbox}
            title="Sélectionner toutes les tâches"
          >
            <input
              type="checkbox"
              name="board"
              className={styles.checkbox}
              onClick={handleCheckBoard}
            />
          </div>
        )}
        <div>
          {open ? (
            <ChevronDown
              style={{ color: `${optimisticColor}` }}
              onClick={handleOpenCloseBoard}
              size={20}
            />
          ) : (
            <ChevronRight
              style={{ color: `${optimisticColor}` }}
              onClick={handleOpenCloseBoard}
              size={20}
            />
          )}
        </div>
        {edit ? (
          <div>
            <input
              type="text"
              name="title"
              id="title"
              defaultValue={title}
              onChange={handleTitleChange}
            />
            <div id="modal-layout-opacity" onClick={handleEdit}></div>
          </div>
        ) : (
          <div onClick={handleEdit}>
            <span
              className={styles.title}
              data-authorized={canEdit}
              style={{ color: `${optimisticColor}` }}
            >
              {title}
            </span>
          </div>
        )}
        {!archive && canEdit && (
          <div>
            <span
              className={styles.bullet}
              style={{ backgroundColor: `${optimisticColor}` }}
              onClick={handleEditColors}
            ></span>
          </div>
        )}
        {!open && tasks?.length >= 1 && (
          <div>
            <span className={styles.count}>
              {tasks?.length > 1
                ? `${tasks?.length} Tâches`
                : `${tasks?.length} Tâche`}
            </span>
          </div>
        )}
        {useUserRole(project, ["owner", "manager", "team"]) && (
          <div className={styles.actionMore}>
            <EllipsisVertical size={18} onClick={(e) => setMore(true)} />
            {more && (
              <BoardMore
                board={board}
                project={project}
                setMore={setMore}
                archive={archive}
              />
            )}
          </div>
        )}
      </div>

      {openColors && (
        <>
          <div className={styles.modal} id="popover">
            <ul>
              {colors?.map((color, idx) => (
                <li
                  key={idx}
                  style={{ backgroundColor: `${color}` }}
                  data-value={color}
                  onClick={handleColor}
                ></li>
              ))}
            </ul>
          </div>
          <div
            id="modal-layout-opacity"
            onClick={(e) => setOpenColors(false)}
          ></div>
        </>
      )}
    </div>
  );
}
