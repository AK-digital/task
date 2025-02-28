import styles from "@/styles/pages/auth.module.css";
export default function AuthLayout({ children }) {
  return (
    <main className={styles.main}>
      {children}
      <span className={styles.footer}>
        Simple as <strong>täsk</strong>
      </span>
    </main>
  );
}
