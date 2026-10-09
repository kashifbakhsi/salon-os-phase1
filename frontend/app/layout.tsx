import type { Metadata } from "next";

import "./globals.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

export const metadata: Metadata = {
  title: "SalonOS",
  description:
    "Smart salon booking and management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
  <ThemeProvider>
    <Navbar />

    <main>{children}</main>
    <Footer />
  </ThemeProvider>
</AuthProvider>
      </body>
    </html>
  );
}