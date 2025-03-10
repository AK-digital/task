"use client";

import styles from "@/styles/components/tiptap/tiptap.module.css";
import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
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
import { useState } from "react";
import { updateTaskDescription } from "@/api/task";
import socket from "@/utils/socket";
import { saveMessage, updateMessage } from "@/api/message";
import { mutate } from "swr";
import MentionsList from "./MentionsList";

export default function Tiptap({
  project,
  task,
  type,
  setEditDescription,
  optimisticDescription,
  setOptimisticDescription,
  setConvOpen,
  message,
  editMessage,
  mutateMessage,
}) {
  const [pending, setPending] = useState(false);
  const [plainText, setPlainText] = useState("");
  const [isTaggedUsers, setIsTaggedUsers] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [value, setValue] = useState(
    type === "description" ? optimisticDescription : message?.message
  );

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
      Image,
      Dropcursor,
      CodeBlock,
      Code,
      Blockquote,
      Placeholder.configure({
        placeholder: `Entrez votre ${type} et mentionnez les autres avec @`,
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      handleChange(editor);
    },
  });

  if (!editor) {
    return null;
  }

  const handleChange = (editor) => {
    setPlainText(editor.getHTML());
    setValue(editor.getText());
    const text = editor.getText();

    const mentionRegex = /(?:^|\s)@([\w]*)$/;
    const match = mentionRegex.test(text);

    if (match) {
      setIsTaggedUsers(true);
    } else {
      setIsTaggedUsers(false);
    }
  };

  const handleSaveDescription = async () => {
    setPending(true);
    setOptimisticDescription(plainText); // Optimistic update

    const response = await updateTaskDescription(
      task?._id,
      task?.projectId,
      plainText,
      []
    );

    // Handle error
    if (!response?.success) {
      setPlainText("");
      setPending(false);
      return;
    }

    // Reset editor
    setPlainText("");
    setEditDescription(false);
    setPending(false);

    // Update description for every guests
    socket.emit("update task", task?.projectId);
  };

  const handleMessage = async () => {
    setPending(true);

    let response;

    if (!editMessage) {
      response = await saveMessage(task?.projectId, task?._id, plainText, []);
    } else {
      response = await updateMessage(
        message?.projectId,
        message?._id,
        plainText,
        []
      );
    }

    // Handle error
    if (!response?.success) {
      setPlainText("");
      setValue("");
      setPending(false);
      setConvOpen(false);

      return;
    }

    if (!editMessage) {
      await mutate(`/message?projectId=${task?.projectId}&taskId=${task?._id}`);
    } else {
      await mutateMessage();
    }

    // Reset editor
    setPlainText("");
    setValue("");
    setPending(false);
    setConvOpen(false);

    // Update description for every guests
    socket.emit("update message", task?.projectId || message?.projectId);
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

  console.log(value);

  return (
    <>
      <div
        className={styles.container}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
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
        {isTaggedUsers && <MentionsList project={project} />}
      </div>
      <div className={styles.actions}>
        {type === "description" && (
          <button
            className={bricolageGrostesque.className}
            data-disabled={value?.length === 0 || pending}
            disabled={value?.length === 0 || pending}
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
              data-disabled={value?.length === 0 || pending}
              disabled={value?.length === 0 || pending}
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
