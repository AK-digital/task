"use client";
import styles from "@/styles/components/boards/boards.module.css";
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
import { useCallback, useEffect, useState } from "react";
import { updateTaskBoard, updateTaskOrder } from "@/api/task";
import { revalidateBoards } from "@/api/board";
import Task from "../tasks/Task";
import socket from "@/utils/socket";
import { isNotEmpty } from "@/utils/utils";

export default function Boards({ boards, project, archive }) {
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Transformer les résultats en un objet avec les tâches par board
  const initialTasksData = boards
    ?.map((board) => board?.tasks)
    .reduce((acc, tasksArray, index) => {
      if (tasksArray) {
        acc[boards[index]._id] = tasksArray;
      }
      return acc;
    }, {});

  const [tasks, setTasks] = useState(initialTasksData || {});
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const handleBoardUpdate = async () => {
      await revalidateBoards();
    };

    socket.on("task updated", handleBoardUpdate);
    socket.on("update task", handleBoardUpdate);

    return () => {
      socket.off("task updated", handleBoardUpdate);
      socket.off("update task", handleBoardUpdate);
    };
  }, []);

  useEffect(() => {
    if (initialTasksData) {
      setTasks(initialTasksData);
    }
  }, [boards]);

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
        boardTasks?.some((task) => task._id === taskId)
      )?.[0];
    },
    [tasks]
  );

  function handleDragStart(event) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  const handleDragOver = useCallback(
    (event) => {
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
          (task) => task._id === activeTaskId
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
          (task) => task._id === overTaskId
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
    [findBoardByTaskId]
  );

  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;
      if (!over) return;

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
            (task) => task._id === activeTaskId
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
            over.data?.current?.sortable?.index ?? overBoard.length;

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
            (task) => task._id === activeTaskId
          );
          const newIndex = activeBoard.findIndex(
            (task) => task._id === overTaskId
          );

          newTasks = {
            ...prev,
            [activeBoardId]: arrayMove(activeBoard, oldIndex, newIndex),
          };

          return newTasks;
        });
      }

      setActiveId(null);

      // Appel API pour mettre à jour boardId
      await updateTaskBoard(activeTaskId, overBoardId, project?._id);
      if (newTasks) {
        const updatedTasks = Object.values(newTasks)
          .flat()
          .map((task, index) => ({ _id: task._id, order: index }));

        await updateTaskOrder(updatedTasks, project._id);
      }

      socket.emit("update task", project?._id);
    },
    [findBoardByTaskId, project]
  );

  return (
    <div className={styles["boards"]}>
      {archive && (
        <>
          <div className={styles.archiveTitle}>
            <span>Archives du projet</span>
          </div>

          {Object.values(tasks).flat().length === 0 && (
            <div>
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
        {boards?.map((board) => {
          if (archive && tasks[board._id]?.length === 0) {
            return null;
          }
          return (
            <div key={board._id} data-board-id={board._id}>
              <SortableContext
                id={board._id}
                items={tasks[board._id]?.map((task) => task._id) || []}
                strategy={verticalListSortingStrategy}
              >
                <Board
                  tasks={tasks[board._id] || []}
                  project={project}
                  board={board}
                  activeId={activeId}
                  selectedTasks={selectedTasks}
                  setSelectedTasks={setSelectedTasks}
                  archive={archive}
                />
              </SortableContext>
            </div>
          );
        })}
        <DragOverlay>
          {activeId ? (
            <Task
              id={activeId}
              task={Object.values(tasks)
                .flat()
                .find((task) => task._id === activeId)}
              project={project}
              archive={archive}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
