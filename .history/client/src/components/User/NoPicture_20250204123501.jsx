"use client";
import styles from "@/styles/components/user/no-picture.module.css";
import { useState } from "react";

export default function NoPicture({ user, width, height }) {
  const [color, setColor] = useState(0);
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
    if (typeof window !== "undefined") {
      const item = localStorage.getItem("color");

      if (item) {
        setColor(+item);
        return;
      }

      const number = Math.floor(Math.random() * 5);
      localStorage.setItem("color", number);

      setColor(+number);
    }
  }

  return (
    <div
      className={styles.container}
      style={{
        width: width,
        height: height,
        backgroundColor: backgroundColors[color],
      }}
    >
      <span>{firstName + lastName ?? ""}</span>
    </div>
  );
}
