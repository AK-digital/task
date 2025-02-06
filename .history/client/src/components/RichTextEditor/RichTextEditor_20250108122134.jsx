import Quill from "quill";
const options = {
  placeholder: "Hello, World!",
  theme: "snow",
};
const quill = new Quill("#editor", options);
export default function RichTextEditor() {
  return <div></div>;
}
