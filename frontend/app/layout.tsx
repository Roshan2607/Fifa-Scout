import type { Metadata } from "next";
import "./globals.css";
import { ClientShell } from "@/components/ui/ClientShell";

export const metadata: Metadata = {
  title: "FIFU — ML Football Scouting",
  description: "ML-powered football scouting. Greatness prediction, clustering, chemistry fit, and player valuation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}