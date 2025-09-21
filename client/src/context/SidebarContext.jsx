"use client";
import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [showStatusSidebar, setShowStatusSidebar] = useState(false);
  const [showPrioritySidebar, setShowPrioritySidebar] = useState(false);

  const openStatusSidebar = () => setShowStatusSidebar(true);
  const closeStatusSidebar = () => setShowStatusSidebar(false);
  const openPrioritySidebar = () => setShowPrioritySidebar(true);
  const closePrioritySidebar = () => setShowPrioritySidebar(false);

  return (
    <SidebarContext.Provider
      value={{
        showStatusSidebar,
        showPrioritySidebar,
        openStatusSidebar,
        closeStatusSidebar,
        openPrioritySidebar,
        closePrioritySidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}



