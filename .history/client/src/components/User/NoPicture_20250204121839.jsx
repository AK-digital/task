"use client";
import styles from "@/styles/components/user/no-picture.module.css";

export default function NoPicture({ user, width, height }) {
  const firstName = user?.firstName.substring(0, 1);
  const lastName = user?.lastName.substring(0, 1);

  const backgroundColors = [
    "#52796F",
    "#4361EE",
    "#F77F00",
    "#D62828",
    "#4F772D",
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
        backgroundColor: backgroundColors[getRandomColor()],
      }}
    >
      <span>{firstName + lastName ?? ""}</span>
    </div>
  );
}
