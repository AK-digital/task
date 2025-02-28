"use client";
import styles from "@/styles/pages/auth.module.css";
import SignUp from "@/components/auth/SignUp";

export default function Auth() {
  return (
    <div className={styles.container}>
      <SignUp />
    </div>
  );
}
