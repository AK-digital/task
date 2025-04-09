"use client";
import { updateBoard } from "@/actions/board";
import styles from "@/styles/components/boards/BoardHeader.module.css";
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronRight,
  EllipsisVertical,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import socket from "@/utils/socket";
import { isNotEmpty } from "@/utils/utils";
import { useUserRole } from "@/app/hooks/useUserRole";
import { MoreMenu } from "../Dropdown/MoreMenu";
import {
  addBoardToArchive,
  deleteBoard,
  removeBoardFromArchive,
} from "@/api/board";
import { mutate } from "swr";
import AddBoardTemplate from "../Templates/AddBoardTemplate";

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
  const [addBoardTemplate, setAddBoardTemplate] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [openColors, setOpenColors] = useState(false);
  const [title, setTitle] = useState(board?.title);
  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);
  const canArchive = useUserRole(project, ["owner", "manager", "team"]);
  const isOwnerOrManager = useUserRole(project, ["owner", "manager"]);

  async function handleAddBoardTemplate(e) {
    e.preventDefault();

    setIsMoreOpen(false);
    setAddBoardTemplate((prev) => !prev);
  }

  async function handleAddArchive(e) {
    e.preventDefault();
    await addBoardToArchive(board?._id, project?._id);

    await mutate(`/boards?projectId=${project?._id}&archived=${archive}`);
  }

  async function handleRestoreArchive(e) {
    e.preventDefault();
    await removeBoardFromArchive(board?._id, project?._id);
  }

  async function handleDeleteBoard(e) {
    e.preventDefault();

    const isConfirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le tableau "${board?.title}" ?`
    );

    if (!isConfirmed) return;

    const response = await deleteBoard(board?._id, project?._id);

    if (!response?.success) return;

    await mutate(`/boards?projectId=${project?._id}&archived=${archive}`);
  }

  const options = [
    {
      authorized: isOwnerOrManager,
      function: handleAddBoardTemplate,
      icon: <Save size={16} />,
      name: "Enregistrer le tableau comme modèle",
    },
    {
      authorized: isOwnerOrManager,
      function: handleDeleteBoard,
      icon: <Trash2 size={16} />,
      name: "Supprimer le tableau",
      remove: true,
    },
  ];

  if (!archive) {
    options.splice(1, 0, {
      authorized: canArchive,
      function: handleAddArchive,
      icon: <Archive size={16} />,
      name: "Archiver le tableau",
    });
  } else {
    options.splice(1, 0, {
      authorized: canArchive,
      function: handleRestoreArchive,
      icon: <ArchiveRestore size={16} />,
      name: "Restaurer le tableau",
    });
  }

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
        {canArchive && (
          <div className={styles.actionMore}>
            <EllipsisVertical size={18} onClick={(e) => setIsMoreOpen(true)} />
            {isMoreOpen && (
              <MoreMenu
                isOpen={isMoreOpen}
                setIsOpen={setIsMoreOpen}
                options={options}
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
      {addBoardTemplate && (
        <AddBoardTemplate
          project={project}
          board={board}
          setAddTemplate={setAddBoardTemplate}
        />
      )}
    </div>
  );
}
