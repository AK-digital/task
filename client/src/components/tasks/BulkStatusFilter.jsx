import React, { useEffect, useState, memo, useCallback } from "react";
import { ChevronDownIcon, CheckCircle } from "lucide-react";
import { getStatusByProject } from "@/api/status";

const BulkStatusFilter = memo(function BulkStatusFilter({ project, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStatuses = async () => {
      if (project?._id) {
        setLoading(true);
        try {
          const statusList = await getStatusByProject(project._id);
          setStatuses(statusList || []);
        } catch (error) {
          console.error("Erreur lors du chargement des statuts:", error);
          setStatuses([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadStatuses();
  }, [project]);

  const handleStatusSelect = useCallback((status) => {
    onStatusChange(status._id);
    setIsOpen(false);
  }, [onStatusChange]);

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
        <CheckCircle size={16} />
        <span className="text-sm">Statut</span>
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
                  {statuses.map((status) => (
                    <li
                      key={status._id}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-third text-xs transition-colors"
                      onClick={() => handleStatusSelect(status)}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="flex-1">{status.name}</span>
                    </li>
                  ))}
                  {statuses.length === 0 && !loading && (
                    <li className="px-3 py-2 text-gray-500 text-xs">
                      Aucun statut disponible
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

export default BulkStatusFilter;
