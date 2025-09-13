export default function UsersInfo({ users, style }) {
  const top = style?.top || "-45px";
  const left = style?.left || "50%";
  return (
    <div style={{ top: top, left: left, transform: "translateX(-50%)" }} className="container_UsersInfo absolute flex flex-col max-h-[calc(5*40px)] overflow-y-auto bg-secondary rounded-sm shadow-small z-2001 p-2 gap-2">
      {users.map((user) => (
        <div key={user?._id} className="flex items-center">
          <span className="text-[0.85rem] text-text-color-muted whitespace-nowrap">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      ))}
    </div>
  );
}
