"use client";
import {
  deleteBoardTemplate,
  getBoardsTemplates,
  useBoardTemplate,
} from "@/api/boardTemplate";
import { isNotEmpty } from "@/utils/utils";
import useSWR, { mutate } from "swr";

export default function BoardsTemplateList({ project, setAddBoardTemplate }) {
  const { data: boardsTemplates } = useSWR(
    "/board-template",
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

    await mutate("/board-template");
  }

  return (
    <>
      <div className="fixed z-2001 top-1/2 left-1/2 -translate-1/2 bg-background-secondary-color p-6 rounded-lg shadow-shadow-box-medium w-[500px]">
        <div className="text-center text-large border-b border-background-primary-color pb-6">
          <span>Liste de modèle des tableaux</span>
        </div>
        {/* Boards templates */}
        <div className="mt-6">
          {isNotEmpty(templates) ? (
            <ul className="flex flex-col gap-3">
              {templates.map((template) => (
                <li key={template._id} className="flex items-center justify-between">
                  <div>
                    <span>{template.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2 rounded-sm"
                      onClick={(e) => handleUseBoardTemplate(e, template?._id)}
                    >
                      Utiliser
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-sm bg-danger-color"
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
      <div className="modal-layout" onClick={() => setAddBoardTemplate(false)}></div>
    </>
  );
}
