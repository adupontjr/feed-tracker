import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nibble — Baby Feed Tracker",
  description: "Log and track your baby's feeds — quick, simple, and sweet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
