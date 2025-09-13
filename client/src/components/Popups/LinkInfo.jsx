export default function LinkInfo({ label, style }) {
  const top = style?.top || "-30px";
  const left = style?.left || "50%";
  
  return (
    <div 
      style={{ top: top, left: left, transform: "translateX(-50%)" }} 
      className="absolute flex flex-col bg-secondary rounded-sm shadow-small z-2001 p-2 whitespace-nowrap"
    >
      <span className="text-[0.85rem] text-text-color-muted">
        {label}
      </span>
    </div>
  );
}
