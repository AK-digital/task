"use client";
import Sidebar from "./Sidebar";

export default function ColorsSidebar({
  isOpen,
  onClose,
  colors,
  setColor,
  updateStatus,
  title = "Choisir une couleur"
}) {
  const handleColorSelect = (color) => {
    setColor(color);
    updateStatus(color);
    onClose(); // Fermer la sidebar après sélection
  };

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="400px"
    >
      <div className="grid grid-cols-4 gap-4">
        {colors?.map((color, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all hover:scale-105"
            onClick={() => handleColorSelect(color)}
          >
            <div
              className="w-12 h-12 rounded-full shadow-sm border border-gray-200"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-600 font-medium">
              {color.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </Sidebar>
  );
}
