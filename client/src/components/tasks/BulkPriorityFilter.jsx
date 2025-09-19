import React, { useEffect, useState, memo, useCallback, useMemo } from "react";
import { ChevronDownIcon, Flag } from "lucide-react";
import { getPriorityByProject } from "@/api/priority";

const BulkPriorityFilter = memo(function BulkPriorityFilter({ project, onPriorityChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPriorities = async () => {
      if (project?._id) {
        setLoading(true);
        try {
          const priorityList = await getPriorityByProject(project._id);
          setPriorities(priorityList || []);
        } catch (error) {
          console.error("Erreur lors du chargement des priorités:", error);
          setPriorities([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPriorities();
  }, [project]);

  const handlePrioritySelect = useCallback((priority) => {
    onPriorityChange(priority._id);
    setIsOpen(false);
  }, [onPriorityChange]);

  const toggleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <div className="relative select-none">
      <div
        onClick={toggleOpen}
        className="secondary-button"
        data-open={isOpen}
      >
        <Flag size={16} />
        <span className="text-sm">Priorité</span>
        <ChevronDownIcon
          size={16}
          className={`transition-all duration-[200ms] ease-in-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      <>
        <div
          className={`absolute z-[2001] bottom-[44px] shadow-small w-48 font-medium text-small overflow-hidden transition-all duration-[350ms] ease-in-out ${
            isOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          {isOpen && (
            <div className="flex flex-col border border-[#e0e0e0] bg-secondary rounded-sm">
              {loading ? (
                <div className="p-3 text-center text-gray-500">
                  Chargement...
                </div>
              ) : (
                <ul className="flex flex-col py-2 max-h-64 overflow-y-auto">
                  {priorities.map((priority) => (
                    <li
                      key={priority._id}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-third text-xs transition-colors"
                      onClick={() => handlePrioritySelect(priority)}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: priority.color }}
                      />
                      <span className="flex-1">{priority.name}</span>
                    </li>
                  ))}
                  {priorities.length === 0 && !loading && (
                    <li className="px-3 py-2 text-gray-500 text-xs">
                      Aucune priorité disponible
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
        {isOpen && (
          <div
            className="modal-layout-opacity"
            onClick={() => setIsOpen(false)}
          ></div>
        )}
      </>
    </div>
  );
});

export default BulkPriorityFilter;
