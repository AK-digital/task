import styles from "@/styles/components/popups/usersInfo.module.css";
import Image from "next/image";

export default function UsersInfo({ users }) {
  return (
    <>
      {users.slice(0, 3).map((user, index) => (
        <div key={index} className={styles.infoUser}>
          <Image
            src={user?.picture || "/default-pfp.webp"}
            width={24}
            height={24}
            alt={"Photo de profil de " + user?.firstName}
            style={{ borderRadius: "50%" }}
          />
        </div>
      ))}
      {users.length > 3 && (
        <div className={styles.moreInfos}>+{users.length - 3}</div>
      )}
    </>
  );
}
