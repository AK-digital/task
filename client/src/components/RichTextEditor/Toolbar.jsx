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

export default function Toolbar({ editor }) {
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

  return (
    <div className="toolbar_Tiptap flex items-center p-2 bg-white border-b border-[#ddd] rounded-t-lg rounded-b-none">
      <button onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={16} />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={16} />
      </button>

      <div className="w-[1px] h-6 bg-third my-0 mx-2"></div>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={16} />
      </button>

      <div className="w-[1px] h-6 bg-third my-0 mx-2"></div>

      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        <BoldIcon size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}>
        <ItalicIcon size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()}>
        <StrikethroughIcon size={16} />
      </button>
      <div className="w-[1px] h-6 bg-third my-0 mx-2"></div>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrderedIcon size={16} />
      </button>

      <div className="w-[1px] h-6 bg-third my-0 mx-2"></div>

      <button onClick={handleSetLink}>
        <LinkIcon size={16} />
      </button>
      <button onClick={handleAddImage}>
        <ImageIcon size={16} />
      </button>
      <div className="w-[1px] h-6 bg-third my-0 mx-2"></div>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 size={16} />
      </button>
    </div>
  );
}
