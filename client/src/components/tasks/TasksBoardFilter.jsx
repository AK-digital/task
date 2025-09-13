import { useState } from "react";
import { ChevronDown, LayoutDashboard, Undo } from "lucide-react";
import { isNotEmpty } from "@/utils/utils";
import { useProjectContext } from "@/context/ProjectContext";

export default function TasksBoardFilter({ queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);
  const { boards } = useProjectContext();

  const theBoard = boards?.find((board) => board?._id === queries?.boardId);

  function handleSelect(boardId) {
    setIsOpen(false);

    setQueries((prevQueries) => ({
      ...prevQueries,
      boardId: boardId || null,
    }));
  }

  return (
    <div className="relative z-2000">
      <div
        onClick={() => setIsOpen(!isOpen)}
        data-open={isOpen}
        className="secondary-button"
      >
        {theBoard?.color ? (
          <div
            style={{ backgroundColor: `${theBoard?.color}` }}
            className="min-w-3 h-3 rounded-full bg-accent-color"
          ></div>
        ) : (
          <LayoutDashboard size={16} />
        )}
        <span className="flex-1 whitespace-nowrap text-ellipsis overflow-hidden block lowercase first-letter:uppercase">{theBoard?.title || "Choisir un tableau"} </span>
        <ChevronDown size={16} className="chevron_TasksBoardFilter transition-all duration-[120ms] ease-in-out" />
      </div>
      {isOpen && (
        <div className="absolute top-11 rounded-sm bg-white shadow-small border border-color-border-color p-2 w-full">
          {isNotEmpty(boards) ? (
            <ul>
              <li className="flex items-center lowercase gap-1 py-2 px-1.5 cursor-pointer text-small font-medium transition-all duration-[120ms] ease-in-out hover:bg-third hover:shadow-small hover:rounded-sm" onClick={() => handleSelect()}>
                <Undo size={16} />
                <span className="whitespace-nowrap text-ellipsis overflow-hidden block first-letter:uppercase">Supprimer les filtres</span>
              </li>
              {boards.map((board) => (
                <li
                  key={board._id}
                  className="flex items-center lowercase gap-1 py-2 px-1.5 cursor-pointer text-small font-medium transition-all duration-[120ms] ease-in-out hover:bg-third hover:shadow-small hover:rounded-sm"
                  onClick={() => handleSelect(board._id)}
                >
                  <div
                    style={{ backgroundColor: `${board?.color}` }}
                    className="min-w-3 h-3 rounded-full bg-accent-color"
                  ></div>
                  <span className="whitespace-nowrap text-ellipsis overflow-hidden block first-letter:uppercase">{board?.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span>Aucun projet n'a été trouvé</span>
          )}
        </div>
      )}
    </div>
  );
}
