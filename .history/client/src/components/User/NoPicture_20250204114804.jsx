import styles from "@/styles/components/user/no-picture.module.css";

export default function NoPicture({ user, width, height }) {
  const firstName = user?.firstName.substring;
  return (
    <div
      className={styles.container}
      style={{
        width: width,
        height: height,
      }}
    >
      <span></span>
    </div>
  );
}
