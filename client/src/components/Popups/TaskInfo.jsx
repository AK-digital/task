export default function TaskInfo({ message }) {
  return (
    <div className="container_TaskInfo flex flex-col w-fit bg-background-secondary-color rounded-sm shadow-shadow-box-medium absolute z-2001 p-2 gap-2 left-1/2 -translate-x-1/2 -top-[38px] ">
      <span className="text-[0.85rem] text-text-color-muted whitespace-nowrap">{message}</span>
    </div>
  );
}
