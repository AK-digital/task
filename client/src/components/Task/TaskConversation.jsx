import { useTaskContext } from "@/context/TaskContext";
import { MessageCircle, MessageCircleMore } from "lucide-react";
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
    <div
      className="relative flex items-center h-full pr-2"
      onClick={handleOpenTask}
    >
      {!hasDescription() && (
        <MessageCircle size={24} className="hover:text-accent-color" />
      )}
      {hasDescription() && (
        <MessageCircleMore size={24} className="hover:text-accent-color" />
      )}
      {messagesCount > 0 && (
        <span
          data-read={hasReadMessage}
          className="absolute flex justify-center items-center bottom-2 right-1 p-1 w-4 h-4 bg-primary rounded-full text-small select-none"
        >
          {messagesCount}
        </span>
      )}
    </div>
  );
}
