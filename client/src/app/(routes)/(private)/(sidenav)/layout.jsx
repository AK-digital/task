"use server";
import Header from "@/layouts/Header";
import SideNav from "@/layouts/SideNav";

export default async function ProjectsLayout({ children }) {
  return (
    <>
      <Header />
      <div className="flex h-full min-h-[calc(100svh-62px)]">
        <SideNav />
        {children}
      </div>
    </>
  );
}
