import type { Metadata } from "next";
import { LayoutShell } from "@/components/ui/LayoutShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "DDBA Local Delivery OS",
  description: "Community-powered delivery for Davis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
