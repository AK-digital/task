"use client";
import dynamic from "next/dynamic";
import styles from "@/styles/components/richTextEditor/richTextEditor.module.css";
import { updateDescription } from "@/api/task";
import { instrumentSans } from "@/utils/font";
import { useState, useRef, useEffect } from "react";
import "react-quill/dist/quill.snow.css";
import { saveMessage, updateMessage } from "@/api/message";
import { mutate } from "swr";
import TaggedUsersModal from "../Modals/TaggedUsersModal";

// Import dynamique de ReactQuill
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    // On importe Quill après le chargement du composant
    if (typeof window !== "undefined") {
      const { Quill } = await import("react-quill-new");

      // Définition du format personnalisé
      let Embed = Quill.import("blots/embed");

      class SpanBlot extends Embed {
        static create(value) {
          const node = super.create();
          node.classList.add(styles.mention);
          node.setAttribute("data-mention", value);
          node.setAttribute("contenteditable", "false"); // Empêche l'édition partielle
          node.innerText = value;
          return node;
        }

        static value(node) {
          return node.getAttribute("data-mention") || node.innerText;
        }

        // Ajouter une méthode pour gérer la suppression
        static formats(node) {
          return {
            mention: node.getAttribute("data-mention"),
          };
        }
      }

      SpanBlot.blotName = "span";
      SpanBlot.tagName = "span";
      SpanBlot.className = styles.mention;

      // Enregistrement du format
      Quill.register("formats/span", SpanBlot);
    }
    return RQ;
  },
  {
    ssr: false,
  }
);

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
  const [isTaggedUsers, setIsTaggedUsers] = useState(false);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [getLastWord, setGetLastWord] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [lastAtPosition, setLastAtPosition] = useState(null);
  const quillRef = useRef(null);

  const isDescription = type === "description";
  const isConversation = type === "conversation";

  const [content, setContent] = useState(
    message ? message?.message : isDescription ? task?.description : ""
  );

  const btnMessage = isDescription
    ? "Enregistrer la description"
    : "Envoyer un message";

  function isQuillEmpty(value) {
    if (
      value?.replace(/<(.|\n)*?>/g, "")?.trim()?.length === 0 &&
      !value?.includes("<img")
    ) {
      return true;
    }
    return false;
  }

  useEffect(() => {
    const lastWordWithoutAt = getLastWord.split("@")[1];
    // Si pas de texte après le @, on ne fait rien
    if (!lastWordWithoutAt) {
      setFilteredGuests([]);
      return;
    }

    // Filtrer les invités existants sans modifier projectGuests
    const filtered = project?.guests?.filter((guest) => {
      const searchTerm = lastWordWithoutAt.toLowerCase();
      const firstName = guest?.firstName?.toLowerCase() || "";
      const lastName = guest?.lastName?.toLowerCase() || "";

      return firstName.includes(searchTerm) || lastName.includes(searchTerm);
    });

    setFilteredGuests(filtered);
  }, [getLastWord]);

  function getMentionPosition() {
    if (!quillRef.current) return;

    const editor = quillRef.current.getEditor();
    const selection = editor.getSelection();

    if (selection) {
      const bounds = editor.getBounds(selection.index);
      setLastAtPosition(selection.index); // Stocker la position du @
      setMentionPosition({
        top: bounds.top + 60,
        left: bounds.left + 20,
      });
    }
  }

  function handleChange(content, delta, source, editor) {
    setContent(content);

    // Si c'est une suppression
    if (delta.ops?.some((op) => op.delete)) {
      const deletedContent = editor.getContents(
        delta.ops[0].retain,
        delta.delete
      );

      // Vérifie si le contenu supprimé contenait une mention
      const hadMention = deletedContent.ops?.some((op) => op.insert?.span);

      if (hadMention) {
        // Extraire l'ID de l'utilisateur à partir du texte de la mention
        // Retirer le @ et trouver l'utilisateur correspondant
        const mentionWithoutAt = mentionText.split(" ")[1];

        const userId = project?.guests?.find(
          (guest) => mentionWithoutAt === guest.firstName || mentionWithoutAt
        )?._id;

        if (userId) {
          // Retirer l'ID de l'utilisateur du tableau taggedUsers
          setTaggedUsers((prev) => prev.filter((id) => id !== userId));
        }
      }
    }
  }

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

  async function handleSendContent() {
    const isEmpty = isQuillEmpty(content);

    setLoading(true);

    if (isDescription) {
      if (isEmpty) {
        await updateDescription(task?._id, task?.projectId, "", []);
      } else {
        await updateDescription(
          task?._id,
          task?.projectId,
          content,
          taggedUsers
        );
      }
      setEditDescription(false);
    }

    if (isConversation) {
      const res = await saveMessage(
        task?.projectId,
        task?._id,
        content,
        taggedUsers
      );

      if (res?.success) {
        await mutate(
          `/message?projectId=${task?.projectId}&taskId=${task?._id}`
        );
      }
    }

    if (isConversation && edit) {
      setConvLoading(true);
      setEdit(false);
      const res = await updateMessage(
        message?.projectId,
        message?._id,
        content,
        taggedUsers
      );
      if (res?.success) {
        await mutate(
          `/message?projectId=${message?.projectId}&taskId=${message?.taskId}`
        );
        setConvLoading(false);
      }
    }
    setTaggedUsers([]);
    setContent("");
    setLoading(false);
  }

  function getWordBeforeCaret() {
    const editor = quillRef?.current?.getEditor();
    if (!editor) return;

    const selection = editor?.getSelection();
    if (!selection) return;

    // Récupérer la position du caret
    const textBeforeCaret = editor?.getText(0, selection?.index);

    // Trouver le dernier mot avant le caret
    const words = textBeforeCaret?.split(/\s+/); // Séparer le texte en mots en utilisant les espaces comme délimiteurs
    const lastWord = words[words?.length - 1]; // Le dernier mot dans le tableau

    setGetLastWord(lastWord);
    return lastWord;
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
      ["span"], // Add span option to toolbar
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "indent",
    "link",
    "image",
    "span",
  ];

  return (
    <>
      {isDescription && (
        <div className={styles.reactQuill}>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            defaultValue={isDescription && task?.description}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeydown}
            onKeyUp={getWordBeforeCaret}
          />
          {isTaggedUsers && (
            <TaggedUsersModal
              project={project}
              filteredGuests={filteredGuests}
              mentionPosition={mentionPosition}
              setTaggedUsers={setTaggedUsers}
              quillRef={quillRef}
              setIsTaggedUsers={setIsTaggedUsers}
              lastAtPosition={lastAtPosition} // Passer la position stockée
            />
          )}
        </div>
      )}
      {isConversation && (
        <div className={styles.reactQuill}>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeydown}
            onKeyUp={getWordBeforeCaret}
          />
          {isTaggedUsers && (
            <TaggedUsersModal
              project={project}
              filteredGuests={filteredGuests}
              mentionPosition={mentionPosition}
              setTaggedUsers={setTaggedUsers}
              quillRef={quillRef}
              setIsTaggedUsers={setIsTaggedUsers}
              lastAtPosition={lastAtPosition} // Passer la position stockée
            />
          )}
        </div>
      )}

      <div className={styles.buttons}>
        <button
          className={instrumentSans.className}
          disabled={loading}
          data-disabled={loading}
          onClick={handleSendContent}
        >
          {btnMessage}
        </button>
        <button
          className={instrumentSans.className}
          onClick={() => {
            setEditDescription(false);
          }}
        >
          Annuler
        </button>
      </div>
    </>
  );
}
