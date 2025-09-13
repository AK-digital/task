import { useProjectContext } from "@/context/ProjectContext";
import { ChartBar, ChevronDown, Undo } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import Checkbox from "../UI/Checkbox";

export default function TasksStatusFilter({ queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);
  const QueriesStatus = queries?.status;
  const hasStatus = QueriesStatus?.length > 0;
  const { statuses } = useProjectContext();

  // Mémoriser les statuts uniques pour éviter le recalcul à chaque render
  const uniqueStatuses = useMemo(() => {
    if (!statuses) return [];

    return statuses.reduce((acc, currentStatus) => {
      // Vérifier si un statut avec le même nom existe déjà
      const existingStatus = acc.find(
        (status) => status.name === currentStatus.name
      );

      // Si aucun statut avec ce nom n'existe, l'ajouter à l'accumulateur
      if (!existingStatus) {
        acc.push(currentStatus);
      }

      return acc;
    }, []);
  }, [statuses]);

  // Mémoriser la fonction de reset pour éviter les re-renders
  const handleResetStatus = useCallback(() => {
    setQueries((prev) => ({
      ...prev,
      status: null,
    }));
    setIsOpen(false);
  }, [setQueries]);

  // Mémoriser la fonction de toggle pour éviter les re-renders
  const toggleDropdown = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Optimiser la fonction de changement de statut
  const handleStatusChange = useCallback(
    (e, elt) => {
      const { value, checked } = e.target;

      // Pré-calculer les statuts avec le même nom
      const getAllStatusesWhereSameName = statuses?.filter(
        (status) => status?.name === elt?.name
      );

      const getAllStatusesIds = getAllStatusesWhereSameName?.map(
        (status) => status?._id
      );

      if (checked) {
        setQueries((prev) => ({
          ...prev,
          status: prev?.status
            ? [...prev.status, getAllStatusesIds]
            : [getAllStatusesIds],
        }));
      } else {
        // Supprimer le tableau qui contient l'ID du statut décoché
        setQueries((prev) => {
          const deletedStatus = prev?.status?.filter(
            (statusArray) => !statusArray.includes(value)
          );

          return {
            ...prev,
            status: deletedStatus?.length > 0 ? deletedStatus : null,
          };
        });
      }
    },
    [statuses, setQueries]
  );

  // Optimiser la vérification si un statut est coché
  const isStatusChecked = useCallback(
    (statusId) => {
      return hasStatus
        ? QueriesStatus?.some((statusArray) => statusArray.includes(statusId))
        : false;
    },
    [hasStatus, QueriesStatus]
  );

  return (
    <div className="relative">
      <div
        className="secondary-button"
        onClick={toggleDropdown}
        data-open={isOpen}
      >
        <ChartBar size={16} />
        <span className="flex-1 text-[14px]">Statut</span>
        {hasStatus && (
          <span className="absolute -right-1 -top-1 flex items-center justify-center text-white w-[18px] h-[18px] rounded-full bg-accent-color text-small">
            {QueriesStatus?.length}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      <>
        <div
          className={`absolute z-[2001] top-[44px] bg-white shadow-small w-full font-medium text-small overflow-hidden transition-all duration-[350ms] ease-in-out ${
            isOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col p-2 rounded-sm border border-color-border-color max-h-96 overflow-y-auto">
            <li
              className="flex items-center gap-2 h-[30px] pl-2 cursor-pointer text-xs hover:bg-third hover:shadow-small hover:rounded-sm"
              onClick={handleResetStatus}
            >
              <Undo size={14} />
              <span>Effacer</span>
            </li>
            {uniqueStatuses?.map((elt) => (
              <li
                key={elt?._id}
                className="flex items-center gap-2 h-[30px] pl-2 cursor-pointer text-xs hover:bg-third hover:shadow-small hover:rounded-sm"
              >
                <Checkbox
                  id={elt?._id}
                  name={elt?.name}
                  value={elt?._id}
                  onChange={(e) => handleStatusChange(e, elt)}
                  checked={isStatusChecked(elt?._id)}
                />
                <label
                  htmlFor={elt?._id}
                  className="cursor-pointer flex-1 overflow-hidden text-ellipsis whitespace-nowrap min-w-0"
                >
                  {elt?.name}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="modal-layout-opacity"
          ></div>
        )}
      </>
    </div>
  );
}
