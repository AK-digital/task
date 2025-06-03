import { useState } from "react";
import styles from "@/styles/components/tasks/tasks-board-filter.module.css";
import { ChevronDown, LayoutDashboard, Undo } from "lucide-react";
import { isNotEmpty } from "@/utils/utils";
import { useProjectContext } from "@/context/ProjectContext";
import { useTranslation } from "react-i18next";

export default function TasksBoardFilter({ queries, setQueries }) {
  const { t } = useTranslation();
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
        <span>{theBoard?.title || t("tasks.choose_board")} </span>
        <ChevronDown size={16} />
      </div>
      {isOpen && (
        <div className={styles.dropdown}>
          {isNotEmpty(boards) ? (
            <ul>
              <li className={styles.item} onClick={() => handleSelect()}>
                <Undo size={16} />
                {t("tasks.remove_filters")}
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
            <span>{t("tasks.no_project_found")}</span>
          )}
        </div>
      )}
    </div>
  );
}
