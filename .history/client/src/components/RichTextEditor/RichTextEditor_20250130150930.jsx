"use client";
import dynamic from "next/dynamic";
import styles from "@/styles/components/richTextEditor/richTextEditor.module.css";
import { updateDescription } from "@/api/task";
import { instrumentSans } from "@/utils/font";
import { useState, useRef, useEffect } from "react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { saveMessage, updateMessage } from "@/api/message";
import { mutate } from "swr";
import TaggedUsersModal from "../Modals/TaggedUsersModal";

export default function RichTextEditor({
  placeholder,
  type,
  task,
  project,
  message,
  edit,
  setEdit,
  setConvLoading,
  setEditDescription,
}) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(message ? message?.message : "");
  const [isTaggedUsers, setIsTaggedUsers] = useState(false);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [getLastWord, setGetLastWord] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const quillRef = useRef(null);

  const isDescription = type === "description";
  const isConversation = type === "conversation";

  const btnMessage = isDescription
    ? "Enregistrer la description"
    : "Envoyer un message";

  function isQuillEmpty(value) {
    return (
      value?.replace(/<(.|\n)*?>/g, "").trim()?.length === 0 &&
      !value?.includes("<img")
    );
  }

  useEffect(() => {
    const lastWordWithoutAt = getLastWord.split("@")[1];
    if (!lastWordWithoutAt) {
      setFilteredGuests([]);
      return;
    }

    const filtered = project?.guests?.filter((guest) => {
      const searchTerm = lastWordWithoutAt.toLowerCase();
      return (
        guest?.firstName?.toLowerCase().includes(searchTerm) ||
        guest?.lastName?.toLowerCase().includes(searchTerm)
      );
    });

    setFilteredGuests(filtered);
  }, [getLastWord]);

  function handleKeydown(e) {
    if (!content.includes("@")) {
      setIsTaggedUsers(false);
    }
    if (e.key === "@") {
      setIsTaggedUsers(true);
      getMentionPosition();
    } else if (e.key === " ") {
      setIsTaggedUsers(false);
    }
  }

  function getMentionPosition() {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const selection = editor.getSelection();
    if (selection) {
      const bounds = editor.getBounds(selection.index);
      setMentionPosition({ top: bounds.top, left: bounds.left + 20 });
    }
  }

  function handleInsertMention(guest) {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const selection = editor.getSelection();
    if (!selection) return;

    const currentPosition = selection.index;
    const textBeforeCaret = editor.getText(0, currentPosition);
    const lastAtSymbol = textBeforeCaret.lastIndexOf("@");

    if (lastAtSymbol !== -1) {
      editor.deleteText(lastAtSymbol, currentPosition - lastAtSymbol);
    }

    const mentionText = `@${guest.firstName} ${guest.lastName} `;
    editor.insertText(lastAtSymbol, mentionText, "bold", true);
    editor.setSelection(lastAtSymbol + mentionText.length);

    setTaggedUsers((prev) => [...prev, guest._id]);
    setIsTaggedUsers(false);
  }

  return (
    <>
      <div className={styles.reactQuill}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          placeholder={placeholder}
          value={content}
          onChange={(value) => setContent(value)}
          onKeyDown={handleKeydown}
        />
        {isTaggedUsers && (
          <TaggedUsersModal
            filteredGuests={filteredGuests}
            mentionPosition={mentionPosition}
            handleInsertMention={handleInsertMention}
          />
        )}
      </div>

      <div className={styles.buttons}>
        <button disabled={loading} onClick={() => {}}>
          {btnMessage}
        </button>
        <button onClick={() => setEditDescription(false)}>Annuler</button>
      </div>
    </>
  );
}
