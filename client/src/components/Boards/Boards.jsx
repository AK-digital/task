"use client";
import Board from "./Board";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { updateTaskBoard, updateTaskOrder } from "@/api/task";
import socket from "@/utils/socket";
import AddBoard from "@/components/Boards/AddBoard";
import { mutate } from "swr";
import { ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserRole } from "../../../hooks/useUserRole";
import { SortableBoard } from "./SortableBoard"; // Nous allons créer ce composant
import { updateBoardOrder } from "@/api/board"; // Vous devrez créer cette fonction API
import Task from "../Task/Task";
import { useProjectContext } from "@/context/ProjectContext";

const displayedElts = {
  isCheckbox: true,
  isDrag: true,
  isProject: false,
  isBoard: false,
  isAdmin: true,
  isStatus: true,
  isPriority: true,
  isDeadline: true,
  isEstimate: true,
  isTimer: true,
};

export default function Boards({ boards: initialBoards, tasksData }) {
  const { project, mutateTasks, archive } = useProjectContext();
  const router = useRouter();
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [boards, setBoards] = useState(initialBoards || []);

  // Transformer les résultats en un objet avec les tâches par board
  const initialTasksData = useMemo(() => {
    if (!tasksData || !Array.isArray(tasksData)) {
      return {};
    }
    return tasksData.reduce((acc, task) => {
      const boardId = task.boardId?._id.toString();
      if (!acc[boardId]) acc[boardId] = [];
      acc[boardId].push(task);
      return acc;
    }, {});
  }, [tasksData]);

  const [tasks, setTasks] = useState(initialTasksData || {});
  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null); // 'task' ou 'board'

  // Mettre à jour l'état local quand les données tasksData changent
  useEffect(() => {
    if (tasksData && Array.isArray(tasksData) && tasksData.length > 0) {
      // Mettre à jour l'état local avec les données provenant de SWR
      const updatedTasksByBoard = tasksData.reduce((acc, task) => {
        const boardId = task.boardId.toString();
        if (!acc[boardId]) acc[boardId] = [];
        acc[boardId].push(task);
        return acc;
      }, {});

      setTasks(updatedTasksByBoard);
    }
  }, [tasksData]);

  // Mettre à jour l'état local quand initialBoards change
  useEffect(() => {
    if (initialBoards) {
      setBoards(initialBoards);
    }
  }, [initialBoards]);

  useEffect(() => {
    const handleTaskUpdate = async () => {
      mutateTasks();
    };

    const handleBoardUpdate = async () => {
      mutate(`/boards?projectId=${project?._id}&archived=${archive}`);
    };

    const handleTemplateUpdate = async () => {
      mutate(`/board-template`);
    };

    socket.on("task updated", handleTaskUpdate);
    socket.on("board updated", handleBoardUpdate);
    socket.on("board templates updated", handleTemplateUpdate);

    return () => {
      socket.off("task updated", handleTaskUpdate);
      socket.off("board updated", handleBoardUpdate);
      socket.off("board templates updated", handleTemplateUpdate);
    };
  }, [mutateTasks, mutate, project?._id, archive]);

  useEffect(() => {
    if (initialTasksData) {
      setTasks(initialTasksData);
    }
  }, [initialTasksData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findBoardByTaskId = useCallback(
    (taskId) => {
      return Object.entries(tasks).find(([_, boardTasks]) =>
        boardTasks?.some((task) => task?._id === taskId)
      )?.[0];
    },
    [tasks]
  );

  function handleDragStart(event) {
    const { active } = event;
    const { id } = active;

    // Déterminer si on déplace une tâche ou un board
    const isBoard = boards.some((board) => board._id === id);

    setActiveId(id);
    setActiveType(isBoard ? "board" : "task");
  }

  const handleDragOver = useCallback(
    (event) => {
      // Si c'est un board qui est déplacé, on ne fait rien ici
      if (activeType === "board") return;

      const { active, over } = event;
      if (!over) return;

      const activeTaskId = active.id;
      const overTaskId = over.id;

      const activeBoardId = findBoardByTaskId(activeTaskId);
      const overBoardId =
        over.data?.current?.sortable?.containerId ||
        findBoardByTaskId(overTaskId) ||
        over.id; // Ajout de over.id pour gérer le cas du tableau vide

      if (!activeBoardId || !overBoardId || activeBoardId === overBoardId)
        return;

      setTasks((prev) => {
        const activeBoard = [...prev[activeBoardId]];
        const overBoard = [...(prev[overBoardId] || [])]; // S'assurer que overBoard est un tableau même s'il est vide

        const activeTaskIndex = activeBoard.findIndex(
          (task) => task?._id === activeTaskId
        );
        const activeTask = activeBoard[activeTaskIndex];

        const newActiveBoard = activeBoard.filter(
          (_, index) => index !== activeTaskIndex
        );

        // Si on dépose sur un tableau vide, on ajoute simplement la tâche à la fin
        if (!overTaskId || overTaskId === overBoardId) {
          return {
            ...prev,
            [activeBoardId]: newActiveBoard,
            [overBoardId]: [...overBoard, activeTask],
          };
        }

        // Sinon on insère à la position spécifique
        const insertIndex = overBoard.findIndex(
          (task) => task?._id === overTaskId
        );

        const newOverBoard = [...overBoard];
        if (insertIndex === -1) {
          newOverBoard.push(activeTask);
        } else {
          newOverBoard.splice(insertIndex, 0, activeTask);
        }

        return {
          ...prev,
          [activeBoardId]: newActiveBoard,
          [overBoardId]: newOverBoard,
        };
      });
    },
    [findBoardByTaskId, activeType]
  );

  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;
      if (!over) return;

      // Si c'est un board qui est déplacé
      if (activeType === "board") {
        const oldIndex = boards.findIndex((board) => board._id === active.id);
        const newIndex = boards.findIndex((board) => board._id === over.id);

        if (oldIndex !== newIndex) {
          // Mettre à jour l'ordre des boards localement
          const newBoards = arrayMove(boards, oldIndex, newIndex);
          setBoards(newBoards);

          // Mettre à jour l'ordre des boards côté serveur
          const updatedBoards = newBoards.map((board, index) => ({
            _id: board._id,
            order: index,
          }));

          await updateBoardOrder(updatedBoards, project?._id);

          socket.emit("update board", project?._id);

          // Rafraîchir les données
          mutate(`/board?projectId=${project?._id}&archived=${archive}`);
        }
      } else {
        // Logique existante pour les tâches
        const activeTaskId = active.id;
        const overTaskId = over.id;

        const activeBoardId = findBoardByTaskId(activeTaskId);
        const overBoardId =
          over.data?.current?.sortable?.containerId ||
          findBoardByTaskId(overTaskId) ||
          over.id; // Ajout de over.id comme fallback

        let newTasks;

        if (activeBoardId !== overBoardId) {
          // Déplacement vers un autre board
          setTasks((prev) => {
            const activeBoard = [...prev[activeBoardId]];
            const overBoard = [...(prev[overBoardId] || [])]; // Protection pour les tableaux vides

            const activeTaskIndex = activeBoard.findIndex(
              (task) => task?._id === activeTaskId
            );
            const activeTask = {
              ...activeBoard[activeTaskIndex],
              boardId: overBoardId,
            };

            const newActiveBoard = activeBoard.filter(
              (_, index) => index !== activeTaskIndex
            );

            // Si on dépose sur un tableau vide, on ajoute à la fin
            if (!overTaskId || overTaskId === overBoardId) {
              newTasks = {
                ...prev,
                [activeBoardId]: newActiveBoard,
                [overBoardId]: [...overBoard, activeTask],
              };
              return newTasks;
            }

            const insertIndex =
              over.data?.current?.sortable?.index ?? overBoard?.length;

            const newOverBoard = [...overBoard];
            newOverBoard.splice(insertIndex, 0, activeTask);

            newTasks = {
              ...prev,
              [activeBoardId]: newActiveBoard,
              [overBoardId]: newOverBoard,
            };

            return newTasks;
          });
        } else {
          // Réorganisation dans la même board
          setTasks((prev) => {
            const activeBoard = [...prev[activeBoardId]];
            const oldIndex = activeBoard.findIndex(
              (task) => task?._id === activeTaskId
            );
            const newIndex = activeBoard.findIndex(
              (task) => task?._id === overTaskId
            );

            newTasks = {
              ...prev,
              [activeBoardId]: arrayMove(activeBoard, oldIndex, newIndex),
            };

            return newTasks;
          });
        }

        // Appel API pour mettre à jour boardId
        await updateTaskBoard(activeTaskId, overBoardId, project?._id);
        if (newTasks) {
          const updatedTasks = Object.values(newTasks)
            .flat()
            .map((task, index) => ({ _id: task?._id, order: index }));

          await updateTaskOrder(updatedTasks, project?._id);
        }

        mutate(`/task?projectId=${project?._id}&archived=${archive}`);

        socket.emit("update task", project?._id);
      }

      // Réinitialiser l'état actif
      setActiveId(null);
      setActiveType(null);
    },
    [findBoardByTaskId, project, boards, activeType, archive]
  );

  const canPost = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  // Calculer les IDs des boards pour SortableContext
  const boardIds = useMemo(() => boards.map((board) => board._id), [boards]);

  return (
    <div className="boards_Boards relative flex flex-col gap-11 h-full overflow-y-auto pr-2.5 pb-6 z-1000 border-r-[3px] border-transparent rounded-2xl">
      {archive && (
        <>
          <div className="flex items-center gap-2 font-semibold text-large -mb-5 select-none">
            <div
              className="relative top-[3px] cursor-pointer"
              onClick={() => router.push(`/projects/${project?._id}`)}
            >
              <ArrowLeftCircle size={32} />
            </div>
            <span>Archives du projet</span>
          </div>

          {Object.values(tasks).flat()?.length === 0 && (
            <div className="select-none">
              <p>Aucune archive disponible actuellement</p>
            </div>
          )}
        </>
      )}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="flex flex-col gap-11 w-full">
          {boards
            ?.filter((board) =>
              archive
                ? tasks[board?._id] && tasks[board?._id]?.length > 0
                : true
            )
            ?.map((board) => {
              return (
                <SortableBoard
                  key={board?._id}
                  board={board}
                  data-board-id={board?._id}
                >
                  {/* Contexte pour les tâches à l'intérieur du board */}
                  <SortableContext
                    id={board?._id}
                    items={tasks[board._id]?.map((task) => task?._id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    <Board
                      tasks={tasks[board._id] || []}
                      displayedElts={displayedElts}
                      board={board}
                      activeId={activeId}
                      selectedTasks={selectedTasks}
                      setSelectedTasks={setSelectedTasks}
                    />
                  </SortableContext>
                </SortableBoard>
              );
            })}
        </div>
        <DragOverlay style={{ zIndex: 50000 }}>
          {activeId && activeType === "task" ? (
            <Task
              id={activeId}
              task={Object.values(tasks)
                .flat()
                .find((task) => task?._id === activeId)}
              project={project}
              displayedElts={displayedElts}
              archive={archive}
            />
          ) : activeId && activeType === "board" ? (
            <div className="relative translate-z-0 will-change-transform z-50000">
              <Board
                tasks={tasks[activeId] || []}
                board={boards.find((board) => board._id === activeId)}
                project={project}
                archive={archive}
                isOverlay={true}
                displayedElts={displayedElts}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {!archive && canPost && (
        <div>
          <AddBoard project={project} />
        </div>
      )}
    </div>
  );
}
