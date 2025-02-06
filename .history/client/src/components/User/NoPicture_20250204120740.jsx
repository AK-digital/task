import styles from "@/styles/components/user/no-picture.module.css";

export default function NoPicture({ user, width, height }) {
  const firstName = user?.firstName.substring(0, 1);
  const lastName = user?.lastName.substring(0, 1);

  return (
    <div
      className={styles.container}
      style={{
        width: width,
        height: height,
      }}
    >
      <span
        className={styles.container}
        style={{
          width: width,
          height: height,
        }}
      >
        {firstName + lastName ?? ""}
      </span>
    </div>
  );
}
