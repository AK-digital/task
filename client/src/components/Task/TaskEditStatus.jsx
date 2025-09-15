import { deleteStatus, updateStatus } from "@/api/status";
import { Palette, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import ColorsPopup from "../Popups/ColorsPopup";
import { colors } from "@/utils/utils";
import { useProjectContext } from "@/context/ProjectContext";
import { useUserRole } from "../../../hooks/useUserRole";

export default function TaskEditStatus({
  status,
  currentStatus,
  setCurrentStatus,
}) {
  const { project, mutateTasks, statuses, mutateStatuses } =
    useProjectContext();
  const [isHover, setIsHover] = useState(false);
  const [name, setName] = useState(status?.name || "");
  const [moreColor, setMoreColor] = useState(false);
  const [color, setColor] = useState(status?.color || "");
  // La propriété todo peut être modifiée manuellement sauf pour les statuts de type "todo"
  const [isTodo, setIsTodo] = useState(status?.todo || status?.status === "todo");
  const statusesColors = statuses.map((s) => s.color);
  const availableColors = colors.filter(
    (color) => !statusesColors.includes(color)
  );

  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  // Synchroniser l'état local avec les changements du prop status
  useEffect(() => {
    setName(status?.name || "");
    setColor(status?.color || "");
    setIsTodo(status?.todo || status?.status === "todo");
  }, [status?.name, status?.color, status?.todo, status?.status]);

  async function handleUpdateStatusName() {
    if (!canEdit) return;

    if (!name) {
      return;
    }

    if (currentStatus?._id === status?._id) {
      setCurrentStatus({
        ...status,
        name: name,
      });
    }
    const res = await updateStatus(status?._id, status?.projectId, {
      name: name,
      color: status?.color,
      todo: status?.status === "todo" ? true : isTodo, // Toujours true pour type "todo", sinon valeur manuelle
    });

    if (!res.success) {
      console.error("Failed to update status:", res.message);

      setCurrentStatus(status);

      return;
    }

    mutateStatuses();
    mutateTasks();
  }

  async function handleUpdateStatusColor(newColor = color) {
    if (!canEdit) return;
    setMoreColor(false);

    if (currentStatus?._id === status?._id) {
      setCurrentStatus({
        ...status,
        color: newColor,
      });
    }

    const res = await updateStatus(status?._id, status?.projectId, {
      name: status?.name,
      color: newColor,
      todo: status?.status === "todo" ? true : isTodo, // Toujours true pour type "todo", sinon valeur manuelle
    });

    if (!res.success) {
      console.error("Failed to update status color:", res.message);

      setCurrentStatus(status);

      return;
    }

    mutateStatuses();
    mutateTasks();
  }

  // Only authorized users can delete a status and there must be more than one status
  async function handleDeleteStatus() {
    if (!canEdit) return;

    if (statuses.length === 1) return;

    const response = await deleteStatus(status?._id, status?.projectId);

    if (!response.success) {
      console.error("Failed to delete status:", response.message);
      return;
    }

    mutateStatuses();
    mutateTasks();
  }

  const handleUpdateStatusNameDebouced = useDebouncedCallback(() => {
    if (name !== status?.name) { // Seulement si le nom a vraiment changé
      handleUpdateStatusName();
    }
  }, 600);

  async function handleUpdateTodo(newTodoValue) {
    if (!canEdit) return;
    if (status?.status === "todo") return; // Ne pas permettre la modification pour les statuts de type "todo"
    if (status?.todo === newTodoValue) return; // Ne pas faire d'appel si la valeur n'a pas changé

    const res = await updateStatus(status?._id, status?.projectId, {
      name: status?.name,
      color: status?.color,
      todo: newTodoValue,
    });

    if (!res.success) {
      console.error("Failed to update status todo:", res.message);
      setIsTodo(!newTodoValue); // Revenir à l'état précédent en cas d'erreur
      return;
    }
    mutateStatuses();
    mutateTasks();
  }

  return (
    <li
      className="relative flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-300 hover:border-gray-300 transition-colors"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div
        className="flex justify-center items-center text-white h-8 w-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
        style={{ backgroundColor: color }}
        onClick={() => setMoreColor(true)}
      >
        <Palette size={16} />
        {moreColor && (
          <ColorsPopup
            colors={availableColors}
            setColor={setColor}
            setMoreColor={setMoreColor}
            updateStatus={(newColor) => handleUpdateStatusColor(newColor)}
          />
        )}
      </div>
      
      <div className="flex-1 flex items-center gap-3">
        <input
          type="text"
          id="status-name"
          name="status-name"
          value={name}
          onBlur={handleUpdateStatusName}
          onChange={(e) => {
            setName(e.target.value);
            handleUpdateStatusNameDebouced();
          }}
          className="flex-1 border border-gray-300 py-2 px-3 rounded-md bg-white text-[15px] font-bricolage focus:border-accent-color focus:outline-none"
          placeholder="Nom du statut"
        />
        
        <div className="flex items-center gap-2 whitespace-nowrap">
          <label htmlFor={`todo-${status?._id}`} className="text-sm text-gray-700 cursor-pointer">
            Todo ?
          </label>
          <input
            type="checkbox"
            id={`todo-${status?._id}`}
            checked={isTodo}
            disabled={status?.status === "todo"} // Désactivé seulement pour les statuts de type "todo"
            onChange={(e) => {
              const newValue = e.target.checked;
              setIsTodo(newValue);
              handleUpdateTodo(newValue);
            }}
            className={`p-0 w-4 h-4 bg-white border-2 border-gray-400 rounded-sm focus:ring-2 focus:ring-accent-color checked:bg-accent-color checked:border-accent-color checked:text-white appearance-none relative ${
              status?.status === "todo" ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
            }`}
            style={{
              backgroundImage: isTodo ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e")` : 'none',
              backgroundSize: '12px 12px',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        </div>
      </div>
      
      {!status?.default && (
        <span
          className={`text-gray-400 hover:text-danger-color transition-colors p-1 rounded ${
            isHover ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleDeleteStatus}
          title="Supprimer ce statut"
        >
          <Trash size={18} />
        </span>
      )}
    </li>
  );
}
