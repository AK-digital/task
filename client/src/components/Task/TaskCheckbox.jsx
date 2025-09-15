import { useUserRole } from "../../../hooks/useUserRole";
import Checkbox from "../UI/Checkbox";

export default function TaskCheckbox({ task, setSelectedTasks }) {
  const project = task?.projectId;

  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  function handleSelectedTask(e) {
    setSelectedTasks((prev) => {
      if (e.target.checked) {
        return [...prev, task?._id];
      } else {
        return prev.filter((id) => id !== task?._id);
      }
    });
  }

  return (
    <div className="task-col-checkbox task-content-col select-none">
      <Checkbox
        name="task"
        id={`task-${task?._id}`}
        value={task?._id}
        onChange={handleSelectedTask}
        disabled={!canEdit}
      />
    </div>
  );
}
