import { updateTaskDescription } from "@/api/task";
import { AuthContext } from "@/context/auth";
import styles from "@/styles/components/tasks/task-description.module.css";
import moment from "moment";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import Tiptap from "../RichTextEditor/Tiptap";
import { PanelTop } from "lucide-react";
import socket from "@/utils/socket";
import useSWR from "swr";
import { getDrafts } from "@/api/draft";

export default function TaskDescription({ project, task }) {
  const fetcher = getDrafts.bind(null, project?._id, task?._id, "description");
  const { data: draft, mutate } = useSWR(
    `/draft?projectId=${project?._id}&taskId=${task?._id}&type=description`,
    fetcher
  );

  const { uid } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [description, setDescription] = useState(task?.description?.text);

  const descriptionAuthor = task?.description?.author;
  const isAuthor = descriptionAuthor?._id === uid;

  const date = moment(task?.description?.createdAt);
  const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");

  useEffect(() => {
    mutate();
    if (draft?.success) {
      setIsEditing(true);
      setDescription(draft?.data?.content);
    }
  }, [draft]);

  const handleEditDescription = () => {
    if (descriptionAuthor?._id && !isAuthor) {
      return;
    }

    setIsEditing(true);
  };

  const handleRemoveDescription = async () => {
    setPending(true);

    const response = await updateTaskDescription(
      task?._id,
      task?.projectId,
      "",
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
          mutateDraft={mutate}
        />
      )}
      {/* If not editing and description is not empty */}
      {!isEditing && description && (
        <div>
          <div className={styles.preview} onClick={handleEditDescription}>
            <div className={styles.user}>
              <Image
                src={descriptionAuthor?.picture || "/default-pfp.webp"}
                width={24}
                height={24}
                alt={`Photo de profil de ${descriptionAuthor?.firstName}`}
                style={{ borderRadius: "50%" }}
              />
              <span className={styles.names}>
                {descriptionAuthor?.firstName +
                  " " +
                  descriptionAuthor?.lastName}
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
          {isAuthor && (
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
      )}
      {/* If not editing and description empty */}
      {!isEditing && !description && (
        <div className={styles.empty} onClick={handleEditDescription}>
          <p>Ajouter une description</p>
        </div>
      )}
    </div>
  );
}
