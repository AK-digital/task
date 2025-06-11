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

export function tiptapOptions(type, value, isTaggedUsers, handleChange) {
  return {
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
  };
}
