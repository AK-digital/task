import styles from "@/styles/components/popups/usersInfo.module.css";
import { displayPicture } from "@/utils/utils";

export default function UsersInfo({ users, style }) {
  const top = style?.top || "35px";
  const left = style?.left || "4px";
  return (
    <div className={styles.container} style={{ top: top, left: left }}>
      {users.map((user) => (
        <div key={user?._id} className={styles.infoUser}>
          {displayPicture(user, 24, 24)}
          <span className={styles.name}>
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      ))}
    </div>
  );
}
