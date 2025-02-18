"use client";
import SendResetCodeForm from "@/components/auth/SendResetCodeForm";
import styles from "@/styles/pages/auth.module.css";
import Image from "next/image";

export default function ForgotPassword() {
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

        <SendResetCodeForm />
      </div>
    </main>
  );
}
