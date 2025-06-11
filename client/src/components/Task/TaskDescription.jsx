import { updateTaskDescription } from "@/api/task";
import moment from "moment";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import Tiptap from "../RichTextEditor/Tiptap";
import { PanelTop } from "lucide-react";
import socket from "@/utils/socket";
import useSWR, { mutate } from "swr";
import { getDrafts } from "@/api/draft";
import { useUserRole } from "@/app/hooks/useUserRole";
import { AuthContext } from "@/context/auth";
import NoPicture from "../User/NoPicture";

import Reactions from "../Reactions/Reactions";
import { isNotEmpty } from "@/utils/utils";
import AttachmentsInfo from "../Popups/AttachmentsInfo";
import { useProjectContext } from "@/context/ProjectContext";

export default function TaskDescription({ project, task, uid }) {
  const { user } = useContext(AuthContext);
  const { mutateTasks } = useProjectContext();
  const fetcher = getDrafts.bind(null, project?._id, task?._id, "description");
  const { data: draft, mutate: mutateDraft } = useSWR(
    `/draft?projectId=${project?._id}&taskId=${task?._id}&type=description`,
    fetcher
  );

  const [isEditing, setIsEditing] = useState(false);
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
    if (draft?.success) {
      setIsEditing(true);
      setDescription(draft?.data?.content);
    }

    if (!draft?.success) {
      setDescription(task?.description?.text);
      setIsEditing(false);
    }
  }, [draft]);

  useEffect(() => {
    if (!draft?.success && !isEditing) {
      setDescription(task?.description?.text);
    }
  }, [task?.description?.text, draft?.success, isEditing]);

  const handleEditDescription = () => {
    if (!isAuthorized) return;

    if (description) {
      if (descriptionAuthor?._id && !isAuthor) {
        return;
      }
    }

    setIsEditing(true);
  };

  const handleRemoveDescription = async () => {
    setPending(true);

    if (!isAuthorized) return;

    const response = await updateTaskDescription(
      task?._id,
      project?._id,
      "",
      [],
      []
    );

    // Handle error
    if (!response?.success) {
      setDescription(task?.description?.text); // Revert optimistic update
      setPending(false);
      return;
    }

    setIsEditing(false);
    setDescription(""); // Optimistic update
    setPending(false);

    // Update description for every guests
    socket.emit("update task", project?._id);
    await mutateTasks();
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="flex items-center gap-2 text-large text-text-dark-color font-medium select-none">
        <PanelTop size={16} className="text-text-color-muted" /> Description
      </span>
      {/* If is editing */}
      {isEditing && (
        <Tiptap
          project={project}
          task={task}
          type="description"
          setEditDescription={setIsEditing}
          description={description}
          setOptimisticDescription={setDescription}
          draft={draft}
          mutateDraft={mutateDraft}
          handleRemoveDescription={handleRemoveDescription}
        />
      )}
      {/* If not editing and description is not empty */}
      {!isEditing && description && (
        <div>
          <div
            className="relative rounded-lg shadow-small p-4 text-normal cursor-pointer bg-secondary"
            onClick={handleEditDescription}
          >
            <div className="flex items-center gap-2 select-none">
              {descriptionAuthor?.picture ? (
                <Image
                  src={descriptionAuthor?.picture || "/default-pfp.webp"}
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
          </div>

          {/* Zone de réactions et actions */}
          <div className="flex items-center justify-between gap-2 mt-2 py-0 px-2">
            {/* Attachments */}
            {isNotEmpty(task?.description?.files) && (
              <AttachmentsInfo attachments={task?.description?.files} />
            )}

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
                  className="bg-transparent text-accent-color p-0 text-small hover:text-accent-color-hover shadow-inherit"
                >
                  Effacer la description
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* If not editing and description empty */}
      {!isEditing && !description && (
        <div
          onClick={handleEditDescription}
          data-role={isAuthorized}
          className="border border-color-border-color py-3 px-6 rounded-lg text-small data-[role=true]:cursor-pointer select-none"
        >
          {isAuthorized ? (
            <p>Ajouter une description</p>
          ) : (
            <p>L'ajout de description est désactivé en tant qu'invité</p>
          )}
        </div>
      )}
    </div>
  );
}
