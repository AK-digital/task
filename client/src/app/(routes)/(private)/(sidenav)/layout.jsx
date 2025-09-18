"use client";
import Header from "@/layouts/Header";
import SideNav from "@/layouts/SideNav";
import { ViewProvider } from "@/context/ViewContext";

export default function ProjectsLayout({ children }) {
  return (
    <ViewProvider>
      <Header />
      <div className="flex h-full min-h-[calc(100svh-62px)]">
        <SideNav />
        {children}
      </div>
    </ViewProvider>
  );
}
