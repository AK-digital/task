"use client";
import styles from "@/styles/components/user/no-picture.module.css";
import { useEffect, useState } from "react";

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

  // Initialisation directe avec la valeur stockée
  const getStoredColor = () => {
    if (typeof window !== "undefined") {
      const storedColor = localStorage.getItem("color");
      return storedColor !== null
        ? +storedColor
        : Math.floor(Math.random() * 5);
    }
    return 0; // Valeur par défaut si localStorage n'est pas dispo
  };

  const [color, setColor] = useState(getStoredColor);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedColor = localStorage.getItem("color");
      if (!storedColor) {
        localStorage.setItem("color", color);
      }
    }
  }, [color]);

  return (
    <div
      className={styles.container}
      style={{
        width: width,
        height: height,
      }}
      data-background={}
      suppressHydrationWarning
    >
      <span>{firstName + lastName ?? ""}</span>
    </div>
  );
}
