"use client";
import styles from "@/styles/components/templates/boards-template-list.module.css";
import {
  deleteBoardTemplate,
  getBoardsTemplates,
  useBoardTemplate,
} from "@/api/boardTemplate";
import { isNotEmpty } from "@/utils/utils";
import useSWR, { mutate } from "swr";

export default function BoardsTemplateList({ project, setAddBoardTemplate }) {
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
          <span>Liste de modèle des tableaux</span>
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
                      Utiliser
                    </button>
                    <button
                      type="button"
                      onClick={(e) =>
                        handleDeleteBoardTemplate(e, template?._id)
                      }
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <span>Aucun modèle de tableau n'a été trouvé</span>
            </div>
          )}
        </div>
      </div>
      <div id="modal-layout" onClick={() => setAddBoardTemplate(false)}></div>
    </>
  );
}
