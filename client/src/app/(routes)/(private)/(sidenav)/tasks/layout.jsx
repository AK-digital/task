import { TaskProvider } from "@/context/TaskContext";
import Panel from "./@panel/[...slug]/page";

export default function TasksLayout({ children }) {
  return (
    <TaskProvider>
      {children}
      {/* <Panel /> */}
    </TaskProvider>
  );
}
