import {
  Crown,
  Figma,
  Github,
  Gitlab,
  Globe,
  Layout,
  Youtube,
} from "lucide-react";

export function isNotEmpty(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

export function formatTime(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function checkRole(project, roles, uid) {
  const member =
    project?.members?.find((member) => member?.user === uid) ||
    project?.members?.find((member) => member?.user?._id === uid);

  if (!member) return false;

  return roles?.includes(member?.role);
}

export function memberRole(role) {
  if (role === "owner") {
    return "👑 Créateur";
  }
  if (role === "manager") {
    return "👨‍💼 Manager";
  }
  if (role === "team") {
    return "🙏 Équipe";
  }
  if (role === "customer") {
    return "👤Client";
  }
  if (role === "guest") {
    return "🙋‍♂️ Invité";
  }
}

export const icons = [
  {
    name: "Globe",
    icon: <Globe size={20} />,
  },
  {
    name: "Layout",
    icon: <Layout size={20} />,
  },
  {
    name: "Figma",
    icon: <Figma size={20} />,
  },
  {
    name: "Github",
    icon: <Github size={20} />,
  },
  {
    name: "Gitlab",
    icon: <Gitlab size={20} />,
  },
  {
    name: "Youtube",
    icon: <Youtube size={20} />,
  },
];

export function dataToExport(data) {}
