import styles from "@/styles/components/popups/usersInfo.module.css";
import Image from "next/image";

export default function UsersInfo({ users }) {
  return (
    <div className={styles.popupContainer}>
      {users.map((user) => (
        <div key={user?._id} className={styles.infoUser}>
          <Image
            src={user?.picture || "/default-pfp.webp"}
            width={24}
            height={24}
            alt={`Photo de profil de ${user?.firstName}`}
            className={styles.profileImage}
          />
          <span className={styles.name}>
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      ))}
    </div>
  );
}
