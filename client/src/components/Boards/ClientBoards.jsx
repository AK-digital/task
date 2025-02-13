"use client";
import styles from "@/styles/components/boards/boards.module.css";
import Board from "./Board";
import {
  DndContext,
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
import { act, useCallback, useEffect, useState } from "react";
import { updateTaskBoard, updateTaskOrder } from "@/api/task";

export default function ClientBoards({ boards, project, initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (initialTasks) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

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

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragOver = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over) return;

      const activeTaskId = active.id;
      const overTaskId = over.id;

      const activeBoardId = findBoardByTaskId(activeTaskId);
      const overBoardId =
        over.data?.current?.sortable?.containerId ||
        findBoardByTaskId(overTaskId);

      if (!activeBoardId || !overBoardId || activeBoardId === overBoardId)
        return;

      setTasks((prev) => {
        const activeBoard = [...prev[activeBoardId]];
        const overBoard = [...prev[overBoardId]];

        const activeTaskIndex = activeBoard.findIndex(
          (task) => task._id === activeTaskId
        );
        const activeTask = activeBoard[activeTaskIndex];

        const newActiveBoard = activeBoard.filter(
          (_, index) => index !== activeTaskIndex
        );
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
        findBoardByTaskId(overTaskId);

      let newTasks;

      console.log(activeBoardId, overBoardId);

      if (activeBoardId !== overBoardId) {
        // Déplacement vers un autre board
        setTasks((prev) => {
          const activeBoard = [...prev[activeBoardId]];
          const overBoard = [...prev[overBoardId]];

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

        // Appel API pour mettre à jour boardId
        console.log(activeTaskId, overBoardId, project?._id);
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
      await updateTaskBoard(activeTaskId, overBoardId, project?._id);
      if (newTasks) {
        const updatedTasks = Object.values(newTasks)
          .flat()
          .map((task, index) => ({ _id: task._id, order: index }));

        await updateTaskOrder(updatedTasks, project._id);
      }
    },
    [findBoardByTaskId]
  );

  return (
    <div className={styles["boards"]}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        {boards?.map((board) => (
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
              />
            </SortableContext>
          </div>
        ))}
      </DndContext>
    </div>
  );
}
