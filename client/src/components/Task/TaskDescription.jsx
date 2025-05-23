import { updateTaskDescription } from "@/api/task";
import styles from "@/styles/components/task/task-description.module.css";
import moment from "moment";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import Tiptap from "../RichTextEditor/Tiptap";
import { PanelTop } from "lucide-react";
import socket from "@/utils/socket";
import useSWR from "swr";
import { getDrafts } from "@/api/draft";
import { useUserRole } from "@/app/hooks/useUserRole";
import { AuthContext } from "@/context/auth";
import NoPicture from "../User/NoPicture";

import Reactions from "../Reactions/Reactions";
import { isNotEmpty } from "@/utils/utils";
import AttachmentsInfo from "../Popups/AttachmentsInfo";

export default function TaskDescription({ project, task, uid }) {
  const { user } = useContext(AuthContext);
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
  };

  return (
    <div className={styles.container}>
      <span className={styles.title}>
        <PanelTop size={16} /> Description
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
          <div className={styles.preview} onClick={handleEditDescription}>
            <div className={styles.user}>
              {descriptionAuthor?.picture ? (
                <Image
                  src={descriptionAuthor?.picture || "/default-pfp.webp"}
                  width={24}
                  height={24}
                  alt={`Photo de profil de ${descriptionAuthor?.firstName}`}
                  style={{ borderRadius: "50%" }}
                />
              ) : (
                <NoPicture user={descriptionAuthor} width={24} height={24} />
              )}

              <span className={styles.names}>
                {(descriptionAuthor?.firstName || user?.firstName) +
                  " " +
                  (descriptionAuthor?.lastName || user?.lastName)}
              </span>
              {task?.description?.createdAt && (
                <span className={styles.date}>{formattedDate}</span>
              )}
            </div>
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: description }}
            ></div>
          </div>

          {/* Zone de réactions et actions */}
          <div className={styles.informations}>
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
              <div className={styles.actions}>
                <button
                  className={styles.button}
                  data-disabled={pending}
                  disabled={pending}
                  onClick={handleRemoveDescription}
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
          className={styles.empty}
          onClick={handleEditDescription}
          data-role={isAuthorized}
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
