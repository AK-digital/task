"use server";
import styles from "@/styles/pages/auth.module.css";
import ResetForgotPasswordForm from "@/components/auth/ResetForgotPasswordForm";
import Image from "next/image";

export default async function ForgotPassword({ params }) {
  const { id } = await params;

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

        <ResetForgotPasswordForm resetCode={id} />
      </div>
    </main>
  );
}
