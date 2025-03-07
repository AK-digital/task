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
import { useState } from "react";

export default function Tiptap() {
  const [value, setValue] = useState("");

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
      Mention.configure({
        HTMLAttributes: {
          class: styles.mention,
        },
      }),
      Placeholder.configure({
        placeholder: "Entrez votre message et mentionnez les autres avec @",
      }),
    ],
    onUpdate({ editor }) {
      setValue(editor.getText());
    },
  });

  if (!editor) {
    return null;
  }
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
      </div>
      <div className={styles.submit}>
        <button
          className={bricolageGrostesque.className}
          data-disabled={value.length === 0}
          disabled={value.length === 0}
        >
          Envoyer le message
        </button>
      </div>
    </>
  );
}
