export default function TaskBoard({ task }) {
  const board = task?.boardId;

  return (
    <div className="hidden lg:flex justify-between gap-2 items-center h-full text-center px-2 xl:px-4 text-xs xl:text-normal min-w-[100px] xl:min-w-[120px] max-w-[150px] w-full lowercase select-none flex-shrink-0">
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
