import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { LayoutShell } from "@/components/ui/LayoutShell";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

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
    <html lang="en" className={dmSans.variable}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
        >
          Skip to main content
        </a>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
