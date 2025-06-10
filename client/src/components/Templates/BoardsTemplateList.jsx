"use client";
import {
  deleteBoardTemplate,
  getPublicBoardsTemplates,
  useBoardTemplate,
} from "@/api/boardTemplate";
import { usePrivateBoardTemplate } from "@/app/hooks/usePrivateBoardTemplate";
import { usePublicBoardTemplate } from "@/app/hooks/usePublicBoardTemplate";
import { AuthContext } from "@/context/auth";
import { isNotEmpty } from "@/utils/utils";
import { useContext } from "react";
import useSWR, { mutate } from "swr";

export default function BoardsTemplateList({ project, setAddBoardTemplate }) {
  const { uid } = useContext(AuthContext)
  const { privateBoardTemplates, mutatePrivateBoardTemplates } = usePrivateBoardTemplate(true);
  const { publicBoardTemplates, mutatePublicBoardTemplates } = usePublicBoardTemplate(false);

  async function handleUseBoardTemplate(e, templateId) {
    e.preventDefault();

    const response = await useBoardTemplate(templateId, project?._id);

    if (!response.success) return;

    await mutate(`/boards?projectId=${project?._id}&archived=false`);
    await mutate(`/task?projectId=${project?._id}&archived=false`);

    setAddBoardTemplate(false);
  }

  async function handleDeleteBoardTemplate(e, templateId, isPrivate) {
    await deleteBoardTemplate(templateId);
    await mutatePrivateBoardTemplates();
    await mutatePublicBoardTemplates();
  }

  const bothNotEmpty = isNotEmpty(publicBoardTemplates) && isNotEmpty(privateBoardTemplates)

  { console.log("bothNotEmpty :", bothNotEmpty) }
  { console.log("privateBoardTemplates :", privateBoardTemplates) }
  { console.log("publicBoardTemplates :", publicBoardTemplates) }

  return (
    <>
      <div className="fixed z-2001 top-1/2 left-1/2 -translate-1/2 bg-secondary p-6 rounded-lg shadow-medium w-[500px]">
        <div className="text-center text-large border-b border-primary pb-6">
          <span>Liste de modèle des tableaux</span>
        </div>
        {/* Boards templates */}
        <div className="mt-6">
          {/* {bothNotEmpty ? ( */}
          <>
            {isNotEmpty(privateBoardTemplates) && (
              <>
                <h3 className="text-xl font-semibold mb-6 text-text-dark-color">Modèles Privés</h3>
                <ul className="flex flex-col gap-3">
                  {privateBoardTemplates.map((template) => (
                    <li key={template._id} className="flex items-center justify-between">
                      <div>
                        <span>{template.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-2 rounded-sm"
                          onClick={(e) => handleUseBoardTemplate(e, template?._id, template?.private)}
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
              </>
            )}
            {isNotEmpty(publicBoardTemplates) && (
              <>
                <h3 className="text-xl font-semibold mb-6 text-text-dark-color">Modèles Publics</h3>
                <ul className="flex flex-col gap-3">
                  {publicBoardTemplates.map((template) => (
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
                        {(
                          template?.author?.toString() === uid && (

                            <button
                              type="button"
                              className="p-2 rounded-sm bg-danger-color"
                              onClick={(e) =>
                                handleDeleteBoardTemplate(e, template?._id, template?.private)
                              }
                            >
                              Supprimer
                            </button>
                          )
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
          {/* ) : (
             <div>
               <span>Aucun modèle de tableau n'a été trouvé</span>
             </div>
           )} */}
        </div>
      </div>
      <div className="modal-layout" onClick={() => setAddBoardTemplate(false)}></div>
    </>
  );
}
