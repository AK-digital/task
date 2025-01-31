import styles from "@/styles/layouts/private-layout.module.css";
import AuthProvider from "@/app/AuthProvider";
import Header from "@/layouts/Header";
import SideNav from "@/layouts/SideNav";

export default function PrivateLayout({ children }) {
  return (
    <AuthProvider>
      <div className={styles["private-layout"]}>
        <div className={styles["private-layout__aside"]}>
          <SideNav />
        </div>

        <div className={styles["private-layout__main"]}>
          <Header />
          {children}</div>
      </div>
    </AuthProvider>
  );
}
