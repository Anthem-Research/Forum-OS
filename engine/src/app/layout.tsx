import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ForumHeader } from "@/components/ForumHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Forum",
    template: "%s — Forum",
  },
  description: "A quiet network for active work.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ForumHeader />
        {children}
        <footer className="site-footer">
          <span>Forum Plett · working environment</span>
          <span>Private work stays on this device unless you export it.</span>
        </footer>
      </body>
    </html>
  );
}
