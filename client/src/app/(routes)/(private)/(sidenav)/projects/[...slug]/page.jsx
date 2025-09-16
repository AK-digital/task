"use server";

import { getProject } from "@/api/project";
import { getBoards } from "@/api/board";
import { notFound } from "next/navigation";
import Project from "@/components/Projects/Project";
import { getTasks } from "@/api/task";
import ProjectOptions from "@/components/Projects/ProjectOptions";
import { getStatusByProject } from "@/api/status";
import { ProjectProvider } from "@/context/ProjectContext";
import { getPriorityByProject } from "@/api/priority";

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  
  
  const id = slug?.[0];
  
  // Validation précoce de l'ID
  if (!id || id === 'undefined' || id === 'null' || String(id).trim() === '') {
    console.error("ID de projet manquant:", { slug, id, slugLength: slug?.length });
    return notFound();
  }

  const archive = slug?.length > 1 && slug[1] === "archive";
  const options = slug?.length > 1 && slug[1] === "options";
  const timeTracking = slug?.length > 1 && slug[1] === "time-tracking";

  // Nettoyer l'ID en supprimant les virgules, espaces et caractères non-alphanumériques
  let cleanId = String(id);
  
  // Supprimer spécifiquement les virgules qui peuvent venir du formatage des nombres
  cleanId = cleanId.replace(/,/g, '');
  
  // Supprimer tous les caractères non-alphanumériques sauf les chiffres et lettres
  cleanId = cleanId.replace(/[^a-zA-Z0-9]/g, '');
  
  // Validation supplémentaire : s'assurer que l'ID est valide (MongoDB ObjectId = 24 caractères hex, mais on accepte 7+ pour être flexible)
  if (!cleanId || cleanId.length < 7) {
    console.error("ID de projet invalide:", { originalId: id, cleanId, length: cleanId?.length });
    return notFound();
  }
  
  const projectData = getProject(cleanId);
  const boardsData = getBoards(cleanId, archive);
  const tasksData = getTasks({ projectId: cleanId, archived: archive });
  
  // Gérer les statuts et priorités avec fallback en cas d'erreur
  const statusesPromise = cleanId ? getStatusByProject(cleanId).catch(error => {
    console.error("Erreur lors de la récupération des statuts:", error);
    return []; // Fallback vers un tableau vide
  }) : Promise.resolve([]);
  
  const prioritiesPromise = cleanId ? getPriorityByProject(cleanId).catch(error => {
    console.error("Erreur lors de la récupération des priorités:", error);
    return []; // Fallback vers un tableau vide
  }) : Promise.resolve([]);

  const [initialProject, initialBoards, initialTasks, statusesData, prioritiesData] = await Promise.all([
    projectData,
    boardsData,
    tasksData,
    statusesPromise,
    prioritiesPromise,
  ]);

  if (!initialProject) return notFound(); // 404

  const defaultQueries = {
    projectId: initialProject?._id,
    archived: archive,
  };

  return (
    <ProjectProvider
      initialProject={initialProject}
      initialBoards={initialBoards}
      initialTasks={initialTasks}
      initialStatuses={statusesData}
      initialPriorities={prioritiesData}
      archive={archive}
      defaultQueries={defaultQueries}
    >
      <main className="w-full ml-6 min-w-0 max-h-[calc(100svh-64px)]">
        {!options && !timeTracking && <Project />}
        {options && <ProjectOptions project={initialProject} />}
        {timeTracking && <div>Time Tracking - À implémenter</div>}
      </main>
    </ProjectProvider>
  );
}
