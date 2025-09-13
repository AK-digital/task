export default function TaskBoard({ task }) {
  const board = task?.boardId;

  return (
    <div className="task-col-board task-content-col  gap-2 text-xs xl:text-normal lowercase select-none">
      <div
        className="w-2.5 h-2.5 xl:w-3.5 xl:h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: `${board?.color}` }}
      ></div>
      <span className="w-full p-1 xl:p-2 rounded-2xl first-letter:uppercase gap-2 truncate">
        {board?.title}
      </span>
    </div>
  );
}
