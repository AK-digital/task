import styles from "@/styles/components/popups/usersInfo.module.css";
import DisplayPicture from "../User/DisplayPicture";

export default function UsersInfo({ users, style }) {
  const top = style?.top || "35px";
  const left = style?.left || "4px";
  return (
    <div className={styles.container} style={{ top: top, left: left }}>
      {users.map((user) => (
        <div key={user?._id} className={styles.infoUser}>

          <DisplayPicture
            user={user}
            style={{ width: "24px", height: "24px", borderRadius: "50%" }}
            isPopup={false}
          />

          <span className={styles.name}>
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      ))}
    </div>
  );
}
