import type { Metadata } from "next";
import { UserProvider } from "@/context/UserContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ajaia Docs Lite",
  description: "A lightweight collaborative document editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
