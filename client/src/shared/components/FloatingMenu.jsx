import Portal from "@/components/Portal/Portal";

export default function FloatingMenu({
  refs,
  floatingStyles,
  children,
  setIsOpen,
  layout = "default",
  className,
}) {
  return (
    <Portal>
      <div
        className={`z-[9999] bg-secondary shadow-[2px_2px_4px_rgba(0,0,0,0.25),-2px_2px_4px_rgba(0,0,0,0.25)] rounded-lg overflow-hidden ${className}`}
        ref={refs.setFloating}
        style={floatingStyles}
        data-floating-menu
      >
        {children}
      </div>
      <div
        onClick={() => setIsOpen(false)}
        className={`${
          layout === "default" ? "modal-layout-opacity" : "modal-layout"
        }`}
      ></div>
    </Portal>
  );
}
