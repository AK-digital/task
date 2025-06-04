export default function PopupMessage({ status, title, message }) {
  return (
    <div data-status={status} className="container_PopupMessage fixed z-9999 right-5 bottom-5 flex flex-col gap-[14px] bg-secondary w-[450px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.25)] text-left rounded-sm">
      <div className="font-bold text-large">
        <span>{title}</span>
      </div>
      <div className="text-normal">
        <p>{message}</p>
      </div>
    </div>
  );
}
