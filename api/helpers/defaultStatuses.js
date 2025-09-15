export function getDefaultStatuses(projectId) {
  const defaultStatuses = [
    {
      projectId: projectId,
      name: "À faire",
      color: "#559fc6", // Blue
      status: "todo",
      default: true,
      todo: true,
    },
    {
      projectId: projectId,
      name: "En cours",
      color: "#f3b158", // Yellow/Orange
      status: "progress",
      default: true,
      todo: false,
    },
    {
      projectId: projectId,
      name: "Terminée",
      color: "#63a758", // Green
      status: "done",
      default: true,
      todo: false,
    },
    {
      projectId: projectId,
      name: "En attente",
      color: "#b3bcc0", // Grey
      status: "waiting",
      default: true,
      todo: false,
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
      default: true,
      priority: "urgent",
    },
    {
      projectId: projectId,
      name: "Haute",
      color: "#7c67ad",
      default: true,
      priority: "high",
    },
    {
      projectId: projectId,
      name: "Moyenne",
      color: "#879ce0",
      default: true,
      priority: "medium",
    },
    {
      projectId: projectId,
      name: "Basse",
      color: "#afbde9",
      default: true,
      priority: "low",
    },
  ];

  return defaultPriorities;
}
