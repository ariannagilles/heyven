"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("heyven_splash_shown");
    if (!alreadyShown) {
      setVisible(true);
      sessionStorage.setItem("heyven_splash_shown", "true");
      const t = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#04342C] flex items-center justify-center animate-[splashFade_2s_ease-out_forwards]">
      <img
        src="/logo-white.png"
        alt="heyven"
        width={180}
        height={80}
        style={{ objectFit: "contain" }}
        className="animate-[fadeInScale_1.4s_ease-out_forwards]"
      />
    </div>
  );
}
