"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Modal = null | "nickname" | "delete";

export default function ProfileSettings({
  userId,
  currentNickname,
}: {
  userId: string;
  currentNickname: string;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);

  useEffect(() => {
    if (!modal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModal(null);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modal]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <section id="impostazioni" className="card p-5 space-y-3 scroll-mt-20">
      <h2 className="text-sm font-medium text-petrolio/70">Impostazioni</h2>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setModal("nickname")}
          className="btn-outline w-full sm:w-auto sm:inline-flex justify-start"
        >
          Cambia nickname
        </button>
        <button
          type="button"
          onClick={() => setModal("delete")}
          className="btn-outline w-full sm:w-auto sm:inline-flex justify-start text-red-700 border-red-200 hover:bg-red-50"
        >
          Elimina account
        </button>
        <button
          type="button"
          onClick={logout}
          className="btn-ghost w-full sm:w-auto sm:inline-flex justify-start"
        >
          Esci
        </button>
      </div>

      {modal === "nickname" && (
        <ChangeNicknameModal
          userId={userId}
          currentNickname={currentNickname}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "delete" && (
        <DeleteAccountModal onClose={() => setModal(null)} />
      )}
    </section>
  );
}

function ChangeNicknameModal({
  userId,
  currentNickname,
  onClose,
}: {
  userId: string;
  currentNickname: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentNickname);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const next = value.trim();
    if (next.length < 2 || next.length > 24) {
      setError("Il nickname deve avere tra 2 e 24 caratteri.");
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(next)) {
      setError("Solo lettere, numeri, . _ -");
      return;
    }
    if (next === currentNickname) {
      onClose();
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: upErr } = await supabase
      .from("profiles")
      .update({ nickname: next })
      .eq("id", userId);
    setLoading(false);
    if (upErr) {
      setError(
        upErr.message.includes("unique") || upErr.code === "23505"
          ? "Nickname già in uso. Scegline un altro."
          : upErr.message,
      );
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <ModalShell onClose={onClose} title="Cambia nickname">
      <p className="text-sm text-petrolio/70">
        Il vecchio nickname non sarà più riconoscibile. I tuoi post resteranno,
        ma appariranno con il nuovo nickname.
      </p>
      <form onSubmit={save} className="space-y-3 mt-4">
        <label className="block">
          <span className="text-xs font-medium text-petrolio/70">
            Nuovo nickname
          </span>
          <input
            className="field mt-1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            required
          />
        </label>
        {error && (
          <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-outline"
          >
            Annulla
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Salvo…" : "Salva"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: rpcErr } = await supabase.rpc("delete_account");
    if (rpcErr) {
      setLoading(false);
      setError(rpcErr.message);
      return;
    }
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <ModalShell onClose={onClose} title="Elimina account">
      <p className="text-sm text-petrolio/70">
        Stai per eliminare definitivamente il tuo account. Verranno cancellati
        nickname, post, domande, storie, messaggi e chat. Questa azione non
        può essere annullata.
      </p>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2 mt-3">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 mt-5">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="btn-outline"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={loading}
          className="btn bg-red-600 text-white hover:bg-red-700"
        >
          {loading ? "Elimino…" : "Sì, elimina"}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-petrolio/40 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-crema rounded-3xl p-6 max-w-md w-full shadow-soft border border-petrolio/10 relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi"
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-petrolio/60 hover:bg-petrolio/5"
        >
          ✕
        </button>
        <h3 id="modal-title" className="text-lg font-semibold pr-8">
          {title}
        </h3>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
