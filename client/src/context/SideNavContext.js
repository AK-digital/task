"use client";

import { createContext, useContext, useState } from "react";

const SideNavContext = createContext();

export function SideNavProvider({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <SideNavContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
      {children}
    </SideNavContext.Provider>
  );
}

export function useSideNavContext() {
  const context = useContext(SideNavContext);
  if (!context) {
    throw new Error('useSideNavContext must be used within a SideNavProvider');
  }
  return context;
}
