"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[heyven] route error:", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
      <h1 className="text-xl font-semibold">Qualcosa non ha funzionato</h1>
      <p className="text-sm text-petrolio/70">
        {error.message || "Si è verificato un errore inatteso."}
      </p>
      {error.digest && (
        <p className="text-xs text-petrolio/40 font-mono">{error.digest}</p>
      )}
      <button onClick={reset} className="btn-primary">
        Riprova
      </button>
    </main>
  );
}
