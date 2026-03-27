"use client";

import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Background } from "@/components/ui/Background";
import { Sidebar } from "@/components/ui/Sidebar";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Background />
      <Sidebar />
      <main style={{
        marginLeft: 224,
        minHeight: "100vh",
        padding: "2.5rem 2.5rem 4rem",
        position: "relative",
        zIndex: 1,
      }}>
        {children}
      </main>
    </ThemeProvider>
  );
}