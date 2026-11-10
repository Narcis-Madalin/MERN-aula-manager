import React, { createContext, useState, useContext } from "react";

// Creează contextul
const SidebarContext = createContext();

// Creează un furnizor de context
export const SidebarProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Hook personalizat pentru a folosi contextul
export const useSidebar = () => useContext(SidebarContext);
