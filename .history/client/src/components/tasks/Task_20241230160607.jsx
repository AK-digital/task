export default function Task({ task }) {
  return (
    <li>
      {/* drag icon*/}
      {/* input */}
      <span> {task?.text}</span>
    </li>
  );
}
