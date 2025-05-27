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

export default function Reactions({
  element,
  project,
  task,
  mutateMessage,
  type,
  editor,
}) {
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
        title: `${user?.firstName} a réagi à votre ${type}`,
        content: `${user?.firstName} a réagi à votre ${type} avec ${emoji}`,
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
    <div className="flex items-center gap-2">
      {isNotEmpty(element?.reactions) &&
        uniqueReactions.map((reaction, idx) => {
          const emoji = reaction?.emoji;
          const total = reaction?.total;
          const users = reaction?.users;

          return (
            <div
              key={idx}
              onClick={() => handleReactionClick(emoji)}
              onMouseEnter={() => setHoveredEmoji(emoji)}
              onMouseLeave={() => setHoveredEmoji(null)}
              title={hasUserReacted ? "Retirer votre réaction" : ""}
              className="relative flex items-center gap-1 p-1 text-center bg-background-secondary-color rounded-sm transition-all duration-200 ease-in-out cursor-pointer hover:shadow-shadow-box-small"
            >
              <span>{emoji}</span>
              <span>{total}</span>
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
