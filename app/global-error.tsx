"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[heyven] global error:", error);
  }, [error]);

  return (
    <html lang="it">
      <body
        style={{
          backgroundColor: "#f5ead7",
          color: "#1a3a3a",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 8 }}>
            Qualcosa non ha funzionato
          </h1>
          <p style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: 16 }}>
            {error.message || "Errore inatteso."}
          </p>
          {error.digest && (
            <p style={{ fontFamily: "monospace", fontSize: "0.75rem", opacity: 0.4, marginBottom: 16 }}>
              {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              background: "#1a3a3a",
              color: "#f5ead7",
              border: "none",
              borderRadius: 9999,
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Riprova
          </button>
        </div>
      </body>
    </html>
  );
}
