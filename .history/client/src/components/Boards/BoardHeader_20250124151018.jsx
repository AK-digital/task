export default function BoardHeader({ board }) {
  return (
    <div>
      <div>
        <span>{board?.title}</span>
        <span></span>
      </div>
    </div>
  );
}
