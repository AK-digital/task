import { TaskProvider } from "@/context/TaskContext";

export default function ProjectLayout({ children }) {
  return <TaskProvider>{children}</TaskProvider>;
}
