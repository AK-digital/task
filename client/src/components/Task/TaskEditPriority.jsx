import { deletePriority, updatePriority } from "@/api/priority";
import { Palette, Trash } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useDebouncedCallback } from "use-debounce";
import ColorsSidebar from "../Sidebar/ColorsSidebar";
import { useProjectContext } from "@/context/ProjectContext";
import { useUserRole } from "@/hooks/api/useUserRole";
import { priorityColors } from "@/utils/utils";

export default function TaskEditPriority({
  priority,
  currentPriority,
  setCurrentPriority,
}) {
  const { project, mutateTasks, priorities, mutatePriorities } =
    useProjectContext();
  const [isHover, setIsHover] = useState(false);
  const [name, setName] = useState(priority?.name || "");
  const [showColorSidebar, setShowColorSidebar] = useState(false);
  const [color, setColor] = useState(priority?.color || "");
  const prioritiesColors = priorities.map((p) => p.color);
  const availableColors = priorityColors.filter(
    (color) => !prioritiesColors.includes(color)
  );

  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  async function handleUpdatePriorityName() {
    if (!canEdit) return;

    if (!name) return;

    if (currentPriority?._id === priority?._id) {
      setCurrentPriority({
        ...priority,
        name: name,
      });
    }

    const res = await updatePriority(priority?._id, priority?.projectId, {
      name: name,
      color: priority?.color,
    });

    if (!res.success) {
      console.error("Failed to update priority:", res.message);
      setCurrentPriority(priority);
      return;
    }

    mutatePriorities();
    mutateTasks();
  }

  async function handleUpdatePriorityColor(newColor = color) {
    if (!canEdit) return;

    if (currentPriority?._id === priority?._id) {
      setCurrentPriority({
        ...priority,
        color: newColor,
      });
    }

    setMoreColor(false);

    const res = await updatePriority(priority?._id, priority?.projectId, {
      name: priority?.name,
      color: newColor,
    });

    if (!res.success) {
      console.error("Failed to update priority color:", res.message);

      setCurrentPriority(priority);

      return;
    }

    mutatePriorities();
    mutateTasks();
  }

  async function handleDeletePriority() {
    if (!canEdit) return;

    if (priorities.length === 1) return;

    const response = await deletePriority(priority?._id, priority?.projectId);

    if (!response.success) {
      console.error("Failed to delete priority:", response.message);
      return;
    }

    mutatePriorities();
    mutateTasks();
  }

  const handleUpdatePriorityNameDebouced = useDebouncedCallback(() => {
    handleUpdatePriorityName();
  }, 600);

  return (
    <li
      className="relative flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-300 hover:border-gray-300 transition-colors"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div
        className="flex justify-center items-center text-white h-8 w-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
        style={{ backgroundColor: color }}
        onClick={() => setShowColorSidebar(true)}
      >
        <Palette size={16} />
      </div>
      
      {/* Sidebar pour les couleurs - rendue via portal */}
      {typeof document !== 'undefined' && showColorSidebar && 
        createPortal(
          <ColorsSidebar
            isOpen={showColorSidebar}
            onClose={() => setShowColorSidebar(false)}
            colors={availableColors}
            setColor={setColor}
            updateStatus={(newColor) => handleUpdatePriorityColor(newColor)}
            title="Choisir une couleur de priorité"
          />,
          document.body
        )
      }
      
      <input
        type="text"
        id="priority-name"
        name="priority-name"
        value={name}
        onBlur={handleUpdatePriorityName}
        onChange={(e) => {
          setName(e.target.value);
          handleUpdatePriorityNameDebouced();
        }}
        className="flex-1 border border-gray-300 py-2 px-3 rounded-md bg-white text-[15px] font-bricolage focus:border-accent-color focus:outline-none"
        placeholder="Nom de la priorité"
      />
      
      {!priority?.default && (
        <span
          className={`text-gray-400 hover:text-danger-color transition-colors p-1 rounded ${
            isHover ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleDeletePriority}
          title="Supprimer cette priorité"
        >
          <Trash size={18} />
        </span>
      )}
    </li>
  );
}
