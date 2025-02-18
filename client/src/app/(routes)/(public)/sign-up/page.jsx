"use client";
import styles from "@/styles/pages/auth.module.css";
import SignUp from "@/components/auth/SignUp";
import Image from "next/image";

export default function Auth() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Image
          src={"/task-logo.svg"}
          width={100}
          height={50}
          alt="Logo de Täsk"
          className={styles.logo}
        />
        <SignUp />
      </div>
    </main>
  );
}
