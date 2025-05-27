import styles from "@/styles/components/task/task-board.module.css";

export default function TaskBoard({ task }) {
  const board = task?.boardId;

  return (
    <div className="flex justify-center items-center h-full text-center px-4 text-text-size-normal min-w-[150px] max-w-[170px] w-full lowercase">
      <span
        className="gap-2 w-full p-2 rounded-2xl border first-letter:uppercase"
        style={{ borderColor: `${board?.color}` }}
      >
        {board?.title}
      </span>
    </div>
  );
}
