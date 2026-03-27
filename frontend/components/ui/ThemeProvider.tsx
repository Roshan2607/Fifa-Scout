"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "cream";

const ThemeContext = createContext<{ theme: Theme; cycle: () => void }>({
  theme: "dark", cycle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("fifu-theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("fifu-theme", theme);
  }, [theme]);

  const cycle = () => setTheme(t => t === "dark" ? "light" : t === "light" ? "cream" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, cycle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);