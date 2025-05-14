import { TaskProvider } from "@/context/TaskContext";

export default function TasksLayout({ children }) {
  return (
    <TaskProvider>
      {children}
      {/* <Panel /> */}
    </TaskProvider>
  );
}
