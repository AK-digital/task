import { useState } from "react";
import styles from "@/styles/components/tasks/tasks-board-filter.module.css";
import { ChevronDown, LayoutDashboard, Undo } from "lucide-react";
import { isNotEmpty } from "@/utils/utils";

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
    <div className={styles.container}>
      <div
        className={styles.current}
        onClick={() => setIsOpen(!isOpen)}
        data-open={isOpen}
      >
        {theBoard?.color ? (
          <div
            style={{ backgroundColor: `${theBoard?.color}` }}
            className={styles.dot}
          ></div>
        ) : (
          <LayoutDashboard size={16} />
        )}
        <span>{theBoard?.title || "Choisir un tableau"} </span>
        <ChevronDown size={16} />
      </div>
      {isOpen && (
        <div className={styles.dropdown}>
          {isNotEmpty(boards) ? (
            <ul>
              <li className={styles.item} onClick={() => handleSelect()}>
                <Undo size={16} />
                Supprimer les filtres
              </li>
              {boards.map((board) => (
                <li
                  key={board._id}
                  className={styles.item}
                  onClick={() => handleSelect(board._id)}
                >
                  <div
                    style={{ backgroundColor: `${board?.color}` }}
                    className={styles.dot}
                  ></div>
                  <span>{board?.title}</span>
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
