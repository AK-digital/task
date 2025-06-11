"use client";
import { updateBoard } from "@/actions/board";
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronRight,
  EllipsisVertical,
  GripVertical,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import socket from "@/utils/socket";
import { isNotEmpty } from "@/utils/utils";
import { useUserRole } from "../../../hooks/useUserRole";
import { MoreMenu } from "../Dropdown/MoreMenu";
import {
  addBoardToArchive,
  deleteBoard,
  removeBoardFromArchive,
} from "@/api/board";
import { mutate } from "swr";
import AddBoardTemplate from "../Templates/AddBoardTemplate";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTaskContext } from "@/context/TaskContext";
import Portal from "../Portal/Portal";

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
  const { openedTask } = useTaskContext();
  const [addBoardTemplate, setAddBoardTemplate] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreButtonRef = useRef(null);
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: board?._id,
    data: {
      type: "board",
      board,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function handleAddBoardTemplate(e) {
    e?.preventDefault();

    setIsMoreOpen(false);
    setAddBoardTemplate((prev) => !prev);
  }

  async function handleAddArchive(e) {
    e?.preventDefault();
    await addBoardToArchive(board?._id, project?._id);

    mutate(`/boards?projectId=${project?._id}&archived=false`);
    socket.emit("archive board", {
      projectId: project?._id,
      action: "archive",
    });
  }

  async function handleRestoreArchive(e) {
    e?.preventDefault();
    await removeBoardFromArchive(board?._id, project?._id);

    mutate(`/task?projectId=${project?._id}&archived=true`);
    socket.emit("archive board", {
      projectId: project?._id,
      action: "restore",
    });
  }

  async function handleDeleteBoard(e) {
    const response = await deleteBoard(board?._id, project?._id);

    if (!response?.success) return;

    socket.emit("update board", board?.projectId);
  }

  const options = [
    {
      authorized: isOwnerOrManager,
      function: handleAddBoardTemplate,
      icon: <Save size={16} />,
      name: "Enregistrer le tableau comme modèle",
    },
    {
      authorized: canArchive,
      function: handleDeleteBoard,
      icon: <Trash2 size={16} />,
      name: "Supprimer le tableau",
      remove: true,
      deletionName: board?.title,
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

    socket.emit("update board", board?.projectId);
  }

  const debouncedUpdateTask = useDebouncedCallback(async (value) => {
    await handleSaveTitle(value);
  }, 600);

  async function handleSaveTitle(value) {
    const response = await updateBoard(
      board?._id,
      board?.projectId,
      optimisticColor,
      value
    );

    if (!response?.success) setTitle(board?.title);

    socket.emit("update board", board?.projectId);
  }

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);

    if (e.key === "Enter") {
      setEdit(false);
    }

    debouncedUpdateTask(value);
  };

  function handleTitleEnterKey(e) {
    if (e.key === "Enter") {
      setEdit(false);
    }
  }

  async function handleOpenCloseBoard() {
    if (window !== undefined) {
      localStorage.setItem(`board-${board?._id}`, !open);
    }
    setOpen(!open);
  }

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
      input.checked = selectedTasks?.includes(input?.value);
    }
  }, [selectedTasks]);

  useEffect(() => {
    setTitle(board?.title);
    setOptimisticColor(board?.color);
  }, [board?.title, board?.color]);

  return (
    <div
      className={`container_BoardHeader sticky top-0 flex items-center justify-between font-medium select-none rounded-2xl bg-secondary w-full flex-wrap p-3 ${openedTask ? "z-1000" : "z-2000"
        }`}
      // className="-translate-x-px" Gérer la petite bordure à gauche manquante sur pc portable ?
      data-open={open}
      data-archive={archive}
      style={{
        borderColor: `${board?.color}`,
        "--board-color": board?.color || "var(--color-color-border-color)",
      }}
    >
      <div className="relative flex items-center gap-1 [&>div]:flex [&>div]:justify-center [&>div]:items-center">
        {/* Display if tasks is not empty and if there is at least 2 task */}
        {isNotEmpty(tasks) && tasks?.length > 1 && canEdit && (
          <div title="Sélectionner toutes les tâches">
            <input type="checkbox" name="board" onClick={handleCheckBoard} />
          </div>
        )}
        {canArchive && (
          <div ref={setNodeRef} style={style} className="text-text-light-color">
            <div {...attributes} {...listeners}>
              <GripVertical
                size={20}
                className="max-w-5 max-h-5 cursor-pointer"
              />
            </div>
          </div>
        )}
        <div>
          {open ? (
            <ChevronDown
              style={{ color: `${optimisticColor}` }}
              onClick={handleOpenCloseBoard}
              size={20}
              className="max-w-5 max-h-5 cursor-pointer"
            />
          ) : (
            <ChevronRight
              style={{ color: `${optimisticColor}` }}
              onClick={handleOpenCloseBoard}
              size={20}
              className="max-w-5 max-h-5 cursor-pointer"
            />
          )}
        </div>
        {edit ? (
          <div>
            <input
              type="text"
              name="title"
              id="title"
              value={title}
              autoFocus
              onBlur={() => setEdit(false)}
              onChange={handleTitleChange}
              onKeyDown={handleTitleEnterKey}
              className="font-bricolage relative z-2001 w-fit p-1 rounded-sm text-medium"
            />
          </div>
        ) : (
          <div onClick={handleEdit}>
            <span
              className="dataTitle border border-transparent rounded-sm text-large font-medium cursor-text"
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
              style={{ backgroundColor: `${optimisticColor}` }}
              onClick={handleEditColors}
              className="block w-4 h-4 rounded-full cursor-pointer"
            ></span>
          </div>
        )}
        {!open && tasks?.length >= 1 && (
          <div>
            <span className="text-text-color-muted text-small font-normal">
              {tasks?.length > 1
                ? `${tasks?.length} Tâches`
                : `${tasks?.length} Tâche`}
            </span>
          </div>
        )}
        {canArchive && (
          <div className="relative text-text-color-muted">
            <EllipsisVertical
              ref={moreButtonRef}
              size={18}
              onClick={(e) => setIsMoreOpen(true)}
            />
            <MoreMenu
              isOpen={isMoreOpen}
              setIsOpen={setIsMoreOpen}
              options={options}
              triggerRef={moreButtonRef}
              className="hover:text-text-color"
            />
          </div>
        )}
      </div>
      {openColors && (
        <>
          <div className="absolute z-2001 rounded-lg left-3 top-10 max-w-[234px] p-4 bg-secondary shadow-medium">
            <ul className="flex flex-wrap gap-2.5">
              {colors?.map((color, idx) => (
                <li
                  key={idx}
                  style={{ backgroundColor: `${color}` }}
                  data-value={color}
                  onClick={handleColor}
                  className="w-[18px] h-[18px] rounded-full cursor-pointer transition-all ease-linear duration-[80ms] hover:scale-110 hover:transition-all hover:ease-linear hover:duration-[80ms]"
                ></li>
              ))}
            </ul>
          </div>
          <div
            className="modal-layout-opacity"
            onClick={(e) => setOpenColors(false)}
          ></div>
        </>
      )}
      {addBoardTemplate && (
        <Portal>
          <AddBoardTemplate
            project={project}
            board={board}
            setAddTemplate={setAddBoardTemplate}
          />
        </Portal>
      )}
    </div>
  );
}
