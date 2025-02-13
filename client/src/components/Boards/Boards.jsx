import { getTasks } from "@/api/task";
import ClientBoards from "./ClientBoards";

// Composant serveur qui récupère les données
export default async function Boards({ boards, project }) {
  // Récupérer toutes les tâches pour chaque board en parallèle
  const tasksPromises = boards.map((board) => getTasks(project._id, board._id));

  const results = await Promise.all(tasksPromises);

  // Transformer les résultats en un objet avec les tâches par board
  const initialTasks = results.reduce((acc, result, index) => {
    if (result?.success) {
      acc[boards[index]._id] = result.data;
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
