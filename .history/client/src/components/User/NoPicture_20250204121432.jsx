import styles from "@/styles/components/user/no-picture.module.css";

export default function NoPicture({ user, width, height }) {
  const firstName = user?.firstName.substring(0, 1);
  const lastName = user?.lastName.substring(0, 1);

  const backgroundColors = [
    "#B8E0D2",
    "#AFCBFF",
    "#FFD6A5",
    "#FFABAB",
    "#D9E76C",
  ];

  function getRandomColor() {
    return Math.floor(Math.random() * 4);
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
