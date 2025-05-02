"use client";
import styles from "@/styles/components/reactions/addReactions.module.css";
import { useUserRole } from "@/app/hooks/useUserRole";
import { AuthContext } from "@/context/auth";
import EmojiPicker from "emoji-picker-react";
import { SmilePlus } from "lucide-react";
import { useContext, useState } from "react";

export default function AddReactions({
  uid,
  project,
  author,
  onClickFunction,
  showEmojiPicker,
  setShowEmojiPicker,
}) {
  const canReact = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  return (
    <div className={styles.container}>
      {uid !== author?._id && canReact && (
        <div className={styles.wrapper}>
          <SmilePlus
            size={16}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          />
          {showEmojiPicker && (
            <div className={styles.emojiPicker}>
              <EmojiPicker
                reactionsDefaultOpen={true}
                height={350}
                width={300}
                className={styles.reactionEmojiPicker}
                onEmojiClick={(emoji) => onClickFunction(emoji.emoji)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
