"use client";
import Header from "@/layouts/Header";
import SideNav from "@/layouts/SideNav";
import { ViewProvider } from "@/context/ViewContext";
import { SideNavProvider } from "@/context/SideNavContext";
import { SidebarProvider } from "@/context/SidebarContext";

export default function ProjectsLayout({ children }) {
  return (
    <SideNavProvider>
      <ViewProvider>
        <SidebarProvider>
          <Header />
          <div className="flex h-full min-h-[calc(100svh-62px)]">
            <SideNav />
            {children}
          </div>
        </SidebarProvider>
      </ViewProvider>
    </SideNavProvider>
  );
}
