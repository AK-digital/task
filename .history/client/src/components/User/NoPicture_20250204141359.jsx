"use client";
import { useEffect, useState } from "react";
import styles from "@/styles/components/user/no-picture.module.css";

const backgroundColors = [
  "#52796F",
  "#4361EE",
  "#F77F00",
  "#D62828",
  "#4F772D",
];

export default function NoPicture({ user, width, height }) {
  const [bgColor, setBgColor] = useState(backgroundColors[0]);
  const firstName = user?.firstName?.substring(0, 1) || "";
  const lastName = user?.lastName?.substring(0, 1) || "";
  const initials = `${firstName}${lastName}`;

  useEffect(() => {
    const savedColor = localStorage.getItem(`bgColor-${initials}`);
    if (savedColor) {
      setBgColor(savedColor);
    } else {
      const randomColor =
        backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
      setBgColor(randomColor);
      localStorage.setItem(`bgColor-${initials}`, randomColor);
    }
  }, [initials]);

  return (
    <div
      className={styles.container}
      style={{
        width: width,
        height: height,
        backgroundColor: bgColor,
      }}
      suppressHydrationWarning
    >
      <span>{initials}</span>
    </div>
  );
}
