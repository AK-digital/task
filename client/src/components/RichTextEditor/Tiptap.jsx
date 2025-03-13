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
  const containerRef = useRef(null);
  const { user } = useContext(AuthContext);
  const [pending, setPending] = useState(false);
  const [plainText, setPlainText] = useState(
    message
      ? message?.message
      : type === "description"
      ? optimisticDescription
      : ""
  );
  const [isTaggedUsers, setIsTaggedUsers] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [value, setValue] = useState(
    message
      ? message?.message
      : type === "description"
      ? optimisticDescription
      : ""
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
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
      }),
    ],
    content: value,
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

    const matchAll = plainText.matchAll(regex); // Get all matches
    const matches = Array.from(matchAll); // Set all matches to an array

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
  }, [plainText]);

  if (!editor) {
    return null;
  }

  const handleChange = (editor) => {
    setPlainText(editor.getHTML());
    setValue(editor.getText());
    const text = editor.getText();

    const mentionRegex = /(?:^|\s)@([\w]*)$/;
    const match = mentionRegex.exec(text);

    if (match) {
      setIsTaggedUsers(true);

      // Get caret position
      const { from } = editor.state.selection;
      const coords = editor.view.coordsAtPos(from);

      // Get editor container's position
      const editorElement = editor.view.dom.closest(`.${styles.container}`);
      const editorRect = editorElement.getBoundingClientRect();

      // Calculate position relative to the container
      setMentionPosition({
        top: coords.top - editorRect.top + 20, // Adding a small offset for better positioning
        left: coords.left - editorRect.left,
      });
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
      taggedUsers
    );

    // Handle error
    if (!response?.success) {
      setPlainText("");
      setPending(false);
      return;
    }

    // Update description for every guests
    socket.emit("update task", task?.projectId);

    const message = {
      title: `${user?.firstName} vous a mentionné(e) dans une description`,
      content: `Vous venez d'être mentionné(e) dans une description "${project?.name}".`,
    };
    const link =
      "/projects/" + response?.data?.projectId + "/task/" + task?._id;

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

    let response;

    if (!editMessage) {
      response = await saveMessage(
        task?.projectId,
        task?._id,
        plainText,
        taggedUsers
      );
    } else {
      console.log(message?._id);
      response = await updateMessage(
        task?.projectId,
        message?._id,
        plainText,
        taggedUsers
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

    socket.emit("update message", task?.projectId);

    const messageNotif = {
      title: `${user?.firstName} vous a mentionné(e) dans une conversation`,
      content: `Vous venez d'être mentionné(e) dans une conversation "${project?.name}".`,
    };

    const link = "/projects/" + task?.projectId + "/task/" + task?._id;

    for (const taggedUser of taggedUsers) {
      socket.emit("create notification", user, taggedUser, messageNotif, link);
    }

    // Reset editor
    setPlainText("");
    setValue("");
    setPending(false);
    setConvOpen(false);
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

  const checkIfDisabled = () => {
    const imgRegex = /<img[^>]*>/i;

    if (plainText && imgRegex.test(plainText)) {
      return false;
    }
    if (value?.length <= 0 || pending) {
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
