import { useTaskContext } from "@/context/TaskContext";
import styles from "@/styles/components/task/task-conversation.module.css";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export default function TaskConversation({ task, archive = false, uid }) {
  const { openTask } = useTaskContext();
  const project = task?.projectId;
  const pathname = usePathname();

  function handleOpenTask(e) {
    e.preventDefault();
    let path = "";
    if (pathname?.includes("/projects")) {
      path = archive
        ? `/projects/${project?._id}/archive/task/${task?._id}`
        : `/projects/${project?._id}/task/${task?._id}`;
    }

    if (pathname?.includes("/tasks")) {
      path = `/tasks/task/${task?._id}`;
    }
    openTask(task?._id, path);
  }

  const hasReadMessage = task?.messages?.some((message) =>
    message.readBy.includes(uid)
  );

  const messagesCount = task?.messages?.length;

  function hasDescription() {
    if (task?.description && task?.description?.text) {
      if (task?.description?.text !== "") {
        return true;
      }
    } else {
      return false;
    }
  }

  return (
    <div className={styles.container} id="task-row" onClick={handleOpenTask}>
      <MessageCircle size={24} data-description={hasDescription()} />
      {messagesCount > 0 && (
        <span data-read={hasReadMessage}>{messagesCount}</span>
      )}
    </div>
  );
}
