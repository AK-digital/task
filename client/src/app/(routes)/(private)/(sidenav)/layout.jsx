"use server";
import styles from "@/styles/layouts/projects-layouts.module.css";
import Header from "@/layouts/Header";
import SideNav from "@/layouts/SideNav";

export default async function ProjectsLayout({ children }) {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <SideNav />
        {children}
      </div>
    </>
  );
}
