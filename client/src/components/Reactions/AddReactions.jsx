"use client";
import { useUserRole } from "../../../hooks/useUserRole";
import EmojiPicker from "emoji-picker-react";
import { SmilePlus } from "lucide-react";

export default function AddReactions({
  uid,
  project,
  author,
  onClickFunction,
  showEmojiPicker,
  setShowEmojiPicker,
  type,
}) {
  const canReact = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  const shouldShowReactions =
    type === "editor" || (uid !== author?._id && canReact);

  return (
    <div className="relative top-[0.5px] cursor-pointer">
      {shouldShowReactions && (
        <div className="flex">
          <SmilePlus
            size={25}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-accent-color-dark hover:text-accent-color"
          />
          {showEmojiPicker && (
            <div className="absolute z-2001 top-5 left-3">
              <EmojiPicker
                reactionsDefaultOpen={true}
                height={350}
                width={300}
                onEmojiClick={(emoji) => onClickFunction(emoji.emoji)}
                emojiStyle="native"
                className="rounded-lg!"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
