import styles from "@/styles/pages/auth.module.css";
export default function AuthLayout({ children }) {
  return (
    <main className={styles.main}>
      {children}
      <span className={styles.footer}>
        Simple as <strong>Clynt</strong>
      </span>
    </main>
  );
}
