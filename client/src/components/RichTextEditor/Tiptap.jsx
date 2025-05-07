"use client";

import styles from "@/styles/components/tiptap/tiptap.module.css";
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlock from "@tiptap/extension-code-block";
import Code from "@tiptap/extension-code";
import Blockquote from "@tiptap/extension-blockquote";
import Mention from "@tiptap/extension-mention";
import {
  BoldIcon,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  List,
  ListOrderedIcon,
  Quote,
  Redo2,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2,
} from "lucide-react";
import { bricolageGrostesque } from "@/utils/font";
import { useContext, useEffect, useRef, useState } from "react";
import { updateTaskDescription } from "@/api/task";
import socket from "@/utils/socket";
import { saveMessage, updateMessage } from "@/api/message";
import { mutate } from "swr";
import MentionsList from "./MentionsList";
import { AuthContext } from "@/context/auth";
import { deleteDraft, saveDraft, updateDraft } from "@/api/draft";
import { useDebouncedCallback } from "use-debounce";
import Attachment from "../Attachment/Attachment";
import Reactions from "../Reactions/Reactions";
import { isNotEmpty } from "@/utils/utils";
import AttachmentsInfo from "../Popups/AttachmentsInfo";

export default function Tiptap({
  project,
  task,
  type,
  setEditDescription,
  description,
  setOptimisticDescription,
  setConvOpen,
  message,
  editMessage,
  mutateMessage,
  draft,
  mutateDraft,
}) {
  const [isSent, setIsSent] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const isMessage = type === "message";
  const [attachments, setAttachments] = useState(
    isMessage && message?.files ? message.files : task?.description?.files || []
  );

  const imgRegex = /<img[^>]*>/i;

  // Utilisation de useDebouncedCallback pour sauvegarder le draft avec un délai
  const debouncedHandleDraft = useDebouncedCallback(async (htmlContent) => {
    if (isSent === false) {
      setIsLoadingDraft(true);
      const response = await saveDraft(
        project?._id,
        task?._id,
        type,
        htmlContent
      );

      // Handle error
      if (!response?.success) {
        // If the draft already exists, update it
        if (response?.message === "Draft already exists") {
          if (value?.length <= 0) {
            setPlainText("");
            setValue("");
            await deleteDraft(response?.data?._id, project?._id);
            await mutateDraft();
          } else {
            await updateDraft(response?.data?._id, project?._id, htmlContent);
            await mutateDraft();
          }
        } else {
          setPlainText("");
          setValue("");
          return;
        }
      }

      // If the draft is created successfully, we mutate it
      await mutateDraft();
      setIsLoadingDraft(false);
      setIsDraftSaved(true);
    }
  }, 2000); // Délai de 2 secondes

  const containerRef = useRef(null);
  const { user, uid } = useContext(AuthContext);
  const [pending, setPending] = useState(false);
  const [plainText, setPlainText] = useState(
    message
      ? message?.message || message
      : type === "description"
      ? description
      : ""
  );
  const [isTaggedUsers, setIsTaggedUsers] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [value, setValue] = useState(
    message
      ? message?.message || message
      : type === "description"
      ? description
      : ""
  );

  useEffect(() => {
    if (isDraftSaved) {
      const timer = setTimeout(() => {
        setIsDraftSaved(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isDraftSaved]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Bold,
      Italic,
      Underline,
      Strike,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
      }),
      Image.configure({
        allowBase64: true,
      }),
      Dropcursor,
      CodeBlock,
      Code,
      Blockquote,
      Placeholder.configure({
        placeholder: `Entrez votre ${type} et mentionnez les autres avec @`,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      handleKeyDown: (view, e) => {
        // If the user is tagging someone, prevent the arrow keys from moving the cursor
        if (isTaggedUsers) {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
          }
          if (e.key === "Enter") {
            return true;
          } else {
            return false;
          }
        }
      },
      handlePaste: (view, event) => {
        // Check if the pasted content contains images
        const items = event.clipboardData.items;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          if (item.type.startsWith("image/")) {
            // If it's an image, read it as a URL
            const file = item.getAsFile();
            const reader = new FileReader();

            reader.onload = () => {
              const url = reader.result;

              // Insert the image into the editor
              editor.chain().focus().setImage({ src: url }).run();
            };

            reader.readAsDataURL(file);
            return true; // Prevent default paste behavior
          }
        }
      },
    },
    onUpdate({ editor }) {
      handleChange(editor);
    },
  });

  useEffect(() => {
    // Regex to match all span tags with data-id attribute
    const regex = /<span[^>]*data-id="([^"]*)"[^>]*>.*?<\/span>/g;

    if (plainText) {
      const matchAll = plainText?.matchAll(regex); // Get all matches
      const matches = Array?.from(matchAll); // Set all matches to an array

      setTaggedUsers([]); // Reset taggedUsers

      matches.forEach((match) => {
        const dataId = match[1]; // match[1] is the data-id attribute

        // Checks if the dataId is already in the taggedUsers array
        setTaggedUsers((prev) => {
          if (!prev.includes(dataId)) {
            return [...prev, dataId]; // If not, we add it
          }
          return prev; // Else we return the previous state
        });
      });
    }
  }, [plainText]);

  if (!editor) {
    return null;
  }

  const handleChange = async (editor) => {
    setPlainText(editor.getHTML());
    setValue(editor.getText());
    setIsSent(false);

    const hasImg = imgRegex.test(editor.getHTML());
    if (draft) {
      if (!hasImg && !editor.getText()) {
        await deleteDraft(draft?.data?._id, project?._id);
        setIsSent(true);
      } else {
        debouncedHandleDraft(editor.getHTML());
      }
    }

    // Gérer les mentions - Utiliser la position du curseur pour détecter les mentions
    const { from } = editor.state.selection;

    // Récupérer le texte autour de la position du curseur
    const textBeforeCursor = editor.state.doc.textBetween(
      Math.max(0, from - 20), // Limiter à 20 caractères avant le curseur
      from
    );

    // Vérifier si il y a un @ suivi de caractères avant le curseur
    const mentionRegex = /@(\w*)$/;
    const match = mentionRegex.exec(textBeforeCursor);

    if (match) {
      setIsTaggedUsers(true);

      // Récupérer la position du caret
      const coords = editor.view.coordsAtPos(from);

      // Récupérer la position de l'éditeur
      const editorElement = editor.view.dom.closest(`.${styles.container}`);
      const editorRect = editorElement.getBoundingClientRect();

      // Calculer la position relative à l'éditeur
      setMentionPosition({
        top: coords.top - editorRect.top, // Ajouter un petit décalage pour un meilleur affichage
        left: coords.left - editorRect.left,
      });
    } else {
      setIsTaggedUsers(false);
    }
  };

  function isMeaningfulContent(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return !!temp.textContent.trim(); // retourne true s’il y a du texte non vide
  }

  const handleSaveDescription = async () => {
    const currentAuthor = task?.description?.author;
    const isAuthor = currentAuthor?._id === uid;

    if (currentAuthor && !isAuthor && task?.description?.text) {
      return;
    }

    let finalText = plainText?.trim();

    const isAutoGeneratedText =
      finalText === "Voir pièce jointe" || finalText === "Voir pièces jointes";

    if (!isMeaningfulContent(finalText) || isAutoGeneratedText) {
      if (attachments.length > 1) {
        finalText = "Voir pièces jointes";
      } else if (attachments.length === 1) {
        finalText = "Voir pièce jointe";
      } else {
        finalText = "";
      }

      setPlainText(finalText);
    }

    setPending(true);
    setOptimisticDescription(finalText); // Optimistic update

    if (draft?.success) {
      await deleteDraft(draft?.data?._id, project?._id);
    }

    const response = await updateTaskDescription(
      task?._id,
      task?.projectId,
      finalText,
      taggedUsers,
      attachments
    );

    // Handle error
    if (!response?.success) {
      setPlainText("");
      setPending(false);
      return;
    }

    setIsSent(true);
    await mutate(`/task?projectId=${project?._id}&archived=false`);

    // Update description for every guests
    socket.emit("update task", task?.projectId);

    const message = {
      title: `${user?.firstName} vous a mentionné(e) dans une description`,
      content: `Vous venez d'être mentionné(e) dans une description "${project?.name}".`,
    };
    const link = `/projects/${response?.data?.projectId}/task/${task?._id}`;

    for (const taggedUser of taggedUsers) {
      socket.emit("create notification", user, taggedUser, message, link);
    }

    // Reset editor
    setPlainText("");
    setEditDescription(false);
    setPending(false);
  };

  const handleMessage = async () => {
    setPending(true);
    setConvOpen(false);

    if (draft?.success) {
      await deleteDraft(draft?.data?._id, project?._id);
      await mutateDraft();
    }

    let response;
    let finalText = plainText?.trim();

    const isAutoGeneratedText =
      finalText === "Voir pièce jointe" || finalText === "Voir pièces jointes";

    if (!isMeaningfulContent(finalText) || isAutoGeneratedText) {
      if (attachments.length > 1) {
        finalText = "Voir pièces jointes";
      } else if (attachments.length === 1) {
        finalText = "Voir pièce jointe";
      } else {
        finalText = "";
      }

      setPlainText(finalText);
    }

    if (!editMessage) {
      response = await saveMessage(
        task?.projectId,
        task?._id,
        finalText,
        taggedUsers,
        attachments
      );
    } else {
      response = await updateMessage(
        task?.projectId,
        message?._id,
        finalText,
        taggedUsers,
        attachments
      );
    }

    if (!response?.success) {
      setPlainText("");
      setValue("");
      setPending(false);
      setConvOpen(false);
      return;
    }

    setIsSent(true);

    if (!editMessage) {
      await mutate(`/message?projectId=${task?.projectId}&taskId=${task?._id}`);
    } else {
      await mutateMessage();
    }

    await mutate(`/task?projectId=${project?._id}&archived=false`);

    socket.emit("update message", task?.projectId);
    socket.emit("update task", task?.projectId);

    const messageNotif = {
      title: `${user?.firstName} vous a mentionné(e) dans une conversation`,
      content: `Vous venez d'être mentionné(e) dans une conversation "${project?.name}".`,
    };

    const link = `/projects/${task?.projectId}/task/${task?._id}`;

    for (const taggedUser of taggedUsers) {
      socket.emit("create notification", user, taggedUser, messageNotif, link);
    }

    setPlainText("");
    setValue("");
    setPending(false);
  };

  const handleCancel = (e) => {
    e.preventDefault();

    setConvOpen(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (!editor) return;

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    // Lire chaque fichier image et l'ajouter à l'éditeur
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onload = () => {
          const url = reader.result;
          editor.chain().focus().setImage({ src: url }).run();
        };

        reader.readAsDataURL(file);
      }
    });
  };

  const handleAddImage = () => {
    const url = window.prompt("URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleSetLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    try {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } catch (e) {
      alert(e.message);
    }
  };

  const checkIfDisabled = () => {
    if (isLoadingDraft || pending) return true;

    if (attachments && attachments.length > 0) {
      return false;
    }

    if (plainText && imgRegex.test(plainText)) {
      return false;
    }

    if (!plainText && !value) {
      return true;
    }

    if (value?.length <= 0) {
      return true;
    }

    return false;
  };

  return (
    <>
      <div
        className={styles.container}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        ref={containerRef}
      >
        {/* Barre d'outils */}
        <div className={styles.toolbar}>
          <button onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 size={16} />
          </button>
          <button onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 size={16} />
          </button>

          <div className={styles.separator}></div>

          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 size={16} />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 size={16} />
          </button>

          <div className={styles.separator}></div>

          <button onClick={() => editor.chain().focus().toggleBold().run()}>
            <BoldIcon size={16} />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}>
            <ItalicIcon size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon size={16} />
          </button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()}>
            <StrikethroughIcon size={16} />
          </button>
          <div className={styles.separator}></div>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrderedIcon size={16} />
          </button>

          <div className={styles.separator}></div>

          <button onClick={handleSetLink}>
            <LinkIcon size={16} />
          </button>
          <button onClick={handleAddImage}>
            <ImageIcon size={16} />
          </button>
          <div className={styles.separator}></div>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code2 size={16} />
          </button>
        </div>
        {/* Contenu de l'éditeur */}
        <EditorContent editor={editor} className={styles.content} />
        {isTaggedUsers && (
          <MentionsList
            project={project}
            mentionPosition={mentionPosition}
            editor={editor}
            setIsTaggedUsers={setIsTaggedUsers}
          />
        )}
        {isLoadingDraft && (
          <div className={styles.draft}>
            <span>Brouillon en cours d'enregistrement...</span>
          </div>
        )}
        {isDraftSaved && !isLoadingDraft && (
          <div className={styles.draft}>
            <span>Brouillon enregistré</span>
          </div>
        )}
        <div className={styles.footer}>
          <Attachment setAttachments={setAttachments} />
          {isNotEmpty([...attachments]) && (
            <AttachmentsInfo attachments={attachments} />
          )}
          {!isNotEmpty([...attachments]) && (
            <Attachment
              setAttachments={setAttachments}
              label="Ajouter une pièce jointe"
            />
          )}
          <Reactions
            element={message}
            project={project}
            task={task}
            mutateMessage={mutateMessage}
            type={"message"}
          />
        </div>
      </div>
      <div className={styles.actions}>
        {type === "description" && (
          <button
            className={bricolageGrostesque.className}
            data-disabled={checkIfDisabled()}
            disabled={checkIfDisabled()}
            onClick={handleSaveDescription}
          >
            Enregistrer la description
          </button>
        )}
        {type === "message" && (
          <>
            <button
              className={`${bricolageGrostesque.className} ${styles.cancel}`}
              onClick={handleCancel}
            >
              Annuler
            </button>
            <button
              className={bricolageGrostesque.className}
              data-disabled={checkIfDisabled()}
              disabled={checkIfDisabled()}
              onClick={handleMessage}
            >
              {editMessage ? "Modifier" : "Envoyer"} le message
            </button>
          </>
        )}
      </div>
    </>
  );
}
