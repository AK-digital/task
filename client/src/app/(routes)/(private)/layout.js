"use server";
import styles from "@/styles/layouts/private-layout.module.css";
import AuthProvider from "@/app/AuthProvider";
import SideNav from "@/layouts/SideNav";
import { getProjects } from "@/api/project";

export default async function PrivateLayout({ children }) {
  const projects = await getProjects();
  return (
    <AuthProvider>
      <div className={styles["private-layout"]}>
        <div className={styles["private-layout__aside"]}>
          <SideNav projects={projects} />
        </div>
        <div className={styles["private-layout__main"]}>{children}</div>
      </div>
    </AuthProvider>
  );
}
