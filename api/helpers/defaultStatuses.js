export function getDefaultStatuses(projectId) {
  const defaultStatuses = [
    {
      projectId: projectId,
      name: "À faire",
      color: "#559fc6", // Blue
    },
    {
      projectId: projectId,
      name: "En cours",
      color: "#f3b158", // Yellow/Orange
    },
    {
      projectId: projectId,
      name: "Terminée",
      color: "#63a758", // Green
    },
    {
      projectId: projectId,
      name: "En attente",
      color: "#b3bcc0", // Grey
    },
  ];

  return defaultStatuses;
}

export function getDefaultPriorities(projectId) {
  const defaultPriorities = [
    {
      projectId: projectId,
      name: "Urgent",
      color: "#e17587",
    },
    {
      projectId: projectId,
      name: "Haute",
      color: "#7c67ad",
    },
    {
      projectId: projectId,
      name: "Moyenne",
      color: "#879ce0",
    },
    {
      projectId: projectId,
      name: "Basse",
      color: "#afbde9",
    },
  ];

  return defaultPriorities;
}
