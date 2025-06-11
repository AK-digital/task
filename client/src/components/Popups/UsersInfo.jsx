import DisplayPicture from "../User/DisplayPicture";

export default function UsersInfo({ users, style }) {
  const top = style?.top || "35px";
  const left = style?.left || "4px";
  return (
    <div style={{ top: top, left: left }} className="container_UsersInfo absolute flex flex-col max-h-[calc(5*40px)] overflow-y-auto top-[35px] left-1 bg-secondary rounded-sm shadow-small z-2001 p-2 gap-2">
      {users.map((user) => (
        <div key={user?._id} className="flex items-center gap-[0.2rem]">

          <DisplayPicture
            user={user}
            isPopup={false}
            style={{ width: "24px", height: "24px" }}
            className="rounded-full"
          />

          <span className="text-[0.85rem] text-text-color-muted whitespace-nowrap">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      ))}
    </div>
  );
}
