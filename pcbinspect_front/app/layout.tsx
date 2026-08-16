import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { Noto_Sans, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "PCBInspect",
  description: "Dashboard d'inspection de cartes électroniques",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={cn("h-full antialiased", "font-sans", notoSans.variable, playfairDisplayHeading.variable)}>
      <body className="h-full bg-surface font-sans">
        <AuthProvider>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}