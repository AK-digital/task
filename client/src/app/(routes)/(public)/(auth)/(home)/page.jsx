"use client";
import styles from "@/styles/pages/auth.module.css";
import SignIn from "@/components/auth/SignIn";

export default function Auth() {
  return (
    <div className={styles.container}>
      <SignIn />
    </div>
  );
}
