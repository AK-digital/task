"use client";
import { useEffect, useState } from "react";
import styles from "@/styles/components/user/no-picture.module.css";

export default function NoPicture({ user, width, height }) {
  const firstName = user?.firstName?.substring(0, 1) || "";
  const lastName = user?.lastName?.substring(0, 1) || "";
  const initials = `${firstName}${lastName}`;

  const backgroundColors = [
    "#52796F",
    "#4361EE",
    "#F77F00",
    "#D62828",
    "#4F772D",
  ];

  const [bgColor, setBgColor] = useState(backgroundColors[0]);

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
