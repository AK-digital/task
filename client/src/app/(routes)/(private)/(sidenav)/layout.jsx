"use server";

import styles from "@/styles/layouts/projects-layouts.module.css";
import { getProjects } from "@/api/project";
import Header from "@/layouts/Header";
import SideNav from "@/layouts/SideNav";

export default async function ProjectsLayout({ children }) {
  const projects = await getProjects();

  return (
    <>
      <Header />
      <div className="flex h-full min-h-[calc(100svh-62px)]">
        <SideNav projects={projects} />
        {children}
      </div>
    </>
  );
}
