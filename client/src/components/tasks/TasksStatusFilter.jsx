import { useProjectContext } from "@/context/ProjectContext";
import { ChartBar, ChevronDown, Undo } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function TasksStatusFilter({ queries, setQueries }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const QueriesStatus = queries?.status;
  const hasStatus = QueriesStatus?.length > 0;
  const { statuses } = useProjectContext();

  // Créer des statuts uniques basés sur le nom en utilisant reduce
  const uniqueStatuses =
    statuses?.reduce((acc, currentStatus) => {
      // Vérifier si un statut avec le même nom existe déjà
      const existingStatus = acc.find(
        (status) => status.name === currentStatus.name
      );

      // Si aucun statut avec ce nom n'existe, l'ajouter à l'accumulateur
      if (!existingStatus) {
        acc.push(currentStatus);
      }

      return acc;
    }, []) || [];

  function handleResetStatus() {
    setQueries((prev) => ({
      ...prev,
      status: null,
    }));
    setIsOpen(false);
  }

  function handleStatusChange(e, elt) {
    const { value, checked } = e.target;

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
      const deletedStatus = queries?.status?.filter(
        (statusArray) => !statusArray.includes(value)
      );

      setQueries((prev) => ({
        ...prev,
        status: deletedStatus?.length > 0 ? deletedStatus : null,
      }));
    }
  }

  return (
    <div className="relative">
      <div
        className={`relative flex items-center gap-2 bg-secondary p-2.5 rounded-sm border border-color-border-color cursor-pointer transition-all duration-[120ms] ease-in-out hover:bg-[#f9f7efb3] hover:shadow-small ${
          isOpen ? "bg-[#f9f7efb3] shadow-small" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChartBar size={16} />
        <span className="flex-1 text-[15px]">{t("tasks.status")}</span>
        {hasStatus && (
          <span className="absolute -right-1 -top-1 flex items-center justify-center text-white w-[18px] h-[18px] rounded-full bg-[#CC9348] text-small">
            {QueriesStatus?.length}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`transition-all duration-[120ms] ease-in-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      {isOpen && (
        <>
          <div className="absolute z-[2001] top-[44px] rounded-sm bg-white shadow-small border border-color-border-color p-2 w-full font-medium text-small">
            <ul className="flex flex-col">
              <li
                className="flex items-center gap-2 h-[30px] pl-2 cursor-pointer text-xs hover:bg-third hover:shadow-small hover:rounded-sm"
                onClick={handleResetStatus}
              >
                <Undo size={14} />
                <span>{t("tasks.clear")}</span>
              </li>
              {uniqueStatuses?.map((elt) => (
                <li
                  key={elt?._id}
                  className="flex items-center gap-2 h-[30px] pl-2 cursor-pointer text-xs hover:bg-third hover:shadow-small hover:rounded-sm"
                >
                  <input
                    type="checkbox"
                    id={elt?._id}
                    name={elt?.name}
                    value={elt?._id}
                    onChange={(e) => handleStatusChange(e, elt)}
                    checked={
                      hasStatus
                        ? QueriesStatus?.some((statusArray) =>
                            statusArray.includes(elt?._id)
                          )
                        : false
                    }
                    className="w-auto cursor-pointer"
                  />
                  <label
                    htmlFor={elt?._id}
                    className="flex items-center cursor-pointer flex-1"
                  >
                    {elt?.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div id="modal-layout-opacity" onClick={() => setIsOpen(false)}></div>
        </>
      )}
    </div>
  );
}
