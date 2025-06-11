"use client";
import { useUserRole } from "@/app/hooks/useUserRole";
import EmojiPicker from "emoji-picker-react";
import { SmilePlus } from "lucide-react";

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
    <div className="relative top-[0.5px] cursor-pointer">
      {uid !== author?._id && canReact && (
        <div className="flex">
          <SmilePlus
            size={16}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
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
