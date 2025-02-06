"use client";
import styles from "@/styles/pages/profil.module.css";
import { AuthContext } from "@/context/auth";
import { useContext } from "react";

export default function Profil() {
  const { user } = useContext(AuthContext);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <form action="">
          {/* picture */}
          <div></div>
          <div></div>
          <div></div>
        </form>
      </div>
    </main>
  );
}
