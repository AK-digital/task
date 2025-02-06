export default function BoardHeader({ board }) {
  return (
    <div>
      <div>
        <span>{board?.title}</span>
        <span style={{ backgroundColor: `${board?.colors[0]}` }}></span>
      </div>
    </div>
  );
}
