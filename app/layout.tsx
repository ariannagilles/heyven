import type { Metadata, Viewport } from "next";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: "Heyven — insieme a chi ti capisce",
  description:
    "Uno spazio anonimo dove trovare persone che vivono quello che vivi tu, e un Mentore pronto ad ascoltarti. Prima della terapia, quando serve solo non sentirsi soli.",
  icons: {
    icon: "/icon-green.png",
    apple: "/icon-green.png",
  },
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
        <SplashScreen />
        <div className="pb-24">{children}</div>
        <BottomNav />
        <FeedbackWidget />
      </body>
    </html>
  );
}
