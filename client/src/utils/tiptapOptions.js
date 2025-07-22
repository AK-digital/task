import Dropcursor from "@tiptap/extension-dropcursor";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Mention from "@tiptap/extension-mention";

export function tiptapOptions(
  type,
  value,
  isTaggedUsers,
  handleChange,
  onImagePaste = null
) {
  return {
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      // Extensions NOT included in StarterKit
      Underline,
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
              const { state } = view;
              const { tr } = state;
              const imageNode = state.schema.nodes.image.create({ src: url });
              const paragraphNode = state.schema.nodes.paragraph.create();

              // Insérer l'image puis un paragraphe vide et positionner le curseur
              const transaction = tr
                .replaceSelectionWith(imageNode)
                .insert(tr.selection.to, paragraphNode)
                .setSelection(
                  state.selection.constructor.near(
                    tr.doc.resolve(tr.selection.to)
                  )
                );

              view.dispatch(transaction);

              // Si on a un callback pour gérer l'image collée, l'appeler
              if (onImagePaste && typeof onImagePaste === "function") {
                // Créer un nom de fichier basé sur le timestamp et le type
                const extension = item.type.split("/")[1] || "png";
                const fileName = `image-${Date.now()}.${extension}`;

                // Appeler le callback avec le fichier et l'URL
                onImagePaste(file, fileName, url);
              }
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
