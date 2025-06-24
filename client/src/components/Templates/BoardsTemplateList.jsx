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
import { useContext, useState } from "react";
import useSWR, { mutate } from "swr";
import DropdownManageTemplate from "../Dropdown/DropdownManageTemplate";

export default function BoardsTemplateList({ project, setAddBoardTemplate }) {
  const { uid } = useContext(AuthContext);

  const [showPrivateTemplate, setShowPrivateTemplate] = useState(false);

  const { privateBoardTemplates, mutatePrivateBoardTemplates } =
    usePrivateBoardTemplate(true);
  const { publicBoardTemplates, mutatePublicBoardTemplates } =
    usePublicBoardTemplate(false);

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

  const bothNotEmpty =
    isNotEmpty(publicBoardTemplates) && isNotEmpty(privateBoardTemplates);

  {
    console.log("bothNotEmpty :", bothNotEmpty);
  }
  {
    console.log("privateBoardTemplates :", privateBoardTemplates);
  }
  {
    console.log("publicBoardTemplates :", publicBoardTemplates);
  }

  return (
    <>
      <div className="fixed z-2001 top-1/2 left-1/2 -translate-1/2 bg-secondary p-6 rounded-lg shadow-medium w-[500px]">
        <div className="text-center text-large border-b border-primary pb-6">
          <span>Liste de modèle des tableaux</span>
        </div>
        <div className="flex items-center justify-center rounded-lg border border-border-color">
          <button
            className={`flex items-center justify-center px-2 py-1 cursor-pointer shadow-none transition-all duration-200 w-full rounded-tl-lg rounded-bl-lg rounded-none ${
              showPrivateTemplate ? "bg-white" : "bg-primary"
            }`}
            onClick={() => setShowPrivateTemplate(false)}
          >
            <div className="flex justify-center items-center">
              <p className="text-normal font-medium text-text-dark-color">
                La communauté
              </p>
            </div>
          </button>
          <button
            className={`flex items-center justify-center px-2 py-1 cursor-pointer shadow-none transition-all duration-200 w-full rounded-tr-lg rounded-br-lg rounded-none ${
              showPrivateTemplate ? "bg-primary" : "bg-white"
            }`}
            onClick={() => setShowPrivateTemplate(true)}
          >
            <div className="flex justify-center items-center">
              <p className="text-normal font-medium text-text-dark-color">
                Les vôtres
              </p>
            </div>
          </button>
        </div>

        {/* Boards templates */}
        <div className="mt-6">
          <>
            {showPrivateTemplate ? (
              // Onglet "Les vôtres" - Templates privés
              privateBoardTemplates?.length > 0 ? (
                <ul
                  className={`flex flex-col gap-3 max-h-[320px] ${
                    privateBoardTemplates?.length > 7
                      ? "overflow-y-scroll pr-1"
                      : ""
                  }`}
                >
                  {privateBoardTemplates.map((template) => (
                    <li
                      key={template._id}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate max-w-50 min-w-0">
                        {template.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex justify-center items-center gap-[5px] h-8 rounded-sm text-small w-20"
                          onClick={(e) =>
                            handleUseBoardTemplate(
                              e,
                              template?._id,
                              template?.private
                            )
                          }
                        >
                          Utiliser
                        </button>
                        <DropdownManageTemplate
                          handleDeleteBoardTemplate={handleDeleteBoardTemplate}
                          mutatePrivateBoardTemplates={
                            mutatePrivateBoardTemplates
                          }
                          mutatePublicBoardTemplates={
                            mutatePublicBoardTemplates
                          }
                          template={template}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-text-color-muted">
                  <p className="font-semibold text-text-dark-color mb-2">
                    Aucun modèle disponible
                  </p>
                </div>
              )
            ) : // Onglet "La communauté" - Templates publics
            publicBoardTemplates?.length > 0 ? (
              <ul
                className={`flex flex-col gap-3 max-h-[320px] ${
                  publicBoardTemplates?.length > 7
                    ? "overflow-y-scroll pr-1"
                    : ""
                }`}
              >
                {publicBoardTemplates.map((template) => (
                  <li
                    key={template._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex justify-center items-center gap-2 ">
                      <span className="truncate max-w-50 min-w-0">
                        {template.name}
                      </span>
                      {template?.author?.toString() === uid && (
                        <span className="text-small">(vous)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="flex justify-center items-center gap-[5px] h-8 rounded-sm text-small w-20"
                        onClick={(e) =>
                          handleUseBoardTemplate(e, template?._id)
                        }
                      >
                        Utiliser
                      </button>
                      {template?.author?.toString() === uid && (
                        <DropdownManageTemplate
                          handleDeleteBoardTemplate={handleDeleteBoardTemplate}
                          mutatePrivateBoardTemplates={
                            mutatePrivateBoardTemplates
                          }
                          mutatePublicBoardTemplates={
                            mutatePublicBoardTemplates
                          }
                          template={template}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-text-color-muted">
                <p className="font-semibold text-text-dark-color mb-2">
                  Aucun modèle disponible
                </p>
              </div>
            )}
          </>
        </div>
      </div>
      <div
        className="modal-layout"
        onClick={() => setAddBoardTemplate(false)}
      ></div>
    </>
  );
}
