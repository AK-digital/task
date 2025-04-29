import {
  updateTaskDescription,
  updateTaskDescriptionReactions,
} from "@/api/task";
import styles from "@/styles/components/tasks/task-description.module.css";
import moment from "moment";
import Image from "next/image";
import { useContext, useEffect, useState, useRef } from "react";
import Tiptap from "../RichTextEditor/Tiptap";
import { PanelTop, SmilePlus, Eye } from "lucide-react";
import socket from "@/utils/socket";
import useSWR from "swr";
import { getDrafts } from "@/api/draft";
import { useUserRole } from "@/app/hooks/useUserRole";
import { AuthContext } from "@/context/auth";
import EmojiPicker from "emoji-picker-react";
import MessageInfo from "../Popups/UsersInfo";

export default function TaskDescription({ project, task, uid }) {
  const { user } = useContext(AuthContext);
  const fetcher = getDrafts.bind(null, project?._id, task?._id, "description");
  const { data: draft, mutate } = useSWR(
    `/draft?projectId=${project?._id}&taskId=${task?._id}&type=description`,
    fetcher
  );

  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [description, setDescription] = useState(task?.description?.text);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const emojiUsersRef = useRef(null);
  const [hoveredEmoji, setHoveredEmoji] = useState(null);

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

  const groupedReactions =
    task?.description?.reactions?.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction.userId);
      return acc;
    }, {}) || {};

  const userReaction = task?.description?.reactions?.find(
    (reaction) => reaction.userId === uid
  );

  const getUsersByReactionEmoji = (emoji) => {
    return task?.description?.reactions
      ?.filter((reaction) => reaction.emoji === emoji)
      .map((reaction) => {
        if (reaction.userId === user?._id) {
          return user;
        }
        const readUser = task?.readBy?.find((u) => u._id === reaction.userId);
        return readUser || { _id: reaction.userId };
      });
  };

  const hasUserReacted = (emoji) => {
    return userReaction && userReaction.emoji === emoji;
  };

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
    function handleClickOutside(event) {
      if (
        (emojiPickerRef.current &&
          emojiPickerRef.current.contains(event.target)) ||
        (emojiButtonRef.current &&
          emojiButtonRef.current.contains(event.target)) ||
        event.target.closest(".emoji-picker-react")
      ) {
        return;
      }
      setShowEmojiPicker(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditDescription = () => {
    if (!isAuthorized) return;

    if (descriptionAuthor?._id && !isAuthor) {
      return;
    }

    setIsEditing(true);
  };

  const handleRemoveDescription = async () => {
    setPending(true);

    if (!isAuthorized) return;

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

  const handleEmojiSelect = async (emojiData) => {
    const emoji = emojiData.unified;
    try {
      const response = await updateTaskDescriptionReactions(
        task?._id,
        project?._id,
        emoji
      );
      if (response.success) {
        socket.emit("update task", project?._id);
      }
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la réaction :", error);
    }
  };

  const handleReactionClick = async (emoji) => {
    try {
      await updateTaskDescriptionReactions(task?._id, project?._id, emoji);

      socket.emit("update task", project?._id);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réaction :", error);
    }
  };

  const unifiedToEmoji = (unified) => {
    try {
      return String.fromCodePoint(
        ...unified.split("-").map((u) => parseInt("0x" + u))
      );
    } catch (e) {
      return "😊";
    }
  };

  const handleReactionsButtonClick = (e) => {
    e.stopPropagation();
    if (e.target.tagName !== "BUTTON") {
      setShowEmojiPicker(!showEmojiPicker);
    }
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
                src={
                  descriptionAuthor?.picture ||
                  user?.picture ||
                  "/default-pfp.webp"
                }
                width={24}
                height={24}
                alt={`Photo de profil de ${descriptionAuthor?.firstName}`}
                style={{ borderRadius: "50%" }}
              />
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
            {/* Réactions */}
            {Array.isArray(task?.description?.reactions) &&
              task.description.reactions.length > 0 && (
                <div className={styles.emojiReactions}>
                  {Object.entries(groupedReactions).map(([emoji, userIds]) => {
                    const usersForThisEmoji = getUsersByReactionEmoji(emoji);
                    return (
                      <div
                        key={emoji}
                        className={`${styles.emojiReaction} ${
                          hasUserReacted(emoji) ? styles.active : ""
                        }`}
                        onClick={() => handleReactionClick(emoji)}
                        onMouseEnter={() => setHoveredEmoji(emoji)}
                        onMouseLeave={() => setHoveredEmoji(null)}
                        title={
                          hasUserReacted(emoji)
                            ? "Retirer votre réaction"
                            : userReaction
                            ? "Changer votre réaction actuelle"
                            : "Ajouter votre réaction"
                        }
                      >
                        <span className={styles.emojiIcon}>
                          {unifiedToEmoji(emoji)}
                        </span>
                        <span className={styles.emojiCount}>
                          {userIds.length}
                        </span>

                        {hoveredEmoji === emoji &&
                          usersForThisEmoji.length > 0 && (
                            <div
                              className={styles.emojiUsers}
                              ref={emojiUsersRef}
                            >
                              <MessageInfo users={usersForThisEmoji} />
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}

            {/* Bouton ajouter une réaction */}
            <div
              className={styles.reactions}
              ref={emojiButtonRef}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <SmilePlus size={16} />
              {showEmojiPicker && (
                <div className={styles.emojiPicker} ref={emojiPickerRef}>
                  <EmojiPicker
                    reactionsDefaultOpen={true}
                    height={350}
                    width={500}
                    className={styles.reactionEmojiPicker}
                    onEmojiClick={handleEmojiSelect}
                  />
                </div>
              )}
            </div>
          </div>

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
