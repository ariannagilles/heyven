import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";
import BottomNav from "@/components/BottomNav";
import SiteFooterGate from "@/components/SiteFooterGate";
import SplashScreen from "@/components/SplashScreen";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

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
  themeColor: "#0a2b25",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={fraunces.variable}>
      <body className="min-h-screen text-cream antialiased">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 min-h-screen"
          style={{
            background: `
              radial-gradient(90% 55% at 78% 6%, rgba(226,178,120,.32), rgba(226,178,120,0) 60%),
              radial-gradient(80% 50% at 12% 2%, rgba(93,202,165,.18), rgba(93,202,165,0) 55%),
              linear-gradient(168deg, #0a2b25 0%, #0c342b 46%, #173a2b 100%)
            `,
            backgroundAttachment: "fixed",
          }}
        />
        <SplashScreen />
        <div className="pb-28">
          {children}
          <SiteFooterGate />
        </div>
        <BottomNav />
        <FeedbackWidget />
      </body>
    </html>
  );
}
