export default function Task({ task }) {
  return (
    <li>
      {/* drag icon*/}
      {/* input */}
      <input type="text" name="text" id="text" defaultValue={task?.text} />
    </li>
  );
}
