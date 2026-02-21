import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DDBA Local Delivery OS",
  description: "Local delivery operations system for restaurants",
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
