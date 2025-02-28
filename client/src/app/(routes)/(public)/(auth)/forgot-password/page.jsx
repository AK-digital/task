"use client";
import SendResetCodeForm from "@/components/auth/SendResetCodeForm";
import styles from "@/styles/pages/auth.module.css";

export default function ForgotPassword() {
  return (
    <div className={styles.container}>
      <SendResetCodeForm />
    </div>
  );
}
