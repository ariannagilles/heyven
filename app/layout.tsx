import type { Metadata, Viewport } from "next";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";

export const metadata: Metadata = {
  title: "Heyven — comunità per la salute mentale",
  description:
    "Heyven è una community italiana, anonima e sicura, per parlare di salute mentale.",
};

export const viewport: Viewport = {
  themeColor: "#1a3a3a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-dvh bg-crema text-petrolio">
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
}
