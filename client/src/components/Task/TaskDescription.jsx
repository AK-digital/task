import { updateTaskDescription } from "@/api/task";
import { updateSubtaskDescription } from "@/api/subtask";
import moment from "moment";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import Tiptap from "../RichTextEditor/Tiptap";
import { ClipboardCheck, PanelTop } from "lucide-react";
import socket from "@/utils/socket";
import useSWR, { mutate } from "swr";
import { getDrafts } from "@/api/draft";
import { useUserRole } from "../../../hooks/useUserRole";
import { AuthContext } from "@/context/auth";
import NoPicture from "../User/NoPicture";

import Reactions from "../Reactions/Reactions";
import { isNotEmpty } from "@/utils/utils";
import AttachmentsInfo from "../Popups/AttachmentsInfo";

export default function TaskDescription({
  project,
  task,
  uid,
  showPreviewImageMessage,
  setShowPreviewImageMessage,
  edit,
  setEdit,
}) {
  const { user } = useContext(AuthContext);
  const draftTaskId = task?.isSubtask ? (task?.taskId?._id || task?.taskId) : task?._id;
  const fetcher = getDrafts.bind(null, project?._id, draftTaskId, "description");
  const { data: draft, mutate: mutateDraft } = useSWR(
    `/draft?projectId=${project?._id}&taskId=${draftTaskId}&type=description`,
    fetcher
  );

  const [pending, setPending] = useState(false);
  const [description, setDescription] = useState(task?.description?.text);

  const descriptionAuthor = task?.description?.author;
  const isAuthor = descriptionAuthor?._id === uid;
  const isAuthorized = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  const date = moment(task?.description?.createdAt);
  const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");

  useEffect(() => {
    // Toujours afficher la vraie description sauvegardée, pas le contenu du draft
    setDescription(task?.description?.text);

    // Ne pas ouvrir l'éditeur automatiquement même s'il y a un draft
    if (!draft?.success) {
      setEdit("");
    }
  }, [draft, task?.description?.text]);

  const handleEditDescription = () => {
    if (!isAuthorized) return;

    if (description) {
      if (descriptionAuthor?._id && !isAuthor) {
        return;
      }
    }

    setEdit("description");
  };

  const handleRemoveDescription = async () => {
    setPending(true);

    if (!isAuthorized) return;

    let response;
    if (task?.isSubtask) {
      response = await updateSubtaskDescription(task?._id, "");
    } else {
      response = await updateTaskDescription(
        task?._id,
        project?._id,
        "",
        [],
        []
      );
    }

    // Handle error
    if (!response?.success) {
      setDescription(task?.description?.text); // Revert optimistic update
      setPending(false);
      return;
    }

    setEdit("");
    setDescription(""); // Optimistic update
    setPending(false);

    // Update description for every guests
    socket.emit("update task", project?._id);
    await mutate(`/task?projectId=${project?._id}&archived=false`);
  };

  return (
    <div className="flex flex-col gap-3 mb-4">
      <span className="flex items-center gap-2 text-large text-text-dark-color font-medium select-none">
        <PanelTop size={16} className="text-text-color-muted" /> Description
      </span>
      {/* If is editing */}
      {edit === "description" && (
        <Tiptap
          project={project}
          task={task}
          type="description"
          setEditDescription={setEdit}
          description={description}
          setOptimisticDescription={setDescription}
          draft={draft}
          mutateDraft={mutateDraft}
          handleRemoveDescription={handleRemoveDescription}
          showPreviewImageMessage={showPreviewImageMessage}
          setShowPreviewImageMessage={setShowPreviewImageMessage}
        />
      )}
      {/* If not editing and description is not empty */}
      {edit !== "description" && description && (
        <div>
          <div
            className="relative flex flex-col gap-3.5 rounded-lg shadow-small p-4 text-normal cursor-pointer bg-secondary"
            onClick={handleEditDescription}
          >
            <div className="flex items-center gap-2 select-none">
              {descriptionAuthor?.picture ? (
                <Image
                  src={
                    descriptionAuthor?.picture || "/default/default-pfp.webp"
                  }
                  width={24}
                  height={24}
                  alt={`Photo de profil de ${descriptionAuthor?.firstName}`}
                  className="rounded-full max-h-6 max-w-6"
                />
              ) : (
                <NoPicture user={descriptionAuthor} width={24} height={24} />
              )}

              <span>
                {(descriptionAuthor?.firstName || user?.firstName) +
                  " " +
                  (descriptionAuthor?.lastName || user?.lastName)}
              </span>
              {task?.description?.createdAt && (
                <span className="text-xs text-text-color-muted">
                  {formattedDate}
                </span>
              )}
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: description }}
              className="content_TaskDescription mt-3 font-light text-normal"
            ></div>
            {isNotEmpty(task?.description?.files) && (
              <AttachmentsInfo
                attachments={task?.description?.files}
                showPreviewImageMessage={showPreviewImageMessage}
                setShowPreviewImageMessage={setShowPreviewImageMessage}
              />
            )}
            {task?.description?.files?.length > 0 && (
              <p className="text-sm text-gray-600">
                {task?.description?.files.length} fichier
                {task?.description?.files.length > 1 ? "s" : ""} joint
                {task?.description?.files.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Zone de réactions et actions */}
          <div className="flex items-center justify-between gap-2 mt-2 py-0 px-2">
            {/* Attachments */}

            {/* Réactions */}
            <Reactions
              element={task?.description}
              project={project}
              task={task}
              type={"description"}
            />

            {/* Actions (supprimer la description) */}
            {isAuthor && isAuthorized && (
              <div className="flex justify-end mr-3">
                <button
                  data-disabled={pending}
                  disabled={pending}
                  onClick={handleRemoveDescription}
                  className="bg-transparent text-accent-color p-0 text-small hover:text-accent-color-hover shadow-inherit hover:shadow-none"
                >
                  Effacer la description
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* If not editing and description empty */}
      {edit !== "description" && !description && (
        <div
          onClick={handleEditDescription}
          data-role={isAuthorized}
          className="flex justify-between items-center border border-color-border-color py-3 px-4 rounded-lg text-small data-[role=true]:cursor-pointer select-none"
        >
          {isAuthorized ? (
            <p>Ajouter une description</p>
          ) : (
            <p>L'ajout de description est désactivé en tant qu'invité</p>
          )}
          {draft?.success && (
            <div className="flex items-center gap-2">
              <ClipboardCheck size={16} className="text-text-color-muted" />
              <p className="text-xs text-text-color-muted">
                Brouillon sauvegardé
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
