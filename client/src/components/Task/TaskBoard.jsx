export default function TaskBoard({ task }) {
  const board = task?.boardId;

  return (
    <div className="flex justify-between gap-2 items-center h-full text-center px-4 text-normal min-w-[150px] max-w-[170px] w-full lowercase select-none">
      <div
        className="w-3.5 h-3 rounded-full"
        style={{ backgroundColor: `${board?.color}` }}
      ></div>
      <span className="w-full p-2 rounded-2xl first-letter:uppercase gap-2">
        {board?.title}
      </span>
    </div>
  );
}
