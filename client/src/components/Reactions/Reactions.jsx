"use client";
import styles from "@/styles/components/reactions/reactions.module.css";
import { groupReactionsByEmoji, isNotEmpty } from "@/utils/utils";
import AddReactions from "./AddReactions";
import socket from "@/utils/socket";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth";
import { updateReactions } from "@/api/message";
import UsersInfo from "../Popups/UsersInfo";
import { mutate } from "swr";
import { updateTaskDescriptionReactions } from "@/api/task";
import { useTranslation } from "react-i18next";

export default function Reactions({
  element,
  project,
  task,
  mutateMessage,
  type,
  editor,
}) {
  const { t } = useTranslation();
  const { uid, user } = useContext(AuthContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState(null);
  const author = element?.author;
  const uniqueReactions = groupReactionsByEmoji(element?.reactions);
  const hasUserReacted = element?.reactions?.some(
    (reaction) => reaction.userId === uid
  );

  async function handleReactionClick(emoji) {
    setShowEmojiPicker(false);

    let response;

    if (type === "message") {
      response = await updateReactions(project?._id, element?._id, emoji);

      if (!response.success) return;

      socket.emit("update message", project?._id);
      await mutateMessage();
    } else if (type === "description") {
      response = await updateTaskDescriptionReactions(
        task?._id,
        project?._id,
        emoji
      );

      if (!response.success) return;

      socket.emit("update task", project?._id);
      await mutate(`/task?projectId=${project?._id}&archived=false`);
    } else if (type === "editor") {
      editor.commands.insertContent(emoji);
      editor.view.focus();
    }

    if (response?.message?.includes("ajoutée")) {
      const messageBody = {
        type: "reaction",
        params: {
          emoji: emoji,
          type: type,
        },
      };

      const link = "/projects/" + project?._id + "/task/" + task?._id;

      socket.emit(
        "create notification",
        user,
        [author?._id],
        messageBody,
        link
      );
    }
  }

  return (
    <div className={styles.container}>
      {isNotEmpty(element?.reactions) &&
        uniqueReactions.map((reaction, idx) => {
          const emoji = reaction?.emoji;
          const total = reaction?.total;
          const users = reaction?.users;

          return (
            <div
              key={idx}
              className={styles.wrapper}
              onClick={() => handleReactionClick(emoji)}
              onMouseEnter={() => setHoveredEmoji(emoji)}
              onMouseLeave={() => setHoveredEmoji(null)}
              title={hasUserReacted ? t("tasks.remove_reaction") : ""}
            >
              <span className={styles.emojiIcon}>{emoji}</span>
              <span className={styles.emojiCount}>{total}</span>
              {/* Affichage des avatars des utilisateurs qui ont réagi */}
              {hoveredEmoji === emoji && <UsersInfo users={users} />}
            </div>
          );
        })}
      <AddReactions
        uid={uid}
        project={project}
        author={author}
        onClickFunction={handleReactionClick}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
      />
    </div>
  );
}
