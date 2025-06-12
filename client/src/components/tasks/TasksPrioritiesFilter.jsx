import { useProjectContext } from "@/context/ProjectContext";
import { ChevronDown, Star, Undo } from "lucide-react";
import { useState } from "react";

export default function TasksPrioritiesFilter({ queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);
  const queriesPriorities = queries?.priorities;
  const hasPriorities = queriesPriorities?.length > 0;

  const { priorities } = useProjectContext();

  const uniquePriorities =
    priorities?.reduce((acc, currentPriority) => {
      // Vérifier si un statut avec le même nom existe déjà
      const existingPriority = acc.find(
        (priority) => priority.name === currentPriority.name
      );

      // Si aucun statut avec ce nom n'existe, l'ajouter à l'accumulateur
      if (!existingPriority) {
        acc.push(currentPriority);
      }

      return acc;
    }, []) || [];
  function handleResetPriorities() {
    setQueries((prev) => ({
      ...prev,
      priorities: null,
    }));
    setIsOpen(false);
  }

  function handlePrioritiesChange(e, elt) {
    const { value, checked } = e.target;

    const getAllPrioritiesWhereSameName = priorities?.filter(
      (priority) => priority?.name === elt?.name
    );

    const getAllPrioritiesIds = getAllPrioritiesWhereSameName?.map(
      (priority) => priority?._id
    );

    if (checked) {
      setQueries((prev) => ({
        ...prev,
        priorities: prev?.priorities
          ? [...prev.priorities, getAllPrioritiesIds]
          : [getAllPrioritiesIds],
      }));
    } else {
      // Supprimer le tableau qui contient l'ID du statut décoché
      const deletedPriorities = queries?.priorities?.filter(
        (prioritiesArray) => !prioritiesArray.includes(value)
      );

      setQueries((prev) => ({
        ...prev,
        priorities: deletedPriorities?.length > 0 ? deletedPriorities : null,
      }));
    }
  }

  return (
    <div className="relative">
      <div
        className="relative flex items-center gap-2 bg-secondary p-2.5 rounded-sm border border-color-border-color cursor-pointer transition-all duration-[120ms] ease-in-out hover:bg-[#f9f7efb3] hover:shadow-small data-[open=true]:bg-[#f9f7efb3] data-[open=true]:shadow-small"
        onClick={() => setIsOpen(!isOpen)}
        data-open={isOpen}
      >
        <Star size={16} />
        <span className="flex-1 text-[15px]">Priorité</span>
        {hasPriorities && (
          <span className="absolute -right-1 -top-1 flex items-center justify-center text-white w-[18px] h-[18px] rounded-full bg-[#CC9348] text-small">
            {queriesPriorities?.length}
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
                onClick={handleResetPriorities}
              >
                <Undo size={14} />
                <span>Effacer</span>
              </li>
              {uniquePriorities?.map((priority) => (
                <li
                  key={priority?._id}
                  className="flex items-center gap-2 h-[30px] pl-2 cursor-pointer hover:bg-third text-xs hover:shadow-small hover:rounded-sm"
                >
                  <input
                    type="checkbox"
                    id={priority?._id}
                    name={priority?.name}
                    value={priority?._id}
                    onChange={(e) => handlePrioritiesChange(e, priority)}
                    checked={
                      hasPriorities
                        ? queriesPriorities?.some((prioritiesArray) =>
                            prioritiesArray.includes(priority?._id)
                          )
                        : false
                    }
                    className="w-auto cursor-pointer"
                  />
                  <label
                    htmlFor={priority?._id}
                    className="flex items-center cursor-pointer flex-1"
                  >
                    {priority?.name}
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
