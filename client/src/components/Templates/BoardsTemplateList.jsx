"use client";
import styles from "@/styles/components/templates/boards-template-list.module.css";
import {
  deleteBoardTemplate,
  getBoardsTemplates,
  useBoardTemplate,
} from "@/api/boardTemplate";
import { isNotEmpty } from "@/utils/utils";
import useSWR, { mutate } from "swr";
import { useTranslation } from "react-i18next";

export default function BoardsTemplateList({ project, setAddBoardTemplate }) {
  const { t } = useTranslation();
  const { data: boardsTemplates } = useSWR(
    `/board-template`,
    getBoardsTemplates
  );
  const templates = boardsTemplates?.data || [];

  async function handleUseBoardTemplate(e, templateId) {
    e.preventDefault();

    const response = await useBoardTemplate(templateId, project?._id);

    if (!response.success) return;

    await mutate(`/boards?projectId=${project?._id}&archived=false`);
    await mutate(`/task?projectId=${project?._id}&archived=false`);

    setAddBoardTemplate(false);
  }

  async function handleDeleteBoardTemplate(e, templateId) {
    await deleteBoardTemplate(templateId);

    await mutate(`/board-template`);
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <span>{t("templates.boards_list_title")}</span>
        </div>
        {/* Boards templates */}
        <div className={styles.content}>
          {isNotEmpty(templates) ? (
            <ul className={styles.templates}>
              {templates.map((template) => (
                <li key={template._id} className={styles.template}>
                  <div>
                    <span>{template.name}</span>
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={(e) => handleUseBoardTemplate(e, template?._id)}
                    >
                      {t("templates.use")}
                    </button>
                    <button
                      type="button"
                      onClick={(e) =>
                        handleDeleteBoardTemplate(e, template?._id)
                      }
                    >
                      {t("templates.delete")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <span>{t("templates.no_board_templates")}</span>
            </div>
          )}
        </div>
      </div>
      <div id="modal-layout" onClick={() => setAddBoardTemplate(false)}></div>
    </>
  );
}
