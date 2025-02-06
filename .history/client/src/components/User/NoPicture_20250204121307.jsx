import styles from "@/styles/components/user/no-picture.module.css";

export default function NoPicture({ user, width, height }) {
  const firstName = user?.firstName.substring(0, 1);
  const lastName = user?.lastName.substring(0, 1);

  const backgroundColors = ["#"];

  function getRandomColor() {
    const selectedColor = Math.random();
  }

  return (
    <div
      className={styles.container}
      style={{
        width: width,
        height: height,
      }}
    >
      <span>{firstName + lastName ?? ""}</span>
    </div>
  );
}
