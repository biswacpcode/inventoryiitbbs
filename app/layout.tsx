import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/shared/Navbar";
import Developer from "@/components/shared/Developer";
import { NextAuthProvider } from "@/providers/next-auth-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vault IIT BBS",
  description:
    "The online Inventory Management System of Students' Gymkhana, IIT Bhubaneswar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <Developer/>
          {children}
        </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
