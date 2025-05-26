import styles from "@/styles/components/popups/usersInfo.module.css";
import Image from "next/image";

export default function UsersInfo({ users }) {
  return (
    <div className="container_UsersInfo absolute flex flex-col max-h-[calc(5*40px)] overflow-y-auto top-[35px] left-1 bg-background-secondary-color rounded-sm shadow-shadow-box-small z-2001 p-2 gap-2">
      {users.map((user) => (
        <div key={user?._id} className="flex items-center gap-[0.2rem]">
          <Image
            src={user?.picture || "/default-pfp.webp"}
            width={24}
            height={24}
            alt={`Photo de profil de ${user?.firstName}`}
            className="rounded-full shrink-0 max-h-[24px]"
          />
          <span className="text-[0.85rem] text-text-color-muted whitespace-nowrap">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      ))}
    </div>
  );
}
