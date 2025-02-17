"use client";
import { useEffect } from "react";
import ClientBoards from "./ClientBoards";
import socket from "@/utils/socket";
import { revalidateBoards } from "@/api/board";

// Composant serveur qui récupère les données
export default function Boards({ boards, project }) {
  // Récupérer toutes les tâches pour chaque board en parallèle

  const tasks = boards?.map((board) => board?.tasks);

  useEffect(() => {
    const handleTaskUpdate = async () => {
      await revalidateBoards();
    };

    socket.on("task updated", handleTaskUpdate);

    return () => {
      socket.off("task updated", handleTaskUpdate);
    };
  }, [socket]);

  // Transformer les résultats en un objet avec les tâches par board
  const initialTasks = tasks.reduce((acc, tasksArray, index) => {
    if (tasksArray) {
      acc[boards[index]._id] = tasksArray;
    }

    return acc;
  }, {});

  return (
    <ClientBoards
      boards={boards}
      project={project}
      initialTasks={initialTasks}
    />
  );
}
